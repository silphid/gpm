import { Command } from '@oclif/command'
import { perform } from '../performer'
import { Manifest } from '../manifest'
import * as commonFlags from '../commonFlags'
import * as git from '../git'
import { list } from '../list'

export default class Pull extends Command {
  static description = 'Pull selected packages.'

  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Pull)

    await perform(async (manifest: Manifest) => {
      await git.pull(manifest.name, manifest.dir)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}
