const util = require('util')
const yaml = require('node-yaml')
const read = util.promisify(yaml.read)
const write = util.promisify(yaml.write)
import * as fs from 'fs-extra'
import * as core from './core'

export async function getOptionalValue(key: string): Promise<any> {
  const config = await load()
  return config[key]
}

export async function getRequiredValue(key: string): Promise<any> {
  const config = await load()
  const value = config[key]
  if (!value)
    throw new Error(
      `Missing required configuration property: ${key}. You can set that property using 'gpm config:set ${key} VALUE`
    )
  return value
}

export async function setValue(key: string, value: any) {
  const config = await load()
  config[key] = value
  await save(config)
}

export async function deleteValue(key: string) {
  const config = await load()
  delete config[key]
  await save(config)
}

export async function load(): Promise<any> {
  const configFile = await core.getRequiredConfigFile()
  if (await fs.pathExists(configFile)) return (await read(configFile, 'utf8')) || {}
  else return {}
}

export async function save(config: any) {
  const configFile = await core.getRequiredConfigFile()
  await write(configFile, config, 'utf8')
}
