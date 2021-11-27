import { Command, flags } from '@oclif/command'
import { Manifest } from '../manifest'
import { perform } from '../performer'
import * as commonFlags from '../commonFlags'
import { list } from '../list'
import { adjust } from '../adjust'

export default class Adjust extends Command {
  static description = "Adjust selected packages' dependencies to current branches and commits."
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list,
    dependants: flags.boolean({
      char: 'd',
      description: 'adjust manifests of dependant packages instead of selected packages themselves',
      required: false,
      default: false
    })
  }

  async run() {
    const { flags } = this.parse(Adjust)

    await perform(async (manifest: Manifest) => {
      await adjust(manifest, flags.dependants)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}
