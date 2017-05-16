const { isDev, faces } = process.leah

const notifier = isDev ? require('node-notifier') : null

const notifications = {
  appStart: {
    icon: faces.leah,
    title: 'Leah',
    message: 'App started',
    // TODO: make it dynamic
    open: 'http://localhost:3000',
    timeout: 5
  },
  appCrash: {
    icon: faces.facepalm,
    title: 'Leah',
    message: 'App crashed!',
    timeout: 5
  },
  appRestart: {
    icon: faces.hacker,
    title: 'Leah',
    message: 'App reloaded',
    timeout: 3
  }
}

let startAlreadyNotified = false
const appStart = () => {
  if (startAlreadyNotified === true) return

  startAlreadyNotified = true
  notifier.notify(notifications.appStart)
}

const appCrash = () => {
  notifier.notify(notifications.appCrash)
}

const appRestart = () => {
  notifier.notify(notifications.appRestart)
}

if (isDev) {
  module.exports = {
    appStart,
    appCrash,
    appRestart
  }
} else {
  const noop = () => {}

  module.exports = {
    appStart: noop,
    appCrash: noop,
    appRestart: noop
  }
}
