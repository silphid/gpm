import { Command, flags } from '@oclif/command'
import { setValue } from '../config'

export default class Nerd extends Command {
  static description =
    'Configure gpm to use NerdFonts for nicer display.\n' +
    'NerdFonts has special symbols for things like branches, uncommitted or staged changes and unpushed commits. ' +
    'First download the font from https://nerdfonts.com, install it on your machine and configure it in your terminal. ' +
    'Then run this command in your project to tell gpm to use it.'

  static flags = {
    off: flags.boolean({
      description: 'turn NerdFonts off',
      allowNo: false,
      required: false,
      default: false
    })
  }

  async run() {
    const { flags } = this.parse(Nerd)
    await setValue('useNerdFonts', flags.off ? 'false' : 'true')
    console.log(`NerdFonts turned ${flags.off ? 'OFF' : 'ON'}`)
  }
}
