import { exec } from './core'
import {
  branchExists,
  fetchRemoteBranch,
  getConfig,
  getCurrentBranch,
  getRequiredCurrentBranch,
  setConfig
} from './git'
import * as s from './style'
import * as os from 'os'

export async function getCurrentFeature(cwd: string): Promise<string | undefined> {
  const branch = await getCurrentBranch(cwd)
  if (!branch) return undefined
  const matches = branch.match(/\/([^/]+)$/)
  return (matches && matches[1]) || undefined
}

export async function startFeature(name: string, cwd: string) {
  await exec('git', ['flow', 'feature', 'start', name], cwd, `Failed to start feature`)
  const branch = await getRequiredCurrentBranch(cwd)
  await exec('git', ['push', '-u', 'origin', branch], cwd, `Failed to track feature branch`)
}

export async function finishFeature(name: string, cwd: string) {
  await exec('git', ['flow', 'feature', 'finish', name], cwd, `Failed to finish feature`, {
    env: { GIT_MERGE_AUTOEDIT: 'no' }
  })
}

async function fetchRemoteBranchIfMissing(branch: string, cwd: string) {
  if (!(await branchExists(branch, cwd))) {
    try {
      await fetchRemoteBranch(branch, cwd)
    } catch {
      console.log(
        s.warnMsg(
          `Git-flow will not be enabled because branch ${s.branch(
            branch
          )} could not be fetched for ${cwd}.`
        )
      )
    }
  }
}

export async function init(
  cwd: string,
  masterBranch: string | undefined,
  developBranch: string | undefined,
  userName: string | undefined
) {
  masterBranch = masterBranch || 'master'
  developBranch = developBranch || 'develop'
  userName = userName || os.userInfo().username

  await fetchRemoteBranchIfMissing(masterBranch, cwd)
  await fetchRemoteBranchIfMissing(developBranch, cwd)
  await setConfig('branch.master.merge', `refs/heads/${masterBranch}`, cwd)
  await setConfig('branch.develop.merge', `refs/heads/${developBranch}`, cwd)
  await setConfig('gitflow.branch.master', masterBranch, cwd)
  await setConfig('gitflow.branch.develop', developBranch, cwd)
  await setConfig('gitflow.prefix.feature', `feature/${userName}/`, cwd)
  await setConfig('gitflow.prefix.release', 'release/', cwd)
  await setConfig('gitflow.prefix.hotfix', 'hotfix/', cwd)
  await setConfig('gitflow.prefix.support', 'support/', cwd)
  await setConfig('gitflow.prefix.versiontag', '', cwd)
}

export async function getFeatureBranchName(feature: string, cwd: string) {
  return (await getConfig('gitflow.prefix.feature', cwd)) + feature
}
