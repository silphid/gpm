import { Manifest, ManifestKind } from './manifest'
import * as git from './git'
import { getLocalBranches } from './git'
import { Dependency } from './dependency'
import * as nerd from './nerdFont'
import * as s from './style'
import { Manifests } from './Manifests'
import * as _ from 'lodash'
import pMap from 'p-map'
import { separator } from './core'
import { isMaterialized } from './symlinks'
const tree = require('text-treeview')

export async function list(
  showLocalBranches: boolean = false,
  showRedundant: boolean = false,
  showSeparator = true
) {
  if (showSeparator) {
    await separator()
  }
  const manifests = await Manifests.load()
  manifests.requiredMain.markRedundantDependenciesRecursively()
  const obj = await formatManifest(manifests.requiredMain, showLocalBranches, showRedundant)
  process.stdout.write(tree([obj], { showRootLines: false }))
}

async function formatManifest(
  manifest: Manifest,
  showLocalBranches: boolean,
  showRedundant: boolean
): Promise<any> {
  const displayedNames: string[] = []
  const text = await getPackageText(
    manifest,
    undefined,
    undefined,
    showLocalBranches,
    displayedNames
  )
  const children = await formatDependencies(
    manifest,
    showLocalBranches,
    showRedundant,
    displayedNames
  )
  displayedNames.push(manifest.name)
  return {
    text: text,
    children: children
  }
}

async function formatDependencies(
  manifest: Manifest,
  showLocalBranches: boolean,
  showRedundant: boolean,
  displayedNames: string[]
): Promise<any[]> {
  const alreadyDisplayed = displayedNames.includes(manifest.name)
  if (manifest.dependencies.length && alreadyDisplayed && !showRedundant) return ['...']

  return await pMap(
    manifest.dependencies,
    async (x: Dependency) =>
      await formatDependency(x, showLocalBranches, showRedundant, displayedNames),
    { concurrency: 1 }
  )
}

async function formatDependency(
  dependency: Dependency,
  showLocalBranches: boolean,
  showRedundant: boolean,
  displayedNames: string[]
): Promise<any> {
  const dependencyManifest = dependency.requiredDependencyManifest
  let text = await getPackageText(
    dependencyManifest,
    dependency.branch,
    dependency.commit,
    showLocalBranches,
    displayedNames
  )
  if (dependency.isRedundant) {
    text += ` ${s.warn('redundant')}`
  }
  const children = await formatDependencies(
    dependencyManifest,
    showLocalBranches,
    showRedundant,
    displayedNames
  )
  displayedNames.push(dependency.name)
  return {
    text: text,
    children: children
  }
}

async function getPackageText(
  manifest: Manifest,
  dependencyBranch: string | undefined,
  dependencyCommit: string | undefined,
  showLocalBranches: boolean,
  displayedNames: string[]
): Promise<string> {
  const alreadyDisplayed = displayedNames.includes(manifest.name)
  let text = s.packageNameInList(manifest.name, manifest.selected && !alreadyDisplayed)

  if (alreadyDisplayed) return text

  if (manifest.kind === ManifestKind.Missing) {
    text += ` ${s.err('missing')}`
    return text
  }

  const currentBranch = (await git.getCurrentBranch(manifest.dir)) || s.warn('none')
  let branchText = await getBranchText(currentBranch, showLocalBranches, manifest)
  const markers = await getMarkers(manifest)
  text += ` ${branchText}${markers}`

  if (dependencyBranch && currentBranch !== dependencyBranch) {
    text += ` ${await nerd.mismatchedBranch(dependencyBranch)}`
  } else {
    const currentCommit = await git.getCurrentCommit(manifest.dir)
    if (dependencyCommit && currentCommit !== dependencyCommit) {
      text += ` ${await nerd.mismatchedCommit(dependencyCommit.substring(0, 8))}`
    }
  }

  const isMerging = await git.isMerging(manifest.dir)
  if (isMerging) {
    text += ` ${s.warn('merge')}`
  }

  return text
}

async function getBranchText(
  currentBranch: string,
  showLocalBranches: boolean,
  manifest: Manifest
) {
  let branchText: string
  if (showLocalBranches) {
    const localBranches = [
      currentBranch,
      ..._.without(await getLocalBranches(manifest.dir), currentBranch)
    ]
    branchText =
      (await nerd.branch('')) +
      localBranches.map(x => (x == currentBranch ? s.currentBranch(x) : s.branch(x))).join(', ')
  } else {
    branchText = await nerd.branch(currentBranch)
  }
  return branchText
}

async function getMarkers(manifest: Manifest): Promise<string> {
  const dir = manifest.dir
  const materialized = await isMaterialized(manifest)
  const pushableCount = await git.getPushableCommits(dir)
  const counts = await git.getChangeCount(dir)
  return (
    (await nerd.pushable(pushableCount)) +
    (await nerd.staged(counts.staged)) +
    (await nerd.modified(counts.modified)) +
    (await nerd.conflicted(counts.conflicted)) +
    (await nerd.materialized(materialized))
  )
}
