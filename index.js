/**
 * @file: index
 * @author: Cuttle Cong
 * @date: 2017/12/11
 * @description:
 */
var babel = require('babel-core')
var qs = require('querystring')
var t = babel.types

var corePlugin = {
  visitor: {
    ObjectProperty: function(path) {
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

        var chunkname = calcChunkname(requestString)
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
            '  }, ' + JSON.stringify(chunkname) +')\n' +
            '}'
          )
        }
      }
    }
  }
}

/**
 * case 1:
 *  in: 'react'
 *  out: 'react'
 * case 2:
 *  in: './../react',
 *  out: 'react'
 * case 3:
 *  in: './../react?n=aliasName'
 *  out: 'aliasName'
 * case 4:
 *  in: '!some-loader!./../react'
 *  out: 'react'
 */
function calcChunkname(requestString) {
  requestString = requestString.trim()
  var qIndex = requestString.lastIndexOf('?')
  if (qIndex >= 0) {
    var name = qs.parse(requestString.slice(qIndex + 1)).n
    if (typeof name !== 'undefined') {
      return name
    }

    requestString = requestString.slice(0, qIndex)
  }
  requestString = stripeLoaderString(requestString)

  return requestString.replace(/^(\.\/|\.\.\/)+/, '')
}

function stripeLoaderString(string = '') {
  var arr = string.split('!')
  return arr[arr.length - 1]
}

module.exports = function (content) {
  if (this.cacheable) {
    this.cacheable()
  }

  var code = babel.transform(content, {
    plugins: [
      corePlugin
    ]
  }).code

  return code
}
