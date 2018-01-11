/**
 * @file: index
 * @author: Cuttle Cong
 * @date: 2017/12/11
 * @description:
 */
var babel = require('babel-core')
var generate = require('babel-generator').default
var t = babel.types

var corePlugin = {
  visitor: {
    ObjectProperty(path) {
      var keyPath = path.get('key')
      var value = path.get('value')
      if (
        keyPath.node.name === 'component' &&
        t.isStringLiteral(value)
      ) {
        var requestString = value.node.value || ''
        requestString = requestString.trim()
        var query = parseQuery(requestString)
        requestString = removeQuery(requestString)
        var result
        requestString = requestString.replace(/^(.*?!)?/, function (m) {
          if (m === 'sync!') {
            result = m
            return ''
          }
          return m
        })
        var requireCode = 'require(' + JSON.stringify(requestString) + ')'
        requireCode = query.export ? requireCode + '.' + query.export : requireCode +  '.default || ' + requireCode
        // has result, must === 'sync!'
        if (result) {
          value.replaceWithSourceString(
            requireCode
          )
        }
        else {
          keyPath.node.name = 'getComponent'
          value.replaceWithSourceString(
            'function getComponent(location, callback) {\n' +
            '  require.ensure([], function () {\n' +
            '    callback(null, ' + requireCode + ')\n' +
            '  }, ' + JSON.stringify(query.name || parseChunkname(requestString)) +')\n' +
            '}'
          )
        }
      }
    }
  }
}

function stripeLoaderString(string = '') {
  var arr = string.split('!')
  return arr[arr.length - 1]
}

function parseQuery(str) {
  var compStart = str.lastIndexOf('!') === -1 ? 0 : str.lastIndexOf('!')
  var compStr = str.substr(compStart - str.length)
  var startPoint = compStr.lastIndexOf('?')
  var query = {};
  if (startPoint > 0) {
    compStr.substr(startPoint - compStr.length + 1).split('&').forEach(function(pair) {
      pair = pair.split('=')
      query[pair[0]] = pair[1]
    })
  }
  return query
}

function parseChunkname(relUrl) {
  var matches = relUrl.match(/([^\/\.?]+)\?*[^\/*]*$/)
  return matches && matches[1]
}

function removeQuery(str) {
  if (str.lastIndexOf('?') > str.lastIndexOf('!')) {
    return str.substring(0, str.lastIndexOf('?'))
  }

  return str
}

module.exports = function (content) {
  if (this.cacheable) {
    this.cacheable()
  }

  var ast = babel.transform(content, {
    plugins: [
      corePlugin
    ]
  }).ast

  return generate(ast).code
}