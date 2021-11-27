import { Command } from '@oclif/command'
import * as commonFlags from '../commonFlags'
import * as gitFlow from '../gitFlow'
import { perform } from '../performer'
import { Manifest } from '../manifest'

export default class Flow extends Command {
  static description = 'Configure git flow in selected packages.'
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list,
    master: commonFlags.master,
    develop: commonFlags.develop,
    user: commonFlags.user
  }

  async run() {
    const { flags } = this.parse(Flow)

    await perform(async (manifest: Manifest) => {
      await gitFlow.init(manifest.dir, flags.master, flags.develop, flags.user)
    }, flags)
  }
}
