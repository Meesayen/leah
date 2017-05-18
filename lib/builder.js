const path = require('path')
const fs = require('async-file')
const globby = require('globby')
const del = require('del')
const CleanCss = require('clean-css')
const { transformFile: babelTransform } = require('babel-core')

const log = console.log.bind(console, 'leah-builder')

const cleanCss = new CleanCss({})

const { isDev, args, cwd } = process.leah

const srcPath = args.src || 'src'
const destPath = args.dest || 'dist'

const babelOptions = {
  presets: isDev ? null : ['babili'],
  plugins: [
    'transform-flow-strip-types',
    'transform-class-properties',
    'transform-function-bind',
    'transform-do-expressions'
  ]
}

const asyncBabelTransform = file => {
  return new Promise((resolve, reject) => {
    babelTransform(file, babelOptions, (err, result) => {
      if (err) reject(err)
      else resolve(result)
    })
  })
}

async function transformFiles({ jsFiles, cssFiles }, destPath) {
  return Promise.all([
    // JS transformation pipeline
    ...jsFiles.map(async file => {
      const destFile = file.replace(srcPath, destPath)
      log(`${file} -> ${destFile}`)
      await fs.createDirectory(path.dirname(destFile))
      const { code } = await asyncBabelTransform(file)
      return fs.writeFile(
        destFile,
        code,
        'utf-8'
      )
    }),

    // CSS transformation pipeline
    ...cssFiles.map(async file => {
      const destFile = file.replace(srcPath, destPath)
      log(`${file} -> ${destFile}`)
      await fs.createDirectory(path.dirname(destFile))
      return fs.writeFile(
        destFile,
        cleanCss.minify(await fs.readFile(file, 'utf-8')).styles,
        'utf-8'
      )
    })
  ])
}

module.exports = async function () {
  if (isDev) {
    // Setup watcher
    const splitFiles = files => {
      if (!Array.isArray(files)) files = [files]
      return files.reduce((acc, file) => {
        if (file.endsWith('.js')) acc.jsFiles.push(file)
        else if (file.endsWith('.css')) acc.cssFiles.push(file)
        return acc
      }, { jsFiles: [], cssFiles: [] })
    }

    const chokidar = require('chokidar')
    chokidar.watch(srcPath, {
      cwd,
      persistent: true,
      ignoreInitial: true
    }).on('add', path => {
      log(`New file: ${path}.`)
      transformFiles(splitFiles(path), destPath)
    }).on('change', path => {
      log(`Change file: ${path}.`)
      transformFiles(splitFiles(path), destPath)
    })
  }

  await del(destPath)

  await transformFiles(
    {
      cssFiles: await globby(`${srcPath}/**/*.css`),
      jsFiles: await globby(`${srcPath}/**/*.js`)
    },
    destPath
  )
}
