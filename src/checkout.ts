import * as git from './git'
import { Manifest, ManifestKind } from './manifest'

export async function checkOut(
  manifest: Manifest,
  branch: string | undefined,
  useDependencyCommit: boolean = false,
  useDependencyBranch: boolean = false,
  create: boolean = false
) {
  if (manifest.kind !== ManifestKind.Present) {
    return
  }

  if (useDependencyBranch || useDependencyCommit) {
    if (branch) {
      throw new Error('branch name cannot be specified in conjunction with --commit flag')
    }

    if (manifest.dependentsManifests.length) {
      if (useDependencyBranch) {
        branch = manifest.getRepoAndBranchForDependents().branch
      } else if (useDependencyCommit) {
        branch = manifest.getCommitForDependents()
      }
    }

    if (!branch) return
  } else if (!branch) {
    throw new Error('branch must be specified when neither --branch nor --commit flag is specified')
  }

  await git.checkOut(manifest.name, manifest.dir, branch, create)
}
