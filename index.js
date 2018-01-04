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
        var result
        requestString = requestString.replace(/^(.*?!)?/, function (m) {
          if (m === 'sync!') {
            result = m
            return ''
          }
          return m
        })
        var requireCode = 'require(' + JSON.stringify(requestString) + ')'
        requireCode = requireCode + '.default || ' + requireCode
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
            '  }, ' + JSON.stringify(stripeLoaderString(requestString)) +')\n' +
            '}'
          )
        }
      }
    }
  }
}

function stripeLoaderString(string = '') {
  const arr = string.split('!')
  return arr[arr.length - 1]
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
