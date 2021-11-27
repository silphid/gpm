import * as fs from 'fs-extra'
import * as config from './config'
import { update } from './update'
import { getNameFromRepoUrl } from './core'

export async function init(
  repo: string,
  branch: string | undefined,
  masterBranch: string | undefined,
  developBranch: string | undefined,
  userName: string | undefined
) {
  const name = getNameFromRepoUrl(repo)
  await fs.ensureFile('gpm.yaml')
  await config.setValue('mainRepo', repo)
  await config.setValue('mainName', name)
  await config.setValue('mainBranch', branch || 'master')
  await update(
    { pull: true, links: true, all: true, current: false, prompt: false },
    masterBranch,
    developBranch,
    userName
  )
}
