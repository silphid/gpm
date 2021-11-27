import { Command } from '@oclif/command'
import * as config from '../../config'

export default class ConfigSet extends Command {
  static description = 'Set configuration property to given value.'
  //static aliases = ['config']
  static args = [
    { name: 'key', description: 'key of property', required: true },
    { name: 'value', description: 'value of property', required: true }
  ]

  async run() {
    const { args } = this.parse(ConfigSet)

    if (args.value === 'true') args.value = true
    else if (args.value === 'false') args.value = false

    await config.setValue(args.key, args.value)
  }
}
