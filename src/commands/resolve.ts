import { Command, flags } from '@oclif/command'
import { perform } from '../performer'
import { Manifest } from '../manifest'
import * as commonFlags from '../commonFlags'
import { list } from '../list'
import * as git from '../git'

export default class Resolve extends Command {
  static description = 'Resolve conflicts in manifest files of selected packages.'

  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list,
    ours: flags.boolean({
      char: 'o',
      description: 'whether to resolve using ours (HEAD)',
      default: false,
      exclusive: ['theirs']
    }),
    theirs: flags.boolean({
      char: 't',
      description: 'whether to resolve using theirs (HEAD)',
      default: false,
      exclusive: ['ours']
    })
  }

  async run() {
    const { flags } = this.parse(Resolve)

    await perform(async (manifest: Manifest) => {
      await resolve(manifest, flags.ours || !flags.theirs ? 'ours' : 'theirs')
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}

async function resolve(manifest: Manifest, using: 'ours' | 'theirs') {
  await git.resolve(manifest.requiredFile, using)
}
