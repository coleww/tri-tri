var vid-synth = require('../')

document.getElementById('input').addEventListener('keyup', function (e) {
  document.getElementById('output').textContent = vid-synth(document.getElementById('input').value)
})
