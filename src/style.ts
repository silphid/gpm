const chalk = require('chalk')

export function packageNameInList(name: string, selected: boolean) {
  return selected ? selectedPkg(name) : pkg(name)
}

export const branch = chalk.blue
export const currentBranch = chalk.underline.blue
export const pkg = chalk.green
export const selectedPkg = chalk.underline.greenBright
export const url = chalk.underline.gray
export const path = chalk.gray
export const symlink = chalk.magenta
export const markers = chalk.magenta
export const conflicted = chalk.yellow
export const materialized = chalk.default
export const fileContent = chalk.gray

export function err(text: string) {
  return `${chalk.bgRed.black(text)}`
}

export function warn(text: string) {
  return `${chalk.bgYellow.black(text)}`
}

export function errMsg(text: string) {
  return `${err('ERR')} ${text}`
}

export function warnMsg(text: string) {
  return `${warn('WARN')} ${text}`
}
