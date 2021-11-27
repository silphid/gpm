import { Command } from '@oclif/command'
import { prompt } from 'enquirer'
import { getAllLocalManifests, Manifest } from '../manifest'
import { perform } from '../performer'
import * as commonFlags from '../commonFlags'
import { addDependencies } from '../pkgAdd'
import { list } from '../list'

export default class Import extends Command {
  static description = 'Add a dependency to selected packages.'
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt,
    list: commonFlags.list
  }
  static args = [
    {
      name: 'name',
      required: false,
      description: 'Name of dependency to add (defaults to prompting user)'
    },
    {
      name: 'branch',
      required: false,
      description: 'Branch of dependency (defaults to currently checked out branch)'
    }
  ]

  async run() {
    const { flags, args } = this.parse(Import)

    const dependencyNames = await getDependencyNames(args.name)

    await perform(async (manifest: Manifest) => {
      await addDependencies(manifest, dependencyNames)
    }, flags)

    if (flags.list) {
      await list()
    }
  }
}

async function getDependencyNames(name: string): Promise<string[]> {
  if (name) return [name]

  const manifests = await getAllLocalManifests()
  const answer: any = await prompt({
    type: 'multiselect',
    name: 'values',
    choices: manifests.map(x => x.name),
    message: 'Select dependencies to add'
  })

  return answer.values
}
