import { Command } from '@oclif/command'
import * as config from '../../config'
import * as _ from 'lodash'

export default class ConfigLs extends Command {
  static description = 'List all configuration properties.'

  async run() {
    const cfg = await config.load()
    _.forEach(cfg, (value, key) => this.log(`${key} = ${value}`))
  }
}
