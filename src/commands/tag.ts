import { Command, flags } from '@oclif/command'
import { perform } from '../performer'
import * as commonFlags from '../commonFlags'
import { tag } from '../git'

export default class Tag extends Command {
  static description = 'Create and push tag in selected packages.'
  static args = [
    {
      name: 'name',
      required: true,
      description: 'name of tag to create'
    }
  ]
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt
  }

  async run() {
    const { args, flags } = this.parse(Tag)

    await perform(async manifest => {
      await tag(args.name, manifest.dir)
    }, flags)
  }
}
