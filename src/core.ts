import { spawn, SpawnOptions } from 'child_process'
import * as path from 'path'
import { Manifest } from './manifest'
import * as config from './config'
import * as git from './git'
import * as nerd from './nerdFont'
const findUp = require('find-up')

export async function getMainPackageRepo(): Promise<string> {
  return await config.getRequiredValue('mainRepo')
}

export async function getMainPackageName(): Promise<string> {
  return await config.getRequiredValue('mainName')
}

export async function getMainPackageBranch(): Promise<string> {
  return await config.getRequiredValue('mainBranch')
}

export async function getPackageDir(name: string): Promise<string> {
  const rootDir = await getRequiredRootDir()
  return path.join(rootDir, name)
}

export async function getRequiredRootDir(): Promise<string> {
  const configFile = await getRequiredConfigFile()
  return path.dirname(configFile)
}

export async function getRequiredConfigFile(): Promise<string> {
  const file = await findUp('gpm.yaml')
  if (!file) {
    throw new Error(
      "Root path not found. You should execute 'gpm init <url>' from the root directory you want to use for your packages"
    )
  }
  return file
}

export async function getCurrentBranchByPackageName(name: string): Promise<string | undefined> {
  try {
    const dir = await getPackageDir(name)
    return await git.getCurrentBranch(dir)
  } catch {}
}

export async function exec(
  command: string,
  args: string[],
  cwd?: string,
  errMessage?: string,
  options?: SpawnOptions
) {
  options = { ...options, stdio: 'inherit', cwd: cwd }
  const process = spawn(command, args, options)
  return new Promise((resolve, reject) => {
    process.on('close', exitCode => {
      if (exitCode === 0) resolve()
      else reject(new Error(errMessage || 'Unknown error'))
    })
  })
}

export async function execWithStdout(
  command: string,
  args: string[],
  cwd?: string,
  errMessage?: string
): Promise<string> {
  let output = ''
  const process = spawn(command, args, {
    stdio: [
      0, // Use parent's stdin for child
      'pipe', // Pipe child's stdout to parent
      'pipe' // Pipe child's stderr to parent
    ],
    cwd: cwd
  })
  process.stdout.on('data', x => (output += x))
  return new Promise((resolve, reject) => {
    process.on('close', exitCode => {
      if (exitCode === 0) {
        resolve(output)
      } else reject(new Error(errMessage))
    })
  })
}

export function joinPath(...paths: (string | undefined)[]): string {
  return path.join(...paths.filter(x => x).map(x => <string>x))
}

export function findManifest(manifests: Manifest[], name: string): Manifest | undefined {
  return manifests.find((x: Manifest) => x.name == name)
}

export function getNameFromRepoUrl(url: string): string {
  const match = url.match(/^(.*\/(.*?)\.git)$/)
  if (!match) {
    throw new Error(`Malformed repository URL: ${url}`)
  }
  return match[2]
}

export async function separator(text: string = '          ') {
  console.log(await nerd.separator(text))
}
