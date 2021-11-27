import { Command, flags } from '@oclif/command'
import { perform } from '../performer'
import * as commonFlags from '../commonFlags'
import { Manifest } from '../manifest'
import { branchExists, deleteBranch } from '../git'
import * as s from '../style'
import { getFeatureBranchName } from '../gitFlow'
import { list } from '../list'

export default class Delete extends Command {
  static description = 'Delete local (and optionally remote) branch in selected packages.'
  static aliases = ['del']

  static args = [
    {
      name: 'branch',
      required: true,
      description: 'name of branch to delete'
    }
  ]

  static flags = {
    remote: flags.boolean({
      char: 'r',
      description: 'also delete remote branch',
      allowNo: true,
      required: false,
      default: false
    }),
    feature: commonFlags.feature,
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { args, flags } = this.parse(Delete)

    await perform(async (manifest: Manifest) => {
      const branch = flags.feature
        ? await getFeatureBranchName(args.branch, manifest.dir)
        : args.branch
      await performDelete(branch, flags.remote, manifest)
    }, flags)

    if (flags.list) {
      await list(true)
    }
  }
}

async function performDelete(branch: string, remote: boolean, manifest: Manifest) {
  if (await branchExists(branch, manifest.dir)) {
    console.log(`Deleting local branch ${s.branch(branch)} of ${s.pkg(manifest.name)}`)
    await deleteBranch(branch, manifest.dir, false)
  } else {
    console.log(`Skipping non-existing local branch ${s.branch(branch)} of ${s.pkg(manifest.name)}`)
  }

  if (remote) {
    console.log(`Deleting remote branch ${s.branch(branch)} of ${s.pkg(manifest.name)}`)
    await deleteBranch(branch, manifest.dir, true)
  }
}
