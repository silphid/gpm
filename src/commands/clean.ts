import { Command } from '@oclif/command'
import { Manifest } from '../manifest'
import { perform } from '../performer'
import * as commonFlags from '../commonFlags'
import { Manifests } from '../manifests'
import { list } from '../list'

export default class Clean extends Command {
  static description = 'Remove redundant dependencies.'
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }

  async run() {
    const { flags } = this.parse(Clean)

    const manifests = await Manifests.load()
    manifests.requiredMain.markRedundantDependenciesRecursively()

    let changed = false

    await perform(
      async (manifest: Manifest) => {
        if (await clean(manifest)) {
          changed = true
        }
      },
      flags,
      { manifests }
    )

    if (changed) {
      if (flags.list) {
        await list()
      }
    } else {
      console.log('No redundant dependencies detected.')
    }
  }
}

async function clean(manifest: Manifest): Promise<boolean> {
  let changed = false

  for (const dependency of [...manifest.dependencies]) {
    if (dependency.isRedundant) {
      if (!changed) {
        console.log(`Detected redundant dependencies in ${manifest.styledName}`)
      }
      console.log(`> Removing ${dependency.styledName}`)
      manifest.removeDependency(dependency)
      changed = true
    }
  }

  if (changed) {
    await manifest.write()
  }

  return changed
}
