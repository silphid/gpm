import { Command } from '@oclif/command'
import * as config from '../../config'

export default class ConfigGet extends Command {
  static description = 'Get value of given configuration property.'
  static args = [
    { name: 'key', description: 'key of property', required: true }
  ]

  async run() {
    const { args } = this.parse(ConfigGet)
    this.log(await config.getOptionalValue(args.key))
  }
}
