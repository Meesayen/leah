const execa = require('execa')

const { isDev, args, pkg } = process.leah

const notifier = require('./notifier')

const appFile = args._[1] || pkg.main || 'index.js'

let appRunner = null
if (isDev) {
  appRunner = require('nodemon')
} else {
  appRunner = ({ script }) => execa('node', [script])
}

module.exports = () => {
  const runProcess = appRunner({
    script: appFile
  })

  if (isDev) {
    runProcess
      .on('start', notifier.appStart)
      .on('crash', notifier.appCrash)
      .on('restart', notifier.appRestart)
  }
}
