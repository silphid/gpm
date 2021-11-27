import { Command, flags } from '@oclif/command'
import { list } from '../list'

export default class List extends Command {
  static description =
    'List all packages hierarchically, with their current branch.\nIf there is a mismatch between currently checked out branch and branch expected in dependency, it also displays a warning.'
  static aliases = ['ls', 'l']

  static flags = {
    branches: flags.boolean({
      char: 'b',
      description: 'list all local branches',
      allowNo: false,
      required: false,
      default: false
    }),
    all: flags.boolean({
      char: 'a',
      description: 'do not skip redundant sub-trees',
      allowNo: false,
      required: false,
      default: false
    })
  }

  async run() {
    const { flags } = this.parse(List)
    await list(flags.branches, flags.all, false)
  }
}
