import { Command } from '@oclif/command'
import { performSingle } from '../performer'
import { Manifest } from '../manifest'
import * as commonFlags from '../commonFlags'
import { list } from '../list'
import * as symlinks from '../symlinks'

export default class Materialize extends Command {
  static description =
    'Remove symlinks and replace them with copies of original files.\n' +
    'To reverse this command, use the dematerialize command.\n\n' +
    'Warning: Use at your own risk, as you will be working with copies of your dependencies ' +
    "and changes to those won't appear in your actual dependency folders until you " +
    'dematerialize your links. That command can be useful very temporarily to work with tools ' +
    '(such as debuggers) that are unsettled by symlinks. You can only materialize links ' +
    'in a single module at once, to avoid having multiple copies of the same files and ' +
    'to make sure changes to those files can be copied back to the original files upon ' +
    'dematerialization.'

  static aliases = ['mat']

  static flags = {
    current: commonFlags.current,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Materialize)

    await performSingle(async (manifest: Manifest) => {
      await symlinks.materialize(manifest)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}
