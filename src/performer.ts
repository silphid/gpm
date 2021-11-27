import { Manifest, ManifestKind } from './manifest'
import * as s from './style'
import { Manifests } from './Manifests'
import { separator } from './core'
import { getPromptedSelection, getPromptedSingleSelection } from './selector'

export type ManifestAction = (manifest: Manifest, manifests: Manifests) => Promise<void>
export type PerformSingleFlags = {
  current: boolean
}
export type PerformFlags = {
  current: boolean
  all: boolean
  prompt: boolean
}
export type Options = {
  manifests?: Manifests
  includeMissing?: boolean
  reverseOrder?: boolean
  reloadManifests?: boolean
}

export async function performSingle(
  action: ManifestAction,
  flags: PerformSingleFlags,
  options: Options = {}
) {
  const manifests = options.manifests || (await Manifests.load())
  if (flags.current) await performOnCurrent(action, manifests)
  else await performOnPromptedSingle(action, manifests, options)
}

export async function perform(action: ManifestAction, flags: PerformFlags, options: Options = {}) {
  const manifests = options.manifests || (await Manifests.load())
  if (flags.current) {
    await performOnCurrent(action, manifests)
  } else if (flags.all || !manifests.selection.length) {
    await performOnAll(action, manifests, options)
  } else if (flags.prompt) {
    await performOnPrompted(action, manifests, options)
  } else {
    await performOnSelection(action, manifests, options)
  }
}

async function performOnAll(action: ManifestAction, manifests: Manifests, options: Options) {
  await performRecursively(action, manifests.requiredMain, manifests, options, [], () => true)
}

async function performOnCurrent(action: ManifestAction, manifests: Manifests) {
  await action(manifests.requiredCurrent, manifests)
}

async function performOnSelection(action: ManifestAction, manifests: Manifests, options: Options) {
  await performRecursively(action, manifests.requiredMain, manifests, options, [], x =>
    manifests.selectedNames.includes(x.name)
  )
}

async function performOnPrompted(action: ManifestAction, manifests: Manifests, options: Options) {
  const selection = await getPromptedSelection()
  await performRecursively(action, manifests.requiredMain, manifests, options, [], x =>
    selection.includes(x.name)
  )
}

async function performOnPromptedSingle(
  action: ManifestAction,
  manifests: Manifests,
  options: Options
) {
  const selection = await getPromptedSingleSelection()
  await performRecursively(action, manifests.requiredMain, manifests, options, [], x =>
    selection.includes(x.name)
  )
}

async function performRecursively(
  action: ManifestAction,
  manifest: Manifest,
  manifests: Manifests,
  options: Options,
  completedNames: string[],
  predicate: (manifest: Manifest) => boolean
) {
  async function performAction() {
    const alreadyCompleted = completedNames.includes(manifest.name)
    if (!alreadyCompleted && predicate(manifest)) {
      try {
        await separator(manifest.name)
        await action(manifest, manifests)
      } catch (e) {
        console.log(s.errMsg(e.message))
      }
      completedNames.push(manifest.name)
    }
  }

  async function reloadManifestsIfNeeded() {
    if (options.reloadManifests) {
      manifests = await Manifests.load()
      manifest = manifests.findRequired(manifest.name)
    }
  }

  async function performRecursion() {
    for (const dependencyManifest of manifest.dependenciesManifests) {
      if (dependencyManifest.kind == ManifestKind.Present || options.includeMissing) {
        await performRecursively(
          action,
          dependencyManifest,
          manifests,
          options,
          completedNames,
          predicate
        )
      } else {
        console.log(s.warnMsg(`Skipping missing package ${s.pkg(dependencyManifest.name)}`))
      }
    }
  }

  if (options.reverseOrder) {
    await performRecursion()
    await reloadManifestsIfNeeded()
    await performAction()
  } else {
    await performAction()
    await reloadManifestsIfNeeded()
    await performRecursion()
  }
}
