import { Command, flags } from '@oclif/command'
import { perform } from '../performer'
import { Manifest } from '../manifest'
import * as commonFlags from '../commonFlags'
import * as git from '../git'
import { list } from '../list'
import { adjust } from '../adjust'
import { Manifests } from '../manifests'
import { getFeatureBranchName } from '../gitFlow'

export default class Merge extends Command {
  static description = 'Merge given branch of selected packages into current branch.'

  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list,
    feature: commonFlags.feature,
    abort: flags.boolean({
      description: 'abort current merge operation',
      required: false,
      default: false
    })
  }
  static args = [
    {
      name: 'branch',
      required: false,
      description: 'name of branch to merge into current branch'
    }
  ]

  async run() {
    const { flags, args } = this.parse(Merge)

    await perform(async (manifest: Manifest) => {
      if (flags.abort) {
        await abortMerge(manifest)
      } else {
        if (!args.branch) {
          throw new Error('BRANCH argument is required for this mode')
        }

        const branch = flags.feature
          ? await getFeatureBranchName(args.branch, manifest.dir)
          : args.branch

        await merge(manifest, branch)
      }
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}

async function merge(manifest: Manifest, branch: string) {
  if (
    !(await git.merge(manifest.name, branch, manifest.dir)) ||
    (await git.isFileConflicted(manifest.dir, manifest.requiredFile))
  ) {
    await git.resolve(manifest.requiredFile, 'theirs')
    await git.stage(manifest.requiredFile)
  }

  // Force manifest reload
  const manifests = await Manifests.load()
  manifest = manifests.findRequired(manifest.name)
  await adjust(manifest)
}

async function abortMerge(manifest: Manifest) {
  await git.abortMerge(manifest.name, manifest.dir)
}
