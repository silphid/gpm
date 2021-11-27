import chalk from 'chalk'

const config = require('./config')
import * as s from './style'

let useNerdFonts: boolean | undefined = undefined

async function getNerdText(nerd: string, regular: string) {
  if (useNerdFonts === undefined)
    useNerdFonts = (await config.getOptionalValue('useNerdFonts')) === 'true'
  return useNerdFonts ? nerd : regular
}

export async function branch(name: string) {
  return s.branch(await getNerdText(' ' + name, name))
}

export async function pushable(count: number) {
  return count > 0 ? s.markers(` ${await getNerdText('', '^')} ${count}`) : ''
}

export async function materialized(value: boolean) {
  return value ? s.materialized(` ${await getNerdText('ﯾ ', '')}MATERIALIZED`) : ''
}

export async function modified(count: number) {
  return count > 0 ? s.markers(` ${await getNerdText('', '*')} ${count}`) : ''
}

export async function conflicted(count: number) {
  return count > 0 ? s.conflicted(` ${await getNerdText('', '!')} ${count}`) : ''
}

export async function staged(count: number) {
  return count > 0 ? s.markers(` ${await getNerdText('', '+')} ${count}`) : ''
}

export async function mismatchedCommit(commit: string) {
  return (
    chalk.yellow(await getNerdText('', '')) +
    s.warn(`${commit}`) +
    chalk.yellow(await getNerdText('', ''))
  )
}

export async function mismatchedBranch(branch: string) {
  return (
    chalk.yellow(await getNerdText('', '')) +
    s.warn(`${branch}`) +
    chalk.yellow(await getNerdText('', ''))
  )
}

export async function separator(text: string) {
  return (
    chalk.blue(await getNerdText('', '')) +
    chalk.bgBlue.black(text) +
    chalk.blue(await getNerdText('', ''))
  )
}
