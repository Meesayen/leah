const path = require('path')
const globby = require('globby')

const loadFaces = () => {
  const facesFiles = globby.sync(path.resolve(__dirname, '../faces/*.png'))
  return facesFiles.map(f => ({
    id: path.basename(f, '.png'),
    path: f
  })).reduce((acc, next) => Object.assign({}, acc, { [next.id]: next.path }), {})
}

module.exports = {
  loadFaces
}
