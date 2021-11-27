import { Command } from '@oclif/command'
import { init } from '../init'
import * as inquirer from 'inquirer'
import { Answers } from 'inquirer'
import { list } from '../list'
import * as commonFlags from '../commonFlags'

export default class Init extends Command {
  static description =
    'Configure current directory as root, clone main package and its dependencies, and create symlinks between them.'
  static args = [
    {
      name: 'repo',
      description:
        'main package Git URL in the form git@github.com:my_account/package_name.git[#branch]',
      required: false
    }
  ]
  static flags = {
    list: commonFlags.list,
    branch: commonFlags.branch,
    master: commonFlags.master,
    develop: commonFlags.develop,
    user: commonFlags.user
  }

  async run() {
    const { args, flags } = this.parse(Init)

    if (!args.repo) {
      args.repo = await prompt('Main package Git repository URL:')
    }

    await init(args.repo, flags.branch, flags.master, flags.develop, flags.user)

    if (flags.list) {
      await list()
    }
  }
}

async function prompt(message: string, defaultValue?: string): Promise<string> {
  const answers: Answers = await inquirer.prompt({
    type: 'string',
    name: 'value',
    message: message,
    validate: x =>
      defaultValue || (x && (<string>x).length > 0) ? true : 'This value is required',
    default: defaultValue
  })
  return answers['value']
}
