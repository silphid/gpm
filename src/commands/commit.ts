import { Command, flags } from '@oclif/command'
import { list } from '../list'
import { perform } from '../performer'
import { Manifest } from '../manifest'
import * as commonFlags from '../commonFlags'
import { addAll, commit, hasChanges } from '../git'
import * as s from '../style'

export default class Commit extends Command {
  static description = 'Commit all staged changes in selected packages.'

  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list,
    staged: flags.boolean({
      char: 's',
      description: 'only commit staged changes',
      allowNo: false,
      required: false,
      default: false
    })
  }

  static args = [
    {
      name: 'message',
      required: true,
      description: 'commit message'
    }
  ]

  async run() {
    const { args, flags } = this.parse(Commit)

    await perform(
      async (manifest: Manifest) => {
        if (await hasChanges(manifest.dir)) {
          if (!flags.staged) {
            await addAll(manifest.name, manifest.dir)
          }
          await commit(manifest.name, args.message, manifest.dir)
        } else {
          console.log(`Skipping unchanged ${s.pkg(manifest.name)}`)
        }
      },
      flags,
      { reverseOrder: true }
    )

    if (flags.list) {
      await list()
    }
  }
}
