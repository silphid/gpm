import { Command } from '@oclif/command'
import { list } from '../list'
import * as commonFlags from '../commonFlags'
import { finishFeature, getCurrentFeature } from '../gitFlow'
import { perform } from '../performer'
import { Manifest } from '../manifest'
import * as s from '../style'
import { push } from '../git'

export default class Finish extends Command {
  static description = 'Finish feature branch in selected packages.'
  static args = [
    {
      name: 'name',
      required: false,
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
    const { args, flags } = this.parse(Finish)

    await perform(
      async (manifest: Manifest) => {
        const feature = args.name || (await getCurrentFeature(manifest.dir))
        if (!feature) {
          console.log(
            `Skipping ${s.pkg(
              manifest.name
            )} because no current feature and none specified explicitly`
          )
          return
        }
        console.log(`Finishing feature ${s.branch(feature)} in ${s.pkg(manifest.name)}`)
        await finishFeature(feature, manifest.dir)
        await push(manifest.name, manifest.dir)
      },
      flags,
      { reverseOrder: true }
    )

    if (flags.list) {
      await list()
    }
  }
}
