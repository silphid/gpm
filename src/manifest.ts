import * as util from 'util'
import * as _ from 'lodash'
import * as path from 'path'
import { basename, dirname } from 'path'
import { pathExists } from 'fs-extra'
import * as core from './core'
import { getMainPackageName } from './core'
import { Dependency } from './dependency'
import * as s from './style'
import * as git from './git'

const globby = require('globby')

const yaml = require('node-yaml')
const parse = yaml.parse
const write = util.promisify(yaml.write)
const findUp = require('find-up')

const PackageManifestFileName = 'package.yaml'

export enum ManifestKind {
  Present,
  Missing
}

export type InternalLink = {
  source: string
  target: string
}

export type Links = {
  exports: string | any | undefined // Path(s) to source code to expose to dependent packages as symlink(s)
  imports: string | undefined // Where to create dependency symlinks
  internals: InternalLink[] | undefined
}

export class Manifest {
  public readonly dependenciesManifests: Manifest[] = []
  public readonly dependentsManifests: Manifest[] = []
  public selected: boolean = false

  public get styledName(): string {
    return s.pkg(this.name)
  }

  public get requiredFile(): string {
    if (!this.file) {
      throw new Error(`Missing required file property in manifest of ${this.name}`)
    }
    return this.file
  }

  constructor(
    readonly file: string | undefined,
    readonly isConflicted: boolean,
    readonly dir: string,
    readonly name: string,
    readonly links: Links | undefined,
    public dependencies: Dependency[],
    readonly kind: ManifestKind = ManifestKind.Present
  ) {
    this.name = name
  }

  static async createMainAsConfigured(): Promise<Manifest> {
    const repo = await core.getMainPackageRepo()
    const name = await core.getMainPackageName()
    const dir = await core.getPackageDir(name)
    return new Manifest(undefined, false, dir, name, undefined, [], ManifestKind.Missing)
  }

  static async createMissing(repo: string): Promise<Manifest> {
    const name = core.getNameFromRepoUrl(repo)
    const dir = await core.getPackageDir(name)
    return new Manifest(undefined, false, dir, name, undefined, [], ManifestKind.Missing)
  }

  public static async read(file: string): Promise<Manifest> {
    try {
      const { output, conflicted } = await git.readAndResolve(file, 'ours')
      const obj = parse(output)

      if (obj.repo) {
        console.log(s.warnMsg(`Deprecated property 'repo' in manifest ${file}`))
      }

      const dir = dirname(file)
      return new Manifest(
        file,
        conflicted,
        dir,
        basename(dir),
        obj.links,
        obj.dependencies
          ? obj.dependencies.map((x: any) => new Dependency(x.repo, x.branch, x.commit))
          : []
      )
    } catch (err) {
      err.stack = `Failed to load manifest: ${file}\n${err.stack}`
      throw err
    }
  }

  public async write(file?: string) {
    function sanitize(o: any): any {
      const result = _.pickBy(o, x => x !== undefined && x !== null)
      return Object.keys(result).length ? result : undefined
    }
    const obj = sanitize({
      links:
        this.links &&
        sanitize({
          imports: this.links.imports,
          exports: this.links.exports,
          internals:
            this.links.internals &&
            this.links.internals.map(x =>
              sanitize({
                source: x.source,
                target: x.target
              })
            )
        }),
      dependencies: this.dependencies.map(x =>
        sanitize({
          repo: x.repo,
          branch: x.branch,
          commit: x.commit
        })
      )
    })
    await write(file || this.file, obj, 'utf8')
  }

  public findManifest(name: string): Manifest | undefined {
    if (this.name === name) return this

    for (const dependency of this.dependenciesManifests) {
      const result = dependency.findManifest(name)
      if (result) return result
    }

    return undefined
  }

  public findDependency(name: string): Dependency | undefined {
    return this.dependencies.find(x => x.name === name)
  }

  public findRequiredDependency(name: string): Dependency {
    const dependency = this.findDependency(name)
    if (!dependency) {
      throw new Error(`Missing required dependency ${name} in ${this.name}`)
    }
    return dependency
  }

  public getCommitForDependents(): string | undefined {
    const This = this
    function getCommit(dependent: Manifest): string | undefined {
      const dependency = dependent.findRequiredDependency(This.name)
      if (!dependency.commit) {
        throw new Error(
          `Missing commit property on dependency ${s.pkg(dependency.name)} of ${s.pkg(
            dependent.name
          )}`
        )
      }
      return dependency.commit
    }

    if (!this.dependentsManifests.length) {
      return undefined
    }

    let candidateManifest: Manifest | undefined = undefined
    let candidateCommit: string | undefined
    for (const dependent of this.dependentsManifests) {
      const commit = getCommit(dependent)
      if (candidateCommit && commit !== candidateCommit) {
        throw new Error(
          `Dependency conflict: ${s.pkg((candidateManifest as Manifest).name)} depends on ${s.pkg(
            this.name
          )} ${s.branch(candidateCommit)} while ${s.pkg(dependent.name)} depends on ${s.pkg(
            this.name
          )} ${s.branch(commit)}`
        )
      }

      candidateCommit = commit
      candidateManifest = dependent
    }

    return candidateCommit as string
  }

  public getRepoAndBranchForDependents(): { repo: string; branch: string } {
    let candidateManifest: Manifest | undefined = undefined
    let candidateRepo: string | undefined
    let candidateBranch: string | undefined
    for (const dependent of this.dependentsManifests) {
      const { repo, branch } = getRepoAndBranchForDependent(this.name, dependent)
      if (candidateRepo && repo !== candidateRepo) {
        throw new Error(
          `Dependency conflict: ${s.pkg((candidateManifest as Manifest).name)} depends on ${s.pkg(
            this.name
          )} repo ${s.branch(candidateRepo)} while ${s.pkg(dependent.name)} depends on ${s.pkg(
            this.name
          )} repo ${s.branch(repo)}`
        )
      }
      if (candidateBranch && branch !== candidateBranch) {
        throw new Error(
          `Dependency conflict: ${s.pkg((candidateManifest as Manifest).name)} depends on ${s.pkg(
            this.name
          )} branch ${s.branch(candidateBranch)} while ${s.pkg(dependent.name)} depends on ${s.pkg(
            this.name
          )} branch ${s.branch(branch)}`
        )
      }

      candidateRepo = repo
      candidateBranch = branch
      candidateManifest = dependent
    }

    if (!candidateRepo || !candidateBranch) {
      throw new Error(
        `Failed to determine repo and branch for dependents of package ${s.pkg(this.name)}`
      )
    }

    return { repo: candidateRepo as string, branch: candidateBranch as string }

    function getRepoAndBranchForDependent(
      name: string,
      dependent: Manifest
    ): { repo: string; branch: string } {
      const dependency = dependent.findRequiredDependency(name)
      if (!dependency.branch) {
        throw new Error(
          `Missing branch property on dependency ${s.pkg(dependency.name)} of ${s.pkg(
            dependent.name
          )}`
        )
      }
      if (!dependency.repo) {
        throw new Error(
          `Missing repo property on dependency ${s.pkg(dependency.name)} of ${s.pkg(
            dependent.name
          )}`
        )
      }
      return { repo: dependency.repo, branch: dependency.branch }
    }
  }

  private hasDescendantDependency(name: string, excludedDependency?: Dependency): boolean {
    for (const dependency of this.dependencies) {
      if (dependency === excludedDependency) continue
      if (dependency.name === name) return true
      if (dependency.requiredDependencyManifest.hasDescendantDependency(name)) return true
    }

    return false
  }

  public markRedundantDependenciesRecursively() {
    for (const dependency of this.dependencies) {
      if (this.hasDescendantDependency(dependency.name, dependency)) {
        dependency.isRedundant = true
      }
      dependency.requiredDependencyManifest.markRedundantDependenciesRecursively()
    }
  }

  public removeDependency(dependency: Dependency) {
    const index = this.dependencies.indexOf(dependency)
    if (index >= 0) {
      this.dependencies.splice(index, 1)
    }
  }

  public async getBranch(): Promise<string> {
    const branch = await git.getCurrentBranch(this.dir)
    if (!branch) {
      throw new Error(`Failed to determine current branch for package ${this.name}`)
    }
    return branch
  }

  public async getCommit(): Promise<string> {
    return await git.getCurrentCommit(this.dir)
  }
}

export async function getCurrentPackageName(): Promise<string | undefined> {
  const file = await findUp(PackageManifestFileName, { cwd: process.cwd() })
  return file ? path.basename(path.dirname(file)) : undefined
}

export async function getManifestByName(name: string): Promise<Manifest | undefined> {
  const file = await getManifestFile(name)
  return ((await pathExists(file)) && (await Manifest.read(file))) || undefined
}

export async function getManifestByNameOrMissing(name: string, repo: string): Promise<Manifest> {
  const manifest = await getManifestByName(name)
  if (manifest) return manifest
  return Manifest.createMissing(repo)
}

export async function getMainManifestOrAsConfigured(): Promise<Manifest> {
  const manifest = await getManifestByName(await getMainPackageName())
  if (manifest) return manifest
  return Manifest.createMainAsConfigured()
}

export async function getManifestFile(name: string): Promise<string> {
  const dir = await core.getPackageDir(name)
  return path.join(dir, PackageManifestFileName)
}

export async function getAllLocalManifests(): Promise<Manifest[]> {
  const dir = await core.getRequiredRootDir()
  const files = await globby('**/package.yaml', { cwd: dir, absolute: true, deep: 1 })
  return await Promise.all<Manifest>(files.map(Manifest.read))
}
