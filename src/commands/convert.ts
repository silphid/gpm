import { Command } from '@oclif/command'
import { prompt } from 'enquirer'
import * as core from '../core'
import * as git from '../git'
import * as s from '../style'
import * as path from 'path'
import * as _ from 'lodash'
import { getManifestByName, getManifestFile, Manifest } from '../manifest'
import { Dependency } from '../dependency'
import { addDependencies } from '../pkgAdd'
import { Manifests } from '../manifests'
import { list } from '../list'
import * as commonFlags from '../commonFlags'

export default class Convert extends Command {
  static description = 'Convert existing Git repository to GPM package.'
  static flags = {
    list: commonFlags.list
  }
  static args = [
    {
      name: 'repo',
      required: false,
      description: 'URL of Git repository to convert to package'
    }
  ]

  async run() {
    const { args, flags } = this.parse(Convert)

    const url = await getUrl(args.repo)
    const name = core.getNameFromRepoUrl(url)
    const dir = await clone(name, url, args.branch)
    const branch = await getAndCheckOutBranch(name, dir)
    const dependencies = await getPackages('Select packages to add as dependencies', [name])
    const dependents = await getPackages('Select packages to make dependent on this package', [
      name,
      ...dependencies
    ])
    await createManifest(dir, name, url, dependencies)
    await addToDependents(name, branch, dependents)

    if (flags.list) {
      await list()
    }
  }
}

async function getUrl(repository: string) {
  if (repository) return repository

  const answer: any = await prompt({
    type: 'input',
    name: 'value',
    message: 'Git URL of repository to convert to package'
  })

  return answer.value
}

async function getAndCheckOutBranch(name: string, dir: string): Promise<string> {
  const branches = await git.getAllBranches(dir)

  const answer: any = await prompt({
    type: 'select',
    name: 'value',
    choices: ['<create new>', ...branches],
    message: 'Select branch to use'
  })

  const create = answer.value === '<create new>'

  let branch: string
  if (create) {
    const answer: any = await prompt({
      type: 'input',
      name: 'value',
      initial: 'develop',
      message: 'Name of branch to create'
    })
    branch = answer.value
  } else {
    branch = answer.value
  }

  await git.checkOut(name, dir, branch, create)
  return branch
}

async function clone(
  name: string,
  repository: string,
  branch: string | undefined
): Promise<string> {
  console.log(`Cloning ${s.pkg(name)}`)
  const rootDir = await core.getRequiredRootDir()
  const dir = path.join(rootDir, name)
  await git.clone(name, repository, dir, branch)
  return dir
}

async function getPackages(message: string, excluding: string[]) {
  const manifests = await Manifests.load()
  const packages = _.without(manifests.all.map(x => x.name), ...excluding)

  const answer: any = await prompt({
    type: 'multiselect',
    name: 'values',
    choices: packages,
    message: message
  })

  return answer.values
}

async function createManifest(
  dir: string,
  name: string,
  repository: string,
  dependencyNames: string[]
) {
  const manifests = await Manifests.load()
  const file = await getManifestFile(name)
  const manifest = new Manifest(
    file,
    false,
    dir,
    name,
    undefined,
    await Promise.all<Dependency>(
      dependencyNames.map(async (name: string) => createDependency(name, manifests))
    )
  )

  await manifest.write()
}

async function createDependency(name: string, manifests: Manifests) {
  const manifest = manifests.findRequired(name)
  const repo = await git.getOrigin(manifest.dir)
  const branch = await manifest.getBranch()
  const commit = await manifest.getCommit()
  return new Dependency(repo, branch, commit)
}

async function addToDependents(name: string, branch: string, dependentNames: string[]) {
  for (const dependentName of dependentNames) {
    const manifest = await getManifestByName(dependentName)
    if (!manifest) {
      throw new Error(`Missing manifest for ${s.pkg(dependentName)}`)
    }
    await addDependencies(manifest, [name], branch)
  }
}
