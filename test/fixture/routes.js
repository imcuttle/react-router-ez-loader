/**
 * @file: routes
 * @author: Cuttle Cong
 * @date: 2018/1/11
 * @description:
 */

module.exports = {
  path: '/',
  component: 'sync!./App',
  indexRoute: {
    component: '@IndexPage'
  },
  childRoutes: [
    {
      path: 'edit',
      component: '!some-loader!../../Edit"Page'
    },
    {
      path: 'view',
      component: '!some-loader!../../ViewPage?n=View'
    }
  ]
}
