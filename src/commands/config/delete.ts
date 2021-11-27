import { Command } from '@oclif/command'
import * as config from '../../config'

export default class ConfigDelete extends Command {
  static description = 'Delete given config property.'
  static args = [
    { name: 'key', description: 'key of property', required: true }
  ]

  async run() {
    const { args } = this.parse(ConfigDelete)
    await config.deleteValue(args.key)
  }
}
