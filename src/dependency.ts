import { Manifest } from './manifest'
import * as s from './style'
import * as core from './core'

export class Dependency {
  public readonly name: string
  public dependentManifest: Manifest | undefined
  public dependencyManifest: Manifest | undefined
  public isRedundant = false

  public get styledName(): string {
    return s.pkg(this.name)
  }

  public get requiredDependencyManifest(): Manifest {
    if (!this.dependencyManifest) {
      throw new Error('Missing required dependencyManifest property')
    }
    return this.dependencyManifest
  }

  constructor(
    public readonly repo: string,
    public branch: string | undefined,
    public commit: string | undefined
  ) {
    this.name = core.getNameFromRepoUrl(repo)
  }
}
