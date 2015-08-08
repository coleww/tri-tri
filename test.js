var tap = require('tape')
var vidSynth = require('./')

tap.test('does the thing', function (t) {
  t.plan(1)
  t.equal(vidSynth('world'), 'hello world', 'does it')
})
