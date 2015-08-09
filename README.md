tri-tri
----------------

[![NPM](https://nodei.co/npm/tri-tri.png)](https://nodei.co/npm/tri-tri/) [![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard) 

Triple Oscillator Triangle Synthesizer AKA tri-tri AKA TOTS

(an experiment in publishing web audio synths to npm, much like https://www.npmjs.com/package/drone-e-o-synth)

[DEMO](http://coleww.github.io/tri-tri/): a lil game in which you must show different colors to the camera in order to get it to perform a more pleasing drone.

### EXAMPLE

```
var context = new (window.AudioContext || window.webkitAudioContext)()
var makeTriTri = require('tri-tri')
var triTri = makeTriTri(context)
```

makeTriTri returns an object that posses the following methods:

- keys() => returns list of keys to audioNodes
- connect(destination) => connect the output nodes to a destination or other nodes
- start() => calls start() on all the source nodes
- export() => returns JSON respresentation of the instrument
- import(data) => loads JSON data, or uses default values if no data is passed.
- updateNote(noteStr, scale) => sets the synth frequencies to play a major chord in the given note and str. note should look like "E4", etc. Scale can be "major", "minor", "pentMaj", "pentMin", or "blues", and defaults to "major".

### EXAMPLE CONTINUED

```
triTri.connect(context.destination)
// connect yr triTri to the audio context destination, or to other nodes

triTri.keys() 
// => ['root', 'third', 'fifth', 'delay', 'pregain', 'filter', lowFilter', 'distortion', 'volume']
// returns a list of keys to audio nodes, so you can do stuff like triTri.source.type = "square" or whatever. 
// Mostly there for debugging. I guess hopefully they will always be named such that you can guess which type of node they will be....

triTri.start() // begin making noise
triTri.updateNote("C4", "pentMin") // update the root note/scale

var data = triTri.export() => exports the current state of the audio nodes to a json object
triTri.import(data) => resets state of audio nodes from JSON object
```

Can theoretically use this with https://www.npmjs.com/package/web-audio-ui 
