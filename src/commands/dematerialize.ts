import { Command } from '@oclif/command'
import { perform, performSingle } from '../performer'
import { Manifest } from '../manifest'
import * as commonFlags from '../commonFlags'
import { list } from '../list'
import * as symlinks from '../symlinks'

export default class Dematerialize extends Command {
  static description =
    'Reverse materialize command by copying files back to their original dependency locations and recreating symlinks pointing to them.'
  static aliases = ['demat']

  static flags = {
    current: commonFlags.current,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Dematerialize)

    await performSingle(async (manifest: Manifest) => {
      await symlinks.dematerialize(manifest)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}
