import { Command } from '@oclif/command'
import { perform } from '../performer'
import { Manifest } from '../manifest'
import * as commonFlags from '../commonFlags'
import { list } from '../list'
import * as symlinks from '../symlinks'

export default class Link extends Command {
  static description = 'Create symlinks in selected packages.'

  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Link)

    await perform(async (manifest: Manifest) => {
      await symlinks.createLinks(manifest)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}
