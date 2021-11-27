import { flags } from '@oclif/command'

export const current = flags.boolean({
  char: 'c',
  description: 'include only package of current directory',
  allowNo: false,
  required: false,
  default: false,
  exclusive: ['all', 'prompt']
})

export const all = flags.boolean({
  char: 'a',
  description: 'include all packages',
  allowNo: false,
  required: false,
  default: false,
  exclusive: ['current', 'prompt']
})

export const prompt = flags.boolean({
  char: 'p',
  description: 'prompt for packages to include for this command only',
  allowNo: false,
  required: false,
  default: false,
  exclusive: ['all', 'current']
})

export const discard = flags.boolean({
  char: 'd',
  description: 'discard all local changes',
  allowNo: false,
  required: false,
  default: false
})

export const feature = flags.boolean({
  char: 'f',
  description: 'use feature branch',
  allowNo: false,
  required: false,
  default: false
})

export const list = flags.boolean({
  char: 'l',
  description: 'whether to display list after command',
  allowNo: true,
  required: false,
  default: true
})

export const branch = flags.string({
  char: 'b',
  description: 'main package branch to checkout',
  required: false,
  default: 'master'
})

export const master = flags.string({
  description: 'master branch to use for git flow',
  required: false,
  default: undefined
})

export const develop = flags.string({
  description: 'develop branch to use for git flow',
  required: false,
  default: undefined
})

export const user = flags.string({
  description: 'user name to use for git flow feature branches',
  required: false,
  default: undefined
})
