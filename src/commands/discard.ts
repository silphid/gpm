import { Command } from '@oclif/command'
import * as commonFlags from '../commonFlags'
import { list } from '../list'
import { discard } from '../discard'

export default class Discard extends Command {
  static description = 'Discard all local changes in selected packages.'

  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Discard)

    await discard(flags)

    if (flags.list) {
      await list()
    }
  }
}
