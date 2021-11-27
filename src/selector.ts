import * as config from './config'
import { prompt } from 'enquirer'
import { Manifests } from './Manifests'

export async function getSelection(): Promise<string[]> {
  return (await config.getOptionalValue('selection')) || []
}

export async function select() {
  const manifests = await Manifests.load()
  const packageNames = manifests.all.map((x) => x.name)
  const selection = (await getSelection()).filter((x) => packageNames.includes(x))
  const answer: any = await prompt({
    type: 'multiselect',
    name: 'values',
    message: 'Select packages to include in workspace',
    choices: packageNames,
    initial: selection,
  })

  await config.setValue('selection', answer.values)
}

export async function getPromptedSelection(): Promise<string[]> {
  const manifests = await Manifests.load()
  const packageNames = manifests.all.map((x) => x.name)
  const answer: any = await prompt({
    type: 'multiselect',
    name: 'values',
    message: 'Select packages',
    choices: packageNames,
  })

  return answer.values
}

export async function getPromptedSingleSelection(): Promise<string[]> {
  const manifests = await Manifests.load()
  const packageNames = manifests.all.map((x) => x.name)
  const answer: any = await prompt({
    type: 'select',
    name: 'values',
    message: 'Select single package',
    choices: packageNames,
  })

  return answer.values
}

export async function selectAll() {
  const manifests = await Manifests.load()
  const packageNames = manifests.all.map((x) => x.name)
  await config.setValue('selection', packageNames)
}

export async function selectNone() {
  const manifests = await Manifests.load()
  await config.setValue('selection', [])
}

export async function selectCurrent() {
  const manifests = await Manifests.load()
  await config.setValue('selection', manifests.requiredCurrent.name)
}
