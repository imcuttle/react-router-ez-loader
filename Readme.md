# react-router-ez-loader
[![NPM version](https://img.shields.io/npm/v/react-router-ez-loader.svg?style=flat-square)](https://www.npmjs.com/package/react-router-ez-loader)
[![NPM Downloads](https://img.shields.io/npm/dm/react-router-ez-loader.svg?style=flat-square&maxAge=43200)](https://www.npmjs.com/package/react-router-ez-loader)

Make your application's react routes code is more ez! :smile:

- Easy to write your routes.js
- Easy to append chunkname for webpack code splitting

## routes.js
```javascript
module.exports = {
  path: '/',
  component: 'sync!@fe/comps/Layout',
  indexRoute: {
    component: '@fe/pages/Home'
  },
  childRoutes: [
    {
      path: 'edit',
      component: '!some-loader!@fe/pages/Edit'
    }
  ]
}
```

## Usage
```javascript
const routes = require('!react-router-ez-loader!./routes')
```

## Output
```javascript
module.exports = {
  path: '/',
  component: require('@fe/comps/Layout').default || require('@fe/comps/Layout'), 
  indexRoute: {
    getComponent: function(location, callback) {
      require.ensure([], function() {
        callback(null, require('@fe/pages/Home') || require('@fe/pages/Home').default)
      }, '@fe/pages/Home')
    }
  },
  childRoutes: [
    {
      path: 'edit',
      getComponent: function(location, callback) {
        require.ensure([], function() {
          callback(null, require('!some-loader!@fe/pages/Edit') || require('!some-loader!@fe/pages/Edit').default)
        }, '@fe/pages/Edit')
      }
    }
  ]
}
```
