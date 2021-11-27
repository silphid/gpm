import * as fs from 'fs-extra'
import * as path from 'path'
import * as readline from 'readline'
import * as s from './style'
import { exec, execWithStdout } from './core'
import * as config from './config'
import * as nerd from './nerdFont'
import * as _ from 'lodash'
import { matches } from './regex'

const conflictStatuses = ['DD', 'AU', 'UD', 'UA', 'DU', 'AA', 'UU']

export async function execGitCommand(name: string, cwd: string, argv: string[]) {
  await exec('git', argv, cwd, `Failed to execute git ${argv[0]} in ${cwd}`)
}

export async function checkOut(name: string, cwd: string, branch: string, create: boolean = false) {
  const currentBranch = await getCurrentBranch(cwd)
  if (currentBranch !== branch) {
    console.log(`Checking out ${s.pkg(name)} ${await nerd.branch(branch)}`)
    const args = create ? ['checkout', '-b', branch] : ['checkout', branch]
    await exec('git', args, cwd)
    if (create) {
      await exec('git', ['config', `branch.${branch}.remote`, 'origin'], cwd)
      await exec('git', ['config', `branch.${branch}.merge`, `refs/heads/${branch}`], cwd)
      await exec('git', ['config', `branch.${branch}.rebase`, 'false'], cwd)
    }
  }
}

export async function pull(name: string, cwd: string, branch?: string) {
  console.log(`Pulling ${s.pkg(name)}`)
  await exec('git', ['pull'], cwd, undefined, {
    env: { GIT_MERGE_AUTOEDIT: 'no' }
  })

  if (branch) {
    await checkOut(name, cwd, branch)
  }
}

export async function push(name: string, cwd: string) {
  console.log(`Pushing ${s.pkg(name)}`)
  await exec('git', ['push'], cwd)
}

export async function clone(name: string, repository: string, dir: string, branch?: string) {
  const branchText = branch ? ` ${await nerd.branch(branch)}` : ''
  console.log(`Cloning ${s.pkg(name)} from ${s.url(repository)}${branchText} into ${s.path(dir)}`)
  const args = ['clone', repository, dir]
  if (branch) {
    args.push('-b', branch)
  }

  await exec('git', args)
}

export async function add(file: string, cwd: string) {
  console.log(`Adding ${s.path(file)}`)
  await exec('git', ['add', file], cwd)
}

export async function addAll(name: string, cwd: string) {
  console.log(`Adding all changes in ${s.pkg(name)}`)
  await exec('git', ['add', '-A'], cwd)
}

export async function commit(name: string, message: string, cwd: string) {
  console.log(`Committing ${s.pkg(name)}`)
  await exec('git', ['commit', '-m', message], cwd)
}

export async function merge(name: string, branch: string, cwd: string): Promise<boolean> {
  try {
    console.log(`Merging ${s.pkg(name)}`)
    await exec('git', ['merge', branch], cwd, undefined, {
      env: { GIT_MERGE_AUTOEDIT: 'no' }
    })
    return true
  } catch {
    return false
  }
}

export async function abortMerge(name: string, cwd: string) {
  console.log(`Aborting merge of ${s.pkg(name)}`)
  await exec('git', ['merge', '--abort'], cwd)
}

export async function getRequiredCurrentBranch(cwd: string): Promise<string> {
  const branch = await getCurrentBranch(cwd)
  if (!branch) {
    throw new Error('Failed to determine current branch')
  }
  return branch
}

export async function getCurrentBranch(cwd: string): Promise<string | undefined> {
  try {
    const output = await execWithStdout(
      'git',
      ['branch'],
      cwd,
      `Failed to determine currently checked out branch in ${cwd}`
    )
    const matches = output.match(/^\* (.*)$/m)
    return (matches && matches[1]) || undefined
  } catch {
    return undefined
  }
}

export async function getCurrentCommit(cwd: string): Promise<string> {
  const output = await execWithStdout(
    'git',
    ['rev-parse', 'HEAD'],
    cwd,
    `Failed to determine current commit in ${cwd}`
  )
  return output.trim()
}

export async function getLocalBranches(cwd: string): Promise<string[]> {
  try {
    const output = await execWithStdout(
      'git',
      ['branch'],
      cwd,
      `Failed to determine currently checked out branch in ${cwd}`
    )
    const lines = output.match(/^.+$/gm) || []
    return lines.map(x => {
      const match = x.match(/^[*| ] (.*)$/)
      return (match && match[1]) || ''
    })
  } catch {
    return []
  }
}

export async function getAllBranches(cwd: string): Promise<string[]> {
  try {
    const output = await execWithStdout(
      'git',
      ['branch', '-a'],
      cwd,
      `Failed to determine currently checked out branch in ${cwd}`
    )
    const lines = output.match(/^.+$/gm) || []
    return lines.map(x => {
      const match = x.match(/^[*| ] (.*)$/)
      return (match && match[1]) || ''
    })
  } catch {
    return []
  }
}

export async function branchExists(branch: string, cwd: string): Promise<boolean> {
  try {
    const output = await execWithStdout(
      'git',
      ['branch'],
      cwd,
      `Failed to determine whether branch exists ${cwd}`
    )
    return !!output.match(new RegExp(`^(\\*)?\\s+(${branch})$`, 'm'))
  } catch {
    return false
  }
}

export async function getPushableCommits(cwd: string): Promise<number> {
  const output = await execWithStdout(
    'git',
    ['status'],
    cwd,
    `Failed to determine pushable commits count in ${cwd}`
  )
  const matches = output.match(/Your branch is ahead of '(.*?)' by (\d+) commit/)
  return matches ? parseInt(matches[2]) : 0
}

export async function hasChanges(cwd: string): Promise<boolean> {
  const { modified, staged } = await getChangeCount(cwd)
  return !!modified || !!staged || (await isMerging(cwd))
}

export async function getChangeCount(
  cwd: string
): Promise<{ modified: number; staged: number; conflicted: number }> {
  const output = await execWithStdout(
    'git',
    ['status', '--porcelain'],
    cwd,
    `Failed to 'git status' dir ${cwd}`
  )

  const statuses = matches(/^([ACDMRU? ]{2})(?:\s(.*))$/gm, output, 1)
  let modified = _.filter(statuses, x => !!x.match(/^.[ACDMRU?]$/)).length
  const staged = _.filter(statuses, x => !!x.match(/^[ACDMRU] $/)).length
  const conflicted = _.filter(statuses, x => !!x.match(/^(DD|AU|UD|UA|DU|AA|UU)$/)).length
  modified -= conflicted
  return { modified, staged, conflicted }
}

export async function resolve(file: string, using: 'ours' | 'theirs') {
  const text = (await readAndResolve(file, using)).output
  await fs.writeFile(file, text, 'utf8')
  await stage(file)
}

export async function readAndResolve(
  file: string,
  using: 'ours' | 'theirs'
): Promise<{ output: string; conflicted: boolean }> {
  const input = await fs.readFile(file, 'utf8')
  const output = input.replace(
    /(?<=^|\n)<<<<<<< .+?\n((?:.*\n)*?)=======\n((?:.*\n)*?)>>>>>>> .+?($|\n)/g,
    using == 'ours' ? '$1' : '$2'
  )
  return { output, conflicted: output.length !== input.length }
}

export async function isMerging(cwd: string): Promise<boolean> {
  return await fs.pathExists(path.join(cwd, '.git/MERGE_HEAD'))
}

export async function isFileConflicted(cwd: string, file: string): Promise<boolean> {
  const status = await getFileStatus(cwd, file)
  return !!status && conflictStatuses.includes(status)
}

export async function getFileStatus(cwd: string, file: string): Promise<string | undefined> {
  const output = await execWithStdout(
    'git',
    ['status', '--porcelain', file],
    cwd,
    `Failed to 'git status' file ${file}`
  )
  const match = output.match(/^([ACDMRU? ]{2})\s(.*)$/m)
  return (match && match[1]) || undefined
}

export async function pullOrClone(name: string, repository: string, dir: string, branch?: string) {
  if (await fs.pathExists(dir)) {
    await pull(name, dir, branch)
  } else {
    await clone(name, repository, dir, branch)
  }
}

export async function stage(file: string) {
  const cwd = path.dirname(file)
  await exec('git', ['add', file], cwd)
}

export async function discardAll(name: string, cwd: string) {
  console.log(`Discarding local changes from ${s.pkg(name)}`)
  await exec('git', ['reset', '--hard', 'HEAD'], cwd)
  await exec('git', ['clean', '-f', '-d'], cwd)
}

export async function deleteBranch(branch: string, cwd: string, remote: boolean) {
  if (remote) {
    await exec('git', ['push', 'origin', '--delete', branch], cwd)
  } else {
    await exec('git', ['branch', '-D', branch], cwd)
  }
}

export async function tag(name: string, cwd: string) {
  await exec('git', ['tag', name], cwd)
  await exec('git', ['push', 'origin', name], cwd)
}

export async function ignore(dir: string, fileToIgnore: string) {
  const gitIgnoreFile = '.gitignore'
  const gitIgnorePath = path.join(dir, gitIgnoreFile)
  if (!(await containsLine(gitIgnorePath, fileToIgnore))) {
    await fs.appendFile(gitIgnorePath, fileToIgnore + '\n')
    await stage(gitIgnoreFile)
  }

  async function containsLine(file: string, line: string) {
    try {
      await fs.access(file)
    } catch {
      return false
    }

    const reader = readline.createInterface({
      input: fs.createReadStream(file)
    })

    let found = false

    return new Promise(resolve => {
      reader.on('line', (ln: string) => {
        if (ln == line) {
          found = true
          resolve(true)
        }
      })

      reader.on('close', () => {
        if (!found) resolve(false)
      })
    })
  }
}

export async function getOrigin(cwd: string): Promise<string> {
  const origin = await getConfig('remote.origin.url', cwd)
  if (!origin) throw new Error(`Failed to determine origin of repository: ${cwd}`)
  return origin
}

export async function getConfig(key: string, cwd: string): Promise<string | undefined> {
  try {
    const output = await execWithStdout(
      'git',
      ['config', '--get', key],
      cwd,
      `Failed to get Git config value`
    )
    return output.trim()
  } catch {
    return undefined
  }
}

export async function setConfig(key: string, value: string, cwd: string) {
  await exec('git', ['config', key, value], cwd, `Failed to set Git config value`)
}

export async function fetchRemoteBranch(branch: string, cwd: string) {
  await exec(
    'git',
    ['fetch', 'origin', `${branch}:${branch}`],
    cwd,
    `Failed to fetch remote branch ${branch}`
  )
}

export async function init(dir: string) {
  await installPostCommitHook(dir)
  await setConfig('pull.rebase', 'false', dir)
}

async function installPostCommitHook(dir: string) {
  const script = '#!/bin/sh\ngpm adjust -cd --no-list'

  const hooksDir = path.join(dir, '.git/hooks')
  if (!(await fs.pathExists(dir))) {
    throw new Error(`Git hooks directory not found: ${hooksDir}`)
  }
  const file = path.join(hooksDir, 'post-commit')
  await fs.writeFile(file, script, 'utf8')
  await fs.chmod(file, 0o755)
}
