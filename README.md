vid-synth
----------------

[![NPM](https://nodei.co/npm/vid-synth.png)](https://nodei.co/npm/vid-synth/) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard) [![Build Status](https://secure.travis-ci.org/YR_TRAVIS_USER_NAME/vid-synth.png)](http://travis-ci.org/YR_TRAVIS_USER_NAME/vid-synth)

RETURNS an instrument is an object filled with already-connected and setup audioNodes. The instrument responds to:

keys() => returns list of keys to audioNodes
connect(destination) => connect the output nodes to a destination or other nodes
start() => calls start() on all the source nodes
export() => returns JSON respresentation of the instrument
import(data) => loads a JSON of the instrument state.
From there, writing a module that auto-magically builds UI for each of the nodes shouldn't be too hard.

INSTALL

npm install drone-e-o-synth

EXAMPLE

var makeSynth = require('drone-e-o-synth')
var context = new (window.AudioContext || window.webkitAudioContext)()
var synth = makeSynth(context)

// synth is an object filled with audio nodes that are already connected together!

synth.connect(context.destination)
// connect yr synth to the audio context destination, or to other nodes

synth.keys() => ['source', 'filter', lowFilter', 'distortion', 'volume']
// returns a list of keys to audio nodes, so you can do stuff like synth.source.type = "triangle"

var data = synth.export() => exports the current state of the audio nodes to a json object
synth.import(data) => resets state of audio nodes from JSON object