import { Command } from '@oclif/command'
import { list } from '../list'
import * as commonFlags from '../commonFlags'
import { startFeature } from '../gitFlow'
import { perform } from '../performer'
import { Manifest } from '../manifest'
import * as s from '../style'

export default class Start extends Command {
  static description = 'Create feature branch in selected packages.'
  static args = [
    {
      name: 'name',
      required: true,
      description: "name of feature (branch name will be 'feature/{username}/{feature}')"
    }
  ]
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { args, flags } = this.parse(Start)

    await perform(async (manifest: Manifest) => {
      console.log(`Starting feature ${s.branch(args.name)} in ${s.pkg(manifest.name)}`)
      await startFeature(args.name, manifest.dir)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}
