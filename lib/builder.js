const execa = require('execa')
const fs = require('async-file')
const globby = require('globby')
const del = require('del')
const CleanCss = require('clean-css')

const cleanCss = new CleanCss({})

const { cwd, args } = process.leah

const srcPath = args.src || 'src'
const destPath = args.dest || 'dist'

module.exports = async function () {
  const cssFiles = await globby(`${srcPath}/**/*.css`)

  await del(destPath)

  const res = await execa('babili', [srcPath, '--out-dir', destPath], { cwd })
  console.log(res.stdout)

  await Promise.all(cssFiles.map(async file => {
    const destFile = file.replace(srcPath, destPath)
    console.log(`${file} -> ${destFile}`)
    return fs.writeFile(
      destFile,
      cleanCss.minify(await fs.readFile(file, 'utf-8')).styles,
      'utf-8'
    )
  }))
}
