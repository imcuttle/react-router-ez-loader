/**
 * @file: index.test.js
 * @author: Cuttle Cong
 * @date: 2018/1/11
 * @description:
 */
const loader = require('../index')
const fs = require('fs')
const source = fs.readFileSync(require.resolve('./fixture/routes')).toString()

test('Test', () => {
  expect(loader(source)).toMatchSnapshot()
})
