import { Command } from '@oclif/command'
import { execGitCommand } from '../git'
import { perform, PerformFlags } from '../performer'
import { Manifest } from '../manifest'
import { list } from '../list'
import * as commonFlags from '../commonFlags'

export default class Git extends Command {
  static description = 'Execute arbitrary git command on selected packages.'
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt
  }
  static args = [
    {
      name: 'arg1',
      description: 'first argument'
    },
    {
      name: 'arg2',
      description: 'second argument'
    },
    {
      name: '...',
      description: 'other arguments'
    }
  ]

  async run() {
    const { argv, flags } = parseArguments()

    await perform(async (manifest: Manifest) => {
      await execGitCommand(manifest.name, manifest.dir, argv)
    }, flags)

    await list()
  }
}

function parseArguments(): { argv: string[]; flags: PerformFlags } {
  if (process.argv.length < 4) {
    throw new Error('Missing required arguments in git command')
  }
  const argv = [...process.argv]
  argv.splice(0, 3)

  let current = false
  let all = false
  let prompt = false
  if (argv.length && argv[0] === '-a') {
    all = true
    argv.shift()
  }
  if (argv.length && argv[0] === '-c') {
    current = true
    argv.shift()
  }
  if (argv.length && argv[0] === '-p') {
    prompt = true
    argv.shift()
  }

  return { argv, flags: { current, all, prompt } }
}
