import { Command, flags } from '@oclif/command'
import * as selector from '../selector'
import { list } from '../list'
import * as commonFlags from '../commonFlags'

export default class Select extends Command {
  static description = 'Select which packages to include by default in all commands.'
  static aliases = ['s']
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    none: flags.boolean({
      char: 'n',
      description: 'deselect all packages',
      default: false,
      exclusive: ['current', 'all']
    }),
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Select)

    if (flags.all) {
      await selector.selectAll()
    } else if (flags.none) {
      await selector.selectNone()
    } else if (flags.current) {
      await selector.selectCurrent()
    } else {
      await selector.select()
    }

    if (flags.list) {
      await list()
    }
  }
}
