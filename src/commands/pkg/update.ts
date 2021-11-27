import { Command } from '@oclif/command'
import { Manifest } from '../../manifest'
import { perform } from '../../performer'
import * as commonFlags from '../../commonFlags'
import { list } from '../../list'
import { adjust } from '../../adjust'

export default class Update extends Command {
  static aliases = ['pkg:up']
  static description =
    "[Deprecated: Use 'gpm adjust' instead] Adjust selected packages' dependencies to current branches and commits."
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Update)

    await perform(async (manifest: Manifest) => {
      await adjust(manifest, true)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}
