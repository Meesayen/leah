#!/usr/bin/env node

const minimist = require('minimist')
const { loadFaces } = require('./lib/utils')

const argv = minimist(process.argv.slice(2))
const cwd = process.cwd()
const pkg = require(`${cwd}/package.json`)

const faces = loadFaces()

process.leah = { a: 10 }

let isDev = process.env.NODE_ENV === 'development'
if (argv.dev === true) {
  // Forces dev if --dev flag is passed
  isDev = true
  process.env.NODE_ENV = 'development'
}

process.leah = {
  isDev,
  args: argv,
  faces,
  pkg,
  cwd
}

if (argv._[0] === 'start') {
  require('./lib/starter')()
}

if (argv._[0] === 'build') {
  require('./lib/builder')().catch(err => console.log(err))
}
