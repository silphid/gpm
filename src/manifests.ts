import {
  getCurrentPackageName,
  getMainManifestOrAsConfigured,
  getManifestByNameOrMissing,
  Manifest,
  ManifestKind
} from './manifest'
import * as _ from 'lodash'
import * as selector from './selector'
import * as s from './style'

export class Manifests {
  public main: Manifest | undefined
  public current: Manifest | undefined
  public all: Manifest[] = []
  public selection: Manifest[] = []
  public readonly selectedNames: string[]
  private readonly currentPackageName: string | undefined

  public get requiredCurrent(): Manifest {
    if (!this.current) {
      throw new Error(`No package found for current directory: ${process.cwd}`)
    }
    return this.current
  }

  public get requiredMain(): Manifest {
    if (!this.main) {
      throw new Error(`No main package found`)
    }
    return this.main
  }

  constructor(
    main: Manifest | undefined,
    selectedNames: string[],
    currentPackageName: string | undefined
  ) {
    this.main = main
    this.selectedNames = selectedNames
    this.currentPackageName = currentPackageName

    if (main) {
      this.add(main)
    }
  }

  public add(manifest: Manifest) {
    if (this.find(manifest.name)) {
      return
    }

    this.all.push(manifest)

    if (this.selectedNames.includes(manifest.name)) {
      this.selection.push(manifest)
      manifest.selected = true
    }

    if (this.currentPackageName === manifest.name) {
      this.current = manifest
    }
  }

  public find(name: string): Manifest | undefined {
    return _.find(this.all, x => x.name === name)
  }

  public findRequired(name: string): Manifest {
    const manifest = this.find(name)
    if (!manifest) {
      throw new Error(`Required manifest not found for ${s.pkg(name)}`)
    }
    return manifest
  }

  public static async load(): Promise<Manifests> {
    const currentPackageName = await getCurrentPackageName()
    const selectedNames = await selector.getSelection()
    const mainManifest = await getMainManifestOrAsConfigured()
    const manifests = new Manifests(mainManifest, selectedNames, currentPackageName)

    if (mainManifest) {
      await loadRecursively(mainManifest, manifests)
    }

    return manifests
  }
}

async function loadRecursively(manifest: Manifest, manifests: Manifests) {
  if (manifest.kind !== ManifestKind.Present) return
  for (const dependency of manifest.dependencies) {
    const dependencyManifest =
      manifests.find(dependency.name) ||
      (await getManifestByNameOrMissing(dependency.name, dependency.repo))

    dependency.dependentManifest = manifest
    dependency.dependencyManifest = dependencyManifest
    dependencyManifest.dependentsManifests.push(manifest)
    manifest.dependenciesManifests.push(dependencyManifest)
    manifests.add(dependencyManifest)
    await loadRecursively(dependencyManifest, manifests)
  }
}
