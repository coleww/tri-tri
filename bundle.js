(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var makeDistortionCurve = require('make-distortion-curve')
var int2freq = require('int2freq')

// ADD SP<E DE:LAY
// MAKE IT WEIRDER, YEAH?

module.exports = function (context, data) {
  var nodes = {}
  nodes.root = context.createOscillator()
  nodes.third = context.createOscillator()
  nodes.fifth = context.createOscillator()

  nodes.pregain = context.createGain()
  nodes.filter = context.createBiquadFilter()
  nodes.analyser = context.createAnalyser()
  nodes.delay = context.createDelay(15.0)
  nodes.distortion = context.createWaveShaper()

  nodes.lowFilter = context.createBiquadFilter()
  nodes.volume = context.createGain()

  nodes.root.connect(nodes.pregain)
  nodes.fifth.connect(nodes.pregain)
  nodes.third.connect(nodes.pregain)
  nodes.pregain.connect(nodes.filter)
  nodes.filter.connect(nodes.analyser)
  nodes.analyser.connect(nodes.delay)
  nodes.analyser.connect(nodes.lowFilter)
  nodes.delay.connect(nodes.distortion)
  nodes.distortion.connect(nodes.lowFilter)
  nodes.lowFilter.connect(nodes.volume)

  nodes.note = 'E4'

  nodes.updateNote = function (note, scaale) {
    var scale = scaale !== undefined ? scaale : 'major'
    this.note = note
    this.root.frequency.setValueAtTime(int2freq(0, {tonic: this.note, scale: scale}), context.currentTime)
    this.third.frequency.setValueAtTime(int2freq(2, {tonic: this.note, scale: scale}), context.currentTime)
    this.fifth.frequency.setValueAtTime(int2freq(4, {tonic: this.note, scale: scale}), context.currentTime)
  }

  nodes.import = function (data) {
    data = data || {}
    data.root = data.root || {}
    data.third = data.third || {}
    data.fifth = data.fifth || {}
    data.delay = data.delay || {}
    data.distortion = data.distortion || {}
    data.filter = data.filter || {}
    data.lowFilter = data.lowFilter || {}
    data.volume = data.volume || {}
    data.pregain = data.pregain || {}

    this.root.type = data.root.type || 'triangle'
    this.root.frequency.value = data.root.frequency || int2freq(0, {tonic: this.note, scale: 'major'})
    this.root.detune.value = data.root.detune || 0

    this.third.type = data.third.type || 'triangle'
    this.third.frequency.value = data.third.frequency || int2freq(2, {tonic: this.note, scale: 'major'})
    this.third.detune.value = data.third.detune || 0

    this.fifth.type = data.fifth.type || 'triangle'
    this.fifth.frequency.value = data.fifth.frequency || int2freq(4, {tonic: this.note, scale: 'major'})
    this.fifth.detune.value = data.fifth.detune || 0

    this.pregain.gain.value = data.pregain.gain || 0.3
    this.delay.delayTime.value = data.delay.delayTime || 2.5

    this.distortion.curve = data.distortion.curve || makeDistortionCurve(400)

    this.filter.Q.value = data.filter.Q || 25
    this.filter.frequency.value = data.filter.frequency || 400
    this.filter.type = data.filter.type || 'lowshelf'
    this.filter.detune = data.filter.detune || 0

    this.lowFilter.Q.value = data.lowFilter.Q || 25
    this.lowFilter.frequency.value = data.lowFilter.frequency || 300
    this.lowFilter.type = data.lowFilter.type || 'lowpass'
    this.lowFilter.detune = data.lowFilter.detune || 0

    this.volume.gain.value = data.volume.gain || 0.3
  }

  nodes.export = function () {
    return {
      root: {
        type: this.root.type,
        frequency: this.root.frequency.value,
        detune: this.root.detune.value
      },
      third: {
        type: this.third.type,
        frequency: this.third.frequency.value,
        detune: this.third.detune.value
      },
      fifth: {
        type: this.fifth.type,
        frequency: this.fifth.frequency.value,
        detune: this.fifth.detune.value
      },
      pregain: {
        gain: this.pregain.gain.value
      },
      filter: {
        Q: this.filter.q.value,
        frequency: this.filter.frequency.value,
        type: this.filter.type,
        detune: this.filter.detune.value
      },
      delay: {
        delayTime: this.delay.delayTime.value
      },
      distortion: {
        curve: this.distortion.curve
      },
      lowFilter: {
        Q: this.lowFilter.q.value,
        frequency: this.lowFilter.frequency.value,
        type: this.lowFilter.type,
        detune: this.lowFilter.detune.value
      },
      volume: {
        gain: this.volume.gain.value
      },
      note: this.note
    }
  }

  nodes.connect = function (destination) {
    this.volume.connect(destination)
  }

  nodes.start = function () {
    this.root.start()
    this.third.start()
    this.fifth.start()
  }

  nodes.keys = function () {
    return Object.keys(this).filter(function (k) {
      return ['import', 'export', 'connect', 'start', 'keys', 'updateNote'].indexOf(k) === -1
    })
  }

  nodes.import(data)

  return nodes
}

},{"int2freq":3,"make-distortion-curve":4}],2:[function(require,module,exports){
module.exports = function (pixels, w, h) {
  var ri = ~~(h / 2) * (w * 4) + (~~(w / 2) * 4)
  return {r: pixels[ri], g: pixels[ri + 1], b: pixels[ri + 2], a: pixels[ri + 3]}
}

},{}],3:[function(require,module,exports){
var scales = {
  major: [2, 2, 1, 2, 2, 2, 1],
  minor: [2, 1, 2, 2, 1, 2, 2],
  pentMaj: [2, 2, 3, 2, 3],
  pentMin: [3, 2, 2, 3, 2],
  blues: [3, 2, 1, 1, 3, 2]
}

var str2freq = {
  'A0': 27.5000, 'A#0': 29.1352, 'B0': 30.8677, 'C1': 32.7032, 'C#1': 34.6478,
  'D1': 36.7081, 'D#1': 38.8909, 'E1': 41.2034, 'F1': 43.6535, 'F#1': 46.2493,
  'G1': 48.9994, 'G#1': 51.9131, 'A1': 55.0000, 'A#1': 58.2705, 'B1': 61.7354,
  'C2': 65.4064, 'C#2': 69.2957, 'D2': 73.4162, 'D#2': 77.7817, 'E2': 82.4069,
  'F2': 87.3071, 'F#2': 92.4986, 'G2': 97.9989, 'G#2': 103.826, 'A2': 110.000,
  'A#2': 116.541, 'B2': 123.471, 'C3': 130.813, 'C#3': 138.591, 'D3': 146.832,
  'D#3': 155.563, 'E3': 164.814, 'F3': 174.614, 'F#3': 184.997, 'G3': 195.998,
  'G#3': 207.652, 'A3': 220.000, 'A#3': 233.082, 'B3': 246.942, 'C4': 261.626,
  'C#4': 277.183, 'D4': 293.665, 'D#4': 311.127, 'E4': 329.628, 'F4': 349.228,
  'F#4': 369.994, 'G4': 391.995, 'G#4': 415.305, 'A4': 440.000, 'A#4': 466.164,
  'B4': 493.883, 'C5': 523.251, 'C#5': 554.365, 'D5': 587.330, 'D#5': 622.254,
  'E5': 659.255, 'F5': 698.456, 'F#5': 739.989, 'G5': 783.991, 'G#5': 830.609,
  'A5': 880.000, 'A#5': 932.328, 'B5': 987.767, 'C6': 1046.50, 'C#6': 1108.73,
  'D6': 1174.66, 'D#6': 1244.51, 'E6': 1318.51, 'F6': 1396.91, 'F#6': 1479.98,
  'G6': 1567.98, 'G#6': 1661.22, 'A6': 1760.00, 'A#6': 1864.66, 'B6': 1975.53,
  'C7': 2093.00, 'C#7': 2217.46, 'D7': 2349.32, 'D#7': 2489.02, 'E7': 2637.02,
  'F7': 2793.83, 'F#7': 2959.96, 'G7': 3135.96, 'G#7': 3322.44, 'A7': 3520.00,
  'A#7': 3729.31, 'B7': 3951.07, 'C8': 4186.01
}

var notes = Object.keys(str2freq)

function int2freq(intNote, options){
  var index, scale;
  if((index = notes.indexOf(options.tonic)) === -1) throw 'what is up with that tonic?'
  if(!(scale = scales[options.scale])) throw 'what is up with that scale?'
  while (Math.abs(intNote) > scale.length) scale = scale.concat(scale)
  if(intNote >= 0) for (var i = 0; i < intNote; index += scale[i], i+= 1 ){}
  else for (var j = -1; j >= intNote; index -= scale[scale.length + j], j-= 1){}
  return str2freq[notes[index]]
}

module.exports = int2freq
module.exports.scales = Object.keys(scales)
module.exports.notes = Object.keys(notes)
},{}],4:[function(require,module,exports){
module.exports = function(amount) {
  var k = typeof amount === 'number' ? amount : 50,
    n_samples = 44100,
    curve = new Float32Array(n_samples),
    deg = Math.PI / 180,
    i = 0,
    x;
  for ( ; i < n_samples; ++i ) {
    x = i * 2 / n_samples - 1;
    curve[i] = ( 3 + k ) * x * 20 * deg / ( Math.PI + k * Math.abs(x) );
  }
  return curve;
}

},{}],5:[function(require,module,exports){
var vidSynth = require('../')
var context = new (window.AudioContext || window.webkitAudioContext)()
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia

var synth = vidSynth(context)
synth.connect(context.destination)

var getCenterPixel = require('get-center-pixel')
var ctx = document.getElementById('can').getContext('2d')

// red 255 0 0
// green 0 255 0
// blue 0 0 255

function isRed (pixel) {
  return pixel.r - pixel.g - pixel.b > 0
}

function isGreen (pixel) {
  return pixel.g - pixel.r - pixel.b > -50
}

function isBlue (pixel) {
  return pixel.b - pixel.r - pixel.g > 0
}

var chords = ['E4', 'G4', 'B4', 'D5', 'E5']

// map color to chord?
var currentDesire = 'red'
var currentChord = 'E4'

function maybeChange () {
  if (Math.random() < 0.025) {
    currentDesire = ['red', 'green', 'blue'][~~(Math.random() * 3)]
    currentChord = chords[~~(Math.random() * 5)]
    synth.updateNote(currentChord)

    stateYourDesire()
    console.log(currentDesire, currentChord)
  }
}

var display = document.getElementById('display')

function stateYourDesire () {
  display.textContent = 'I DEMAND YOU SHOW ME ' + currentDesire
}

function down () {
  if (synth.root.detune.value < 0) {
    synth.root.detune.value += (Math.random() * 5)
  } else {
    synth.root.detune.value -= (Math.random() * 5)
  }
  if (synth.third.detune.value < 0) {
    synth.third.detune.value += (Math.random() * 5)
  } else {
    synth.third.detune.value -= (Math.random() * 5)
  }
  if (synth.fifth.detune.value < 0) {
    synth.fifth.detune.value += (Math.random() * 5)
  } else {
    synth.fifth.detune.value -= (Math.random() * 5)
  }

  if (synth.delay.delayTime.value > 1) {
    synth.delay.delayTime.value -= 0.05
  }

  if (synth.lowFilter.frequency.value > 750) {
    synth.lowFilter.frequency.value -= ~~((Math.random() * 5) - 2)
  }
  return (~~Math.abs(synth.root.detune.value) <= 1 && ~~Math.abs(synth.third.detune.value) <= 1 && ~~Math.abs(synth.fifth.detune.value) <= 1)
}

function up () {
  synth.root.detune.value += ((Math.random() * 5) - 2)
  synth.fifth.detune.value += ((Math.random() * 5) - 2)
  synth.third.detune.value += ((Math.random() * 5) - 2)
  synth.lowFilter.frequency.value += ((Math.random() * 5) - 2)
  if (synth.lowFilter.frequency.value > 15000) {
    synth.lowFilter.frequency.value -= (Math.random() * 500)
  }
  if (synth.delay.delayTime.value < 14.945) {
    synth.delay.delayTime.value += 0.05
  }
}

gumDropMagic(function (pixel) {
  // IF the pixel is within threshhold of current color desires, lower detuning
  // else, increase detuning
  display.style.backgroundColor = 'rgb(' + pixel.r + ',' + pixel.g + ',' + pixel.b + ')'

  if (currentDesire === 'red') {
    if (isRed(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  } else if (currentDesire === 'green') {
    if (isGreen(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  } else if (currentDesire === 'blue') {
    if (isBlue(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  }
})

function gumDropMagic (cb) {
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, function (stream) {
      var video = document.getElementById('video')
      video.src = window.URL.createObjectURL(stream)
      video.onloadedmetadata = function (e) {
        video.play()
        synth.start()
        stateYourDesire()

        function draw () {
          ctx.drawImage(video, 0, 0, 320, 240)
          var data = ctx.getImageData(0, 0, 320, 240).data
          var pixel = getCenterPixel(data, 320, 240)
          cb(pixel)
          window.requestAnimationFrame(draw)
        }
        draw()

        cb(true)
      } // error callback: how to attempt to get just audio if video fails?
    }, function (err) {
        document.body.textContent = 'sorry gosh, wow, something horrible must have happened' + err
      })
  } else {
    document.body.textContent = 'sorry yr device does not have a webcam or something whoops'
  }
}

},{"../":1,"get-center-pixel":2}]},{},[5]);
