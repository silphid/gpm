import * as manif from './manifest'
import { InternalLink, Manifest } from './manifest'
import * as fs from 'fs-extra'
import * as path from 'path'
import * as s from './style'
import * as core from './core'
import * as git from './git'
import { Dependency } from './dependency'
import * as del from 'del'
const copy = require('recursive-copy')

const getSymlinks = require('get-symlinks')
const pathType = require('path-type')

interface Options {
  delete?: boolean
  create?: boolean
  materialize?: boolean
  dematerialize?: boolean
}

export async function deleteLinks(manifest: Manifest) {
  await process(manifest, { delete: true })
}

export async function createLinks(manifest: Manifest) {
  await process(manifest, { create: true, delete: true })
}

export async function materialize(manifest: Manifest) {
  await process(manifest, { materialize: true })
}

export async function dematerialize(manifest: Manifest) {
  await process(manifest, { dematerialize: true })
}

async function process(manifest: Manifest, options: Options) {
  if (!manifest.links) {
    return
  }

  if (options.delete) {
    await processDeleteLinks(manifest)
  }

  if (options.create || options.materialize || options.dematerialize) {
    const action = options.materialize
      ? 'Materializing'
      : options.dematerialize
      ? 'Dematerializing'
      : 'Creating'

    if (manifest.links.internals) {
      console.log(`${action} internal symlinks:`)
      await processInternalLinks(manifest, manifest.links.internals, options)
    }

    if (manifest.links.imports && manifest.dependencies.length > 0) {
      console.log(`${action} external symlinks:`)
      await processExternalLinksRecursively(manifest, manifest, [], options)
    }
  }
}

async function processDeleteLinks(manifest: Manifest) {
  if (manifest.links && manifest.links.imports) {
    const dir = path.join(manifest.dir, manifest.links.imports)
    const links = await getSymlinks('**', { cwd: dir, onlyDirectories: true })
    if (links.length) {
      console.log('Deleting symlinks:')
      for (const link of links) {
        const linkName = path.basename(link)
        console.log(
          `${s.pkg(manifest.name)}${s.path(
            '/' + formatLinksBase(manifest.links.imports)
          )}${s.symlink(linkName)}`
        )
        await fs.unlink(link)
      }
    }
  }
}

async function processInternalLinks(
  manifest: Manifest,
  internals: InternalLink[],
  options: Options
) {
  for (const internal of internals) {
    await processInternalLink(manifest, internal, options)
  }
}

async function processInternalLink(manifest: Manifest, internal: InternalLink, options: Options) {
  const linkSource = path.join(manifest.dir, internal.source)
  const linkTarget = path.join(manifest.dir, internal.target)
  const targetBase = path.dirname(internal.target)
  const targetName = path.basename(internal.target)

  console.log(
    `${s.pkg(manifest.name)}${s.path('/' + targetBase + '/')}${s.symlink(targetName)} -> ${s.pkg(
      manifest.name
    )}${s.path('/' + internal.source)}`
  )

  await processLink(manifest, linkSource, linkTarget, false, options)
}

async function processExternalLinksRecursively(
  targetManifest: Manifest,
  currentManifest: Manifest,
  completedNames: string[],
  options: Options
) {
  for (const dependency of currentManifest.dependencies) {
    // Skip duplicates
    if (completedNames.includes(dependency.name)) continue
    completedNames.push(dependency.name)

    const dependencyManifest = await manif.getManifestByName(dependency.name)
    if (dependencyManifest) {
      await processExternalLink(dependencyManifest, targetManifest, dependency, options)
      await processExternalLinksRecursively(
        targetManifest,
        dependencyManifest,
        completedNames,
        options
      )
    }
  }
}

async function processExternalLink(
  sourceManifest: Manifest,
  targetManifest: Manifest,
  dependency: Dependency,
  options: Options
) {
  if (
    !sourceManifest.links ||
    !sourceManifest.links.exports ||
    !targetManifest.links ||
    !targetManifest.links.imports
  ) {
    return
  }

  const imports = targetManifest.links.imports
  const exports = sourceManifest.links.exports
  const sourceDir = sourceManifest.dir
  const targetDir = targetManifest.dir

  if (typeof exports === 'string') {
    await processSingleExport(<string>exports)
  } else {
    await processMultipleExports()
  }

  async function processSingleExport(exportPath: string) {
    const linkSource = core.joinPath(sourceDir, exportPath)
    const linkTarget = core.joinPath(targetDir, imports, dependency.name)

    await process(sourceManifest, targetManifest, linkSource, linkTarget, false, options)
  }

  async function processMultipleExports() {
    for (const key in exports) {
      if (exports.hasOwnProperty(key)) {
        const value = exports[key]
        const linkSource = core.joinPath(sourceDir, value)
        const linkTarget = core.joinPath(targetDir, imports, dependency.name, key)

        await process(sourceManifest, targetManifest, linkSource, linkTarget, true, options)
      }
    }
  }

  async function process(
    sourceManifest: Manifest,
    targetManifest: Manifest,
    linkSource: string,
    linkTarget: string,
    gitIgnoreOneLevelHigher: boolean,
    options: Options
  ) {
    const shortSource = linkSource.replace(sourceManifest.dir, '')
    const shortTarget = linkTarget.replace(targetManifest.dir, '')
    const targetBase = path.dirname(shortTarget)
    const targetName = path.basename(shortTarget)

    console.log(
      `${s.pkg(targetManifest.name)}${s.path(formatLinksBase(targetBase))}${s.symlink(
        targetName
      )} -> ${s.pkg(sourceManifest.name)}${s.path(shortSource)}`
    )

    await processLink(sourceManifest, linkSource, linkTarget, gitIgnoreOneLevelHigher, options)
  }
}

async function processLink(
  sourceManifest: Manifest,
  linkSource: string,
  linkTarget: string,
  gitIgnoreOneLevelHigher: boolean,
  options: Options
) {
  const targetParent = path.dirname(linkTarget)

  await prepare()
  await process()
  await addToGitIgnore()

  async function prepare() {
    if (await pathType.symlink(linkTarget)) {
      if (options.dematerialize) throw new Error(`Symlink already dematerialized: ${linkTarget}`)
      await fs.unlink(linkTarget)
    } else if (await fs.pathExists(linkTarget)) {
      if (options.dematerialize) {
      } else if (options.materialize) throw new Error(`Symlink already materialized: ${linkTarget}`)
      else
        throw new Error(
          `Cannot create symlink in place of existing file or directory: ${linkTarget}`
        )
    }
  }

  async function process() {
    await fs.ensureDir(targetParent)

    if (options.materialize) await processMaterialize()
    else if (options.dematerialize) await processDematerialize()
    else await processCreateLink()
  }

  async function processMaterialize() {
    await copyRecursively(linkSource, linkTarget, 'symlink')
    await setMaterialized(sourceManifest, true)
  }

  async function processDematerialize() {
    await copyRecursively(linkTarget, linkSource, 'original')
    await del(linkTarget, { force: true })
    await processCreateLink()
    await setMaterialized(sourceManifest, false)
  }

  async function copyRecursively(source: string, target: string, destinationName: string) {
    const results = await copy(source, target, { overwrite: true })
    console.info(`Copied ${results.length} files to ${destinationName} location`)
  }

  async function processCreateLink() {
    await fs.symlink(linkSource, linkTarget, 'dir')
  }

  async function addToGitIgnore() {
    const gitIgnoreDir = gitIgnoreOneLevelHigher ? path.dirname(targetParent) : targetParent
    const gitIgnorePattern = path.basename(
      gitIgnoreOneLevelHigher ? path.dirname(linkTarget) : linkTarget
    )
    await git.ignore(gitIgnoreDir, gitIgnorePattern)
  }
}

function formatLinksBase(linksBase: string | undefined | null) {
  return linksBase && linksBase.length ? linksBase + '/' : '/'
}

function getMaterializedMarkerFile(manifest: Manifest): string {
  return path.join(manifest.dir, 'MATERIALIZED')
}

export async function isMaterialized(manifest: Manifest): Promise<boolean> {
  return fs.pathExists(getMaterializedMarkerFile(manifest))
}

async function setMaterialized(manifest: Manifest, value: boolean) {
  if (value) return fs.createFile(getMaterializedMarkerFile(manifest))
  else return fs.remove(getMaterializedMarkerFile(manifest))
}
