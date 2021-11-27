import { Command } from '@oclif/command'
import { Manifest } from '../manifest'
import { perform } from '../performer'
import * as commonFlags from '../commonFlags'
import * as s from '../style'
import * as fs from 'fs-extra'

export default class Print extends Command {
  static description = 'Print manifest file of selected packages.'
  static flags = {
    current: commonFlags.current,
    all: commonFlags.all,
    prompt: commonFlags.prompt
  }

  async run() {
    const { flags } = this.parse(Print)

    await perform(async (manifest: Manifest) => {
      console.log(`${s.pkg(manifest.name)} manifest:`)
      const content = await fs.readFile(manifest.requiredFile, 'utf8')
      console.log(s.fileContent(content.trim()) + '\n')
    }, flags)
  }
}
