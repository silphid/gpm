import { prompt } from 'enquirer'
import { perform } from './performer'
import { Manifest } from './manifest'
import * as git from './git'

async function confirm(): Promise<boolean> {
  return ((await prompt({
    type: 'confirm',
    name: 'value',
    message:
      'Are you sure you want to discard all local changes from selected packages?'
  })) as any).value
}

export async function discard(flags: any): Promise<boolean> {
  if (!(await confirm())) {
    return false
  }

  await perform(async (manifest: Manifest) => {
    await git.discardAll(manifest.name, manifest.dir)
  }, flags)

  return true
}
