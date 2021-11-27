import { Manifest, ManifestKind } from './manifest'
import * as symlinks from './symlinks'
import * as core from './core'
import * as git from './git'
import { perform, PerformFlags } from './performer'
import * as gitFlow from './gitFlow'

type UpdateFlags = PerformFlags & {
  pull: boolean
  links: boolean
}

export async function update(
  flags: UpdateFlags,
  masterBranch?: string,
  developBranch?: string,
  userName?: string
) {
  if (flags.pull) {
    // Pull packages
    await perform(
      async manifest => {
        await pullPackage(manifest)
        await gitFlow.init(manifest.dir, masterBranch, developBranch, userName)
        await git.init(manifest.dir)
      },
      flags,
      { includeMissing: true, reloadManifests: true }
    )
  }

  // Create symlinks
  if (flags.links) {
    await perform(async manifest => {
      await symlinks.createLinks(manifest)
    }, flags)
  }
}

async function pullPackage(manifest: Manifest) {
  const mainPackage = await core.getMainPackageName()
  if (manifest.name === mainPackage) {
    await pullMainPackage(manifest)
  } else {
    await pullSubPackage(manifest)
  }
}

async function pullMainPackage(manifest: Manifest) {
  // If main package already checked out, use currently checked-out branch, otherwise use config
  const branch =
    manifest.kind === ManifestKind.Present ? undefined : await core.getMainPackageBranch()

  const repo = await core.getMainPackageRepo()

  await git.pullOrClone(manifest.name, repo, manifest.dir, branch)
}

async function pullSubPackage(manifest: Manifest) {
  const { repo, branch } = manifest.getRepoAndBranchForDependents()
  await git.pullOrClone(manifest.name, repo, manifest.dir, branch)
}
