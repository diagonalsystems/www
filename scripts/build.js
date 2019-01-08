var fs = require('fs')
var path = require('path')
var mkdirp = require('mkdirp')
var pug = require('pug')
var rimraf = require('rimraf')
var yaml = require('yaml')
var changeCase = require('change-case')
var matter = require('gray-matter')
var marked = require('marked')
var stylus = require('stylus')

var rootDir = path.join(__dirname, '..')
var distDir = path.join(__dirname, '../dist')
var pagesDir = path.join(__dirname, '../pages')
var styleDir = path.join(__dirname, '../style')

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
]

if (require.main === module) {
  build()
} else {
  module.exports = build
}

function build () {
  console.log('Building...')

  recreateDist()

  var styleStr = fs.readFileSync(path.join(styleDir, 'style.styl'), 'utf8')

  stylus.render(styleStr, { filename: 'style.css' }, function (err, css) {
    if (err) throw err

    fs.writeFileSync(path.join(distDir, 'style.css'), css)
  })

  var data = loadData()

  data.routes = {}

  var dynamicRoutes = []
  var pages = listFilesRecursive(pagesDir).filter(page => {
    if (path.basename(page, '.pug')[0] === '_') {
      dynamicRoutes.push(page)

      return false
    }

    return true
  })

  var opts = {
    basedir: path.join(__dirname, '..')
  }

  dynamicRoutes.forEach(generateRoute)
  pages.forEach(page => generatePage(page))

  function generateRoute (route) {
    var dirName = path.dirname(route).split('/').slice(-1)[0]
    var paramName = path.basename(route, '.pug').split('').slice(1).join('')
    var contentDir = path.join(__dirname, '..', 'content', dirName)
    var filenames = fs.readdirSync(contentDir)
    var filepaths = filenames.map(filename => path.join(contentDir, filename))

    if (!data.routes[dirName]) {
      data.routes[dirName] = []
    }

    var folder = data.routes[dirName]

    filepaths.forEach(filepath => {
      var str = fs.readFileSync(filepath, 'utf8')
      var dest = getDestination(filepath)
      var frontmatter = matter(str)
      var data = frontmatter.data

      folder.push({
        slug: path.basename(filepath, path.extname(filepath)),
        title: data.title,
        date: formatDate(data.date)
      })

      generatePage(route, dest, {
        post: {
          data,
          content: marked(frontmatter.content)
        }
      })
    })
  }

  function generatePage (src, dest, locals = {}) {
    var file = fs.readFileSync(src, 'utf8')
    var html = compilePug(src, file, locals)

    if (!dest) {
      dest = getDestination(src)
    }

    mkdirp.sync(path.dirname(dest))
    fs.writeFileSync(dest, html)
  }

  function compilePug (filename, file, locals) {
    return pug.compile(file, Object.assign({}, opts, {
      filename
    }))(Object.assign(locals, data))
  }
}

function getDestination (src) {
  var subdir = path.relative(rootDir, path.dirname(src)).split(path.sep).slice(1).join(path.sep)
  var dir = path.join(distDir, subdir)
  var ext = path.extname(src)
  var filename = path.basename(src, ext) + '.html'
  var dest = path.join(dir, filename)

  return dest
}

function getPageKey (filename) {
  var ext = path.extname(filename)
  var basename = path.basename(filename, ext)

  return changeCase.camel(basename)
}

function listFilesRecursive (dir) {
  var filenames = fs.readdirSync(dir)

  var files = filenames.map(filename => {
    var filepath = path.join(dir, filename)

    return fs.statSync(filepath).isDirectory()
      ? listFilesRecursive(filepath)
      : filepath
  })

  return flatten(files)
}

function flatten (array) {
  return [].concat(...array)
}

function loadData () {
  var dataDir = path.join(__dirname, '../data')

  var filenames = fs.readdirSync(dataDir)
  var data = {}

  filenames.forEach(filename => {
    var name = getPageKey(filename)
    var file = fs.readFileSync(path.join(dataDir, filename), 'utf8')

    data[name] = yaml.parse(file)
  })

  return data
}

function recreateDist () {
  rimraf.sync(distDir)
  mkdirp.sync(distDir)
}

function formatDate (value) {
  var d = new Date(value)

  return `${months[d.getMonth()]} ${d.getDate()} ${d.getFullYear()}`
}
