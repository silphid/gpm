import { Command, flags } from '@oclif/command'
import { checkOut } from '../checkout'
import { list } from '../list'
import { perform } from '../performer'
import * as commonFlags from '../commonFlags'
import { discard } from '../discard'
import { getFeatureBranchName } from '../gitFlow'
import { separator } from '../core'

export default class Checkout extends Command {
  static description =
    'Checkout given branch in selected packages (or appropriate branch, if none specified).'
  static aliases = ['co']

  static flags = {
    create: flags.boolean({
      char: 'b',
      description: 'create a new branch if it does not already exist',
      allowNo: false,
      required: false,
      default: false
    }),
    commit: flags.boolean({
      char: 'C',
      description: 'checkout dependency commit specified in dependent manifests',
      allowNo: false,
      required: false,
      default: false,
      exclusive: ['create', 'feature', 'branch']
    }),
    branch: flags.boolean({
      char: 'B',
      description: 'checkout dependency branch specified in dependent manifests',
      allowNo: false,
      required: false,
      default: false,
      exclusive: ['create', 'feature', 'commit']
    }),
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list,
    feature: commonFlags.feature,
    discard: commonFlags.discard
  }

  static args = [
    {
      name: 'branch',
      required: false,
      description: 'branch/tag/commit to checkout in current package'
    }
  ]

  async run() {
    const { args, flags } = this.parse(Checkout)

    if (flags.discard && !(await discard(flags))) {
      return
    }

    if (!args.branch && !(flags.branch || flags.commit)) {
      throw new Error(
        'branch must be specified when neither --branch nor --commit flag is specified'
      )
    }

    await perform(
      async (manifest, _) => {
        const branch = flags.feature
          ? await getFeatureBranchName(args.branch, manifest.dir)
          : args.branch
        await checkOut(manifest, branch, flags.commit, flags.branch, flags.create)
      },
      flags,
      { includeMissing: true }
    )

    if (flags.list) {
      await list()
    }
  }
}
