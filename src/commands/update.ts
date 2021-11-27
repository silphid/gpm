import { Command, flags } from '@oclif/command'
import { update } from '../update'
import { list } from '../list'
import * as commonFlags from '../commonFlags'

export default class Update extends Command {
  static description =
    'Update dependencies of selected packages (pull registry, clone/pull packages, create symlinks).'
  static aliases = ['up']
  static flags = {
    pull: flags.boolean({
      char: 'p',
      description: 'whether to pull changes',
      allowNo: true,
      required: false,
      default: true
    }),
    links: flags.boolean({
      char: 'l',
      description: 'whether to create symlinks',
      allowNo: true,
      required: false,
      default: true
    }),
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Update)
    await update(flags)

    if (flags.list) {
      await list()
    }
  }
}
