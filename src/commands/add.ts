import { Command } from '@oclif/command'
import { list } from '../list'
import { perform } from '../performer'
import { Manifest } from '../manifest'
import * as commonFlags from '../commonFlags'
import { addAll } from '../git'

export default class Add extends Command {
  static description = 'Stage all changes in selected packages.'
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Add)

    await perform(async (manifest: Manifest) => {
      await addAll(manifest.name, manifest.dir)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}
