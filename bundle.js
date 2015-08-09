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

},{"../":1,"get-center-pixel":2}]},{},[5])
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJpbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9nZXQtY2VudGVyLXBpeGVsL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL2ludDJmcmVxL2luZGV4LmpzIiwibm9kZV9tb2R1bGVzL21ha2UtZGlzdG9ydGlvbi1jdXJ2ZS9pbmRleC5qcyIsInd3dy9kZW1vLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIG1ha2VEaXN0b3J0aW9uQ3VydmUgPSByZXF1aXJlKCdtYWtlLWRpc3RvcnRpb24tY3VydmUnKVxudmFyIGludDJmcmVxID0gcmVxdWlyZSgnaW50MmZyZXEnKVxuXG4vLyBBREQgU1A8RSBERTpMQVlcbi8vIE1BS0UgSVQgV0VJUkRFUiwgWUVBSD9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiAoY29udGV4dCwgZGF0YSkge1xuICB2YXIgbm9kZXMgPSB7fVxuICBub2Rlcy5yb290ID0gY29udGV4dC5jcmVhdGVPc2NpbGxhdG9yKClcbiAgbm9kZXMudGhpcmQgPSBjb250ZXh0LmNyZWF0ZU9zY2lsbGF0b3IoKVxuICBub2Rlcy5maWZ0aCA9IGNvbnRleHQuY3JlYXRlT3NjaWxsYXRvcigpXG5cbiAgbm9kZXMucHJlZ2FpbiA9IGNvbnRleHQuY3JlYXRlR2FpbigpXG4gIG5vZGVzLmZpbHRlciA9IGNvbnRleHQuY3JlYXRlQmlxdWFkRmlsdGVyKClcbiAgbm9kZXMuYW5hbHlzZXIgPSBjb250ZXh0LmNyZWF0ZUFuYWx5c2VyKClcbiAgbm9kZXMuZGVsYXkgPSBjb250ZXh0LmNyZWF0ZURlbGF5KDE1LjApXG4gIG5vZGVzLmRpc3RvcnRpb24gPSBjb250ZXh0LmNyZWF0ZVdhdmVTaGFwZXIoKVxuXG4gIG5vZGVzLmxvd0ZpbHRlciA9IGNvbnRleHQuY3JlYXRlQmlxdWFkRmlsdGVyKClcbiAgbm9kZXMudm9sdW1lID0gY29udGV4dC5jcmVhdGVHYWluKClcblxuICBub2Rlcy5yb290LmNvbm5lY3Qobm9kZXMucHJlZ2FpbilcbiAgbm9kZXMuZmlmdGguY29ubmVjdChub2Rlcy5wcmVnYWluKVxuICBub2Rlcy50aGlyZC5jb25uZWN0KG5vZGVzLnByZWdhaW4pXG4gIG5vZGVzLnByZWdhaW4uY29ubmVjdChub2Rlcy5maWx0ZXIpXG4gIG5vZGVzLmZpbHRlci5jb25uZWN0KG5vZGVzLmFuYWx5c2VyKVxuICBub2Rlcy5hbmFseXNlci5jb25uZWN0KG5vZGVzLmRlbGF5KVxuICBub2Rlcy5kZWxheS5jb25uZWN0KG5vZGVzLmRpc3RvcnRpb24pXG4gIG5vZGVzLmRpc3RvcnRpb24uY29ubmVjdChub2Rlcy5sb3dGaWx0ZXIpXG4gIG5vZGVzLmxvd0ZpbHRlci5jb25uZWN0KG5vZGVzLnZvbHVtZSlcblxuICBub2Rlcy5ub3RlID0gJ0U0J1xuXG4gIG5vZGVzLnVwZGF0ZU5vdGUgPSBmdW5jdGlvbiAobm90ZSwgc2NhYWxlKSB7XG4gICAgdmFyIHNjYWxlID0gc2NhYWxlICE9PSB1bmRlZmluZWQgPyBzY2FhbGUgOiAnbWFqb3InXG4gICAgdGhpcy5ub3RlID0gbm90ZVxuICAgIHRoaXMucm9vdC5mcmVxdWVuY3kuc2V0VmFsdWVBdFRpbWUoaW50MmZyZXEoMCwge3RvbmljOiB0aGlzLm5vdGUsIHNjYWxlOiBzY2FsZX0pLCBjb250ZXh0LmN1cnJlbnRUaW1lKVxuICAgIHRoaXMudGhpcmQuZnJlcXVlbmN5LnNldFZhbHVlQXRUaW1lKGludDJmcmVxKDIsIHt0b25pYzogdGhpcy5ub3RlLCBzY2FsZTogc2NhbGV9KSwgY29udGV4dC5jdXJyZW50VGltZSlcbiAgICB0aGlzLmZpZnRoLmZyZXF1ZW5jeS5zZXRWYWx1ZUF0VGltZShpbnQyZnJlcSg0LCB7dG9uaWM6IHRoaXMubm90ZSwgc2NhbGU6IHNjYWxlfSksIGNvbnRleHQuY3VycmVudFRpbWUpXG4gIH1cblxuICBub2Rlcy5pbXBvcnQgPSBmdW5jdGlvbiAoZGF0YSkge1xuICAgIGRhdGEgPSBkYXRhIHx8IHt9XG4gICAgZGF0YS5yb290ID0gZGF0YS5yb290IHx8IHt9XG4gICAgZGF0YS50aGlyZCA9IGRhdGEudGhpcmQgfHwge31cbiAgICBkYXRhLmZpZnRoID0gZGF0YS5maWZ0aCB8fCB7fVxuICAgIGRhdGEuZGVsYXkgPSBkYXRhLmRlbGF5IHx8IHt9XG4gICAgZGF0YS5kaXN0b3J0aW9uID0gZGF0YS5kaXN0b3J0aW9uIHx8IHt9XG4gICAgZGF0YS5maWx0ZXIgPSBkYXRhLmZpbHRlciB8fCB7fVxuICAgIGRhdGEubG93RmlsdGVyID0gZGF0YS5sb3dGaWx0ZXIgfHwge31cbiAgICBkYXRhLnZvbHVtZSA9IGRhdGEudm9sdW1lIHx8IHt9XG4gICAgZGF0YS5wcmVnYWluID0gZGF0YS5wcmVnYWluIHx8IHt9XG5cbiAgICB0aGlzLnJvb3QudHlwZSA9IGRhdGEucm9vdC50eXBlIHx8ICd0cmlhbmdsZSdcbiAgICB0aGlzLnJvb3QuZnJlcXVlbmN5LnZhbHVlID0gZGF0YS5yb290LmZyZXF1ZW5jeSB8fCBpbnQyZnJlcSgwLCB7dG9uaWM6IHRoaXMubm90ZSwgc2NhbGU6ICdtYWpvcid9KVxuICAgIHRoaXMucm9vdC5kZXR1bmUudmFsdWUgPSBkYXRhLnJvb3QuZGV0dW5lIHx8IDBcblxuICAgIHRoaXMudGhpcmQudHlwZSA9IGRhdGEudGhpcmQudHlwZSB8fCAndHJpYW5nbGUnXG4gICAgdGhpcy50aGlyZC5mcmVxdWVuY3kudmFsdWUgPSBkYXRhLnRoaXJkLmZyZXF1ZW5jeSB8fCBpbnQyZnJlcSgyLCB7dG9uaWM6IHRoaXMubm90ZSwgc2NhbGU6ICdtYWpvcid9KVxuICAgIHRoaXMudGhpcmQuZGV0dW5lLnZhbHVlID0gZGF0YS50aGlyZC5kZXR1bmUgfHwgMFxuXG4gICAgdGhpcy5maWZ0aC50eXBlID0gZGF0YS5maWZ0aC50eXBlIHx8ICd0cmlhbmdsZSdcbiAgICB0aGlzLmZpZnRoLmZyZXF1ZW5jeS52YWx1ZSA9IGRhdGEuZmlmdGguZnJlcXVlbmN5IHx8IGludDJmcmVxKDQsIHt0b25pYzogdGhpcy5ub3RlLCBzY2FsZTogJ21ham9yJ30pXG4gICAgdGhpcy5maWZ0aC5kZXR1bmUudmFsdWUgPSBkYXRhLmZpZnRoLmRldHVuZSB8fCAwXG5cbiAgICB0aGlzLnByZWdhaW4uZ2Fpbi52YWx1ZSA9IGRhdGEucHJlZ2Fpbi5nYWluIHx8IDAuM1xuICAgIHRoaXMuZGVsYXkuZGVsYXlUaW1lLnZhbHVlID0gZGF0YS5kZWxheS5kZWxheVRpbWUgfHwgMi41XG5cbiAgICB0aGlzLmRpc3RvcnRpb24uY3VydmUgPSBkYXRhLmRpc3RvcnRpb24uY3VydmUgfHwgbWFrZURpc3RvcnRpb25DdXJ2ZSg0MDApXG5cbiAgICB0aGlzLmZpbHRlci5RLnZhbHVlID0gZGF0YS5maWx0ZXIuUSB8fCAyNVxuICAgIHRoaXMuZmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA9IGRhdGEuZmlsdGVyLmZyZXF1ZW5jeSB8fCA0MDBcbiAgICB0aGlzLmZpbHRlci50eXBlID0gZGF0YS5maWx0ZXIudHlwZSB8fCAnbG93c2hlbGYnXG4gICAgdGhpcy5maWx0ZXIuZGV0dW5lID0gZGF0YS5maWx0ZXIuZGV0dW5lIHx8IDBcblxuICAgIHRoaXMubG93RmlsdGVyLlEudmFsdWUgPSBkYXRhLmxvd0ZpbHRlci5RIHx8IDI1XG4gICAgdGhpcy5sb3dGaWx0ZXIuZnJlcXVlbmN5LnZhbHVlID0gZGF0YS5sb3dGaWx0ZXIuZnJlcXVlbmN5IHx8IDMwMFxuICAgIHRoaXMubG93RmlsdGVyLnR5cGUgPSBkYXRhLmxvd0ZpbHRlci50eXBlIHx8ICdsb3dwYXNzJ1xuICAgIHRoaXMubG93RmlsdGVyLmRldHVuZSA9IGRhdGEubG93RmlsdGVyLmRldHVuZSB8fCAwXG5cbiAgICB0aGlzLnZvbHVtZS5nYWluLnZhbHVlID0gZGF0YS52b2x1bWUuZ2FpbiB8fCAwLjNcbiAgfVxuXG4gIG5vZGVzLmV4cG9ydCA9IGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgcm9vdDoge1xuICAgICAgICB0eXBlOiB0aGlzLnJvb3QudHlwZSxcbiAgICAgICAgZnJlcXVlbmN5OiB0aGlzLnJvb3QuZnJlcXVlbmN5LnZhbHVlLFxuICAgICAgICBkZXR1bmU6IHRoaXMucm9vdC5kZXR1bmUudmFsdWVcbiAgICAgIH0sXG4gICAgICB0aGlyZDoge1xuICAgICAgICB0eXBlOiB0aGlzLnRoaXJkLnR5cGUsXG4gICAgICAgIGZyZXF1ZW5jeTogdGhpcy50aGlyZC5mcmVxdWVuY3kudmFsdWUsXG4gICAgICAgIGRldHVuZTogdGhpcy50aGlyZC5kZXR1bmUudmFsdWVcbiAgICAgIH0sXG4gICAgICBmaWZ0aDoge1xuICAgICAgICB0eXBlOiB0aGlzLmZpZnRoLnR5cGUsXG4gICAgICAgIGZyZXF1ZW5jeTogdGhpcy5maWZ0aC5mcmVxdWVuY3kudmFsdWUsXG4gICAgICAgIGRldHVuZTogdGhpcy5maWZ0aC5kZXR1bmUudmFsdWVcbiAgICAgIH0sXG4gICAgICBwcmVnYWluOiB7XG4gICAgICAgIGdhaW46IHRoaXMucHJlZ2Fpbi5nYWluLnZhbHVlXG4gICAgICB9LFxuICAgICAgZmlsdGVyOiB7XG4gICAgICAgIFE6IHRoaXMuZmlsdGVyLnEudmFsdWUsXG4gICAgICAgIGZyZXF1ZW5jeTogdGhpcy5maWx0ZXIuZnJlcXVlbmN5LnZhbHVlLFxuICAgICAgICB0eXBlOiB0aGlzLmZpbHRlci50eXBlLFxuICAgICAgICBkZXR1bmU6IHRoaXMuZmlsdGVyLmRldHVuZS52YWx1ZVxuICAgICAgfSxcbiAgICAgIGRlbGF5OiB7XG4gICAgICAgIGRlbGF5VGltZTogdGhpcy5kZWxheS5kZWxheVRpbWUudmFsdWVcbiAgICAgIH0sXG4gICAgICBkaXN0b3J0aW9uOiB7XG4gICAgICAgIGN1cnZlOiB0aGlzLmRpc3RvcnRpb24uY3VydmVcbiAgICAgIH0sXG4gICAgICBsb3dGaWx0ZXI6IHtcbiAgICAgICAgUTogdGhpcy5sb3dGaWx0ZXIucS52YWx1ZSxcbiAgICAgICAgZnJlcXVlbmN5OiB0aGlzLmxvd0ZpbHRlci5mcmVxdWVuY3kudmFsdWUsXG4gICAgICAgIHR5cGU6IHRoaXMubG93RmlsdGVyLnR5cGUsXG4gICAgICAgIGRldHVuZTogdGhpcy5sb3dGaWx0ZXIuZGV0dW5lLnZhbHVlXG4gICAgICB9LFxuICAgICAgdm9sdW1lOiB7XG4gICAgICAgIGdhaW46IHRoaXMudm9sdW1lLmdhaW4udmFsdWVcbiAgICAgIH0sXG4gICAgICBub3RlOiB0aGlzLm5vdGVcbiAgICB9XG4gIH1cblxuICBub2Rlcy5jb25uZWN0ID0gZnVuY3Rpb24gKGRlc3RpbmF0aW9uKSB7XG4gICAgdGhpcy52b2x1bWUuY29ubmVjdChkZXN0aW5hdGlvbilcbiAgfVxuXG4gIG5vZGVzLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucm9vdC5zdGFydCgpXG4gICAgdGhpcy50aGlyZC5zdGFydCgpXG4gICAgdGhpcy5maWZ0aC5zdGFydCgpXG4gIH1cblxuICBub2Rlcy5rZXlzID0gZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiBPYmplY3Qua2V5cyh0aGlzKS5maWx0ZXIoZnVuY3Rpb24gKGspIHtcbiAgICAgIHJldHVybiBbJ2ltcG9ydCcsICdleHBvcnQnLCAnY29ubmVjdCcsICdzdGFydCcsICdrZXlzJywgJ3VwZGF0ZU5vdGUnXS5pbmRleE9mKGspID09PSAtMVxuICAgIH0pXG4gIH1cblxuICBub2Rlcy5pbXBvcnQoZGF0YSlcblxuICByZXR1cm4gbm9kZXNcbn1cbiIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHBpeGVscywgdywgaCkge1xuICB2YXIgcmkgPSB+fihoIC8gMikgKiAodyAqIDQpICsgKH5+KHcgLyAyKSAqIDQpXG4gIHJldHVybiB7cjogcGl4ZWxzW3JpXSwgZzogcGl4ZWxzW3JpICsgMV0sIGI6IHBpeGVsc1tyaSArIDJdLCBhOiBwaXhlbHNbcmkgKyAzXX1cbn1cbiIsInZhciBzY2FsZXMgPSB7XG4gIG1ham9yOiBbMiwgMiwgMSwgMiwgMiwgMiwgMV0sXG4gIG1pbm9yOiBbMiwgMSwgMiwgMiwgMSwgMiwgMl0sXG4gIHBlbnRNYWo6IFsyLCAyLCAzLCAyLCAzXSxcbiAgcGVudE1pbjogWzMsIDIsIDIsIDMsIDJdLFxuICBibHVlczogWzMsIDIsIDEsIDEsIDMsIDJdXG59XG5cbnZhciBzdHIyZnJlcSA9IHtcbiAgJ0EwJzogMjcuNTAwMCwgJ0EjMCc6IDI5LjEzNTIsICdCMCc6IDMwLjg2NzcsICdDMSc6IDMyLjcwMzIsICdDIzEnOiAzNC42NDc4LFxuICAnRDEnOiAzNi43MDgxLCAnRCMxJzogMzguODkwOSwgJ0UxJzogNDEuMjAzNCwgJ0YxJzogNDMuNjUzNSwgJ0YjMSc6IDQ2LjI0OTMsXG4gICdHMSc6IDQ4Ljk5OTQsICdHIzEnOiA1MS45MTMxLCAnQTEnOiA1NS4wMDAwLCAnQSMxJzogNTguMjcwNSwgJ0IxJzogNjEuNzM1NCxcbiAgJ0MyJzogNjUuNDA2NCwgJ0MjMic6IDY5LjI5NTcsICdEMic6IDczLjQxNjIsICdEIzInOiA3Ny43ODE3LCAnRTInOiA4Mi40MDY5LFxuICAnRjInOiA4Ny4zMDcxLCAnRiMyJzogOTIuNDk4NiwgJ0cyJzogOTcuOTk4OSwgJ0cjMic6IDEwMy44MjYsICdBMic6IDExMC4wMDAsXG4gICdBIzInOiAxMTYuNTQxLCAnQjInOiAxMjMuNDcxLCAnQzMnOiAxMzAuODEzLCAnQyMzJzogMTM4LjU5MSwgJ0QzJzogMTQ2LjgzMixcbiAgJ0QjMyc6IDE1NS41NjMsICdFMyc6IDE2NC44MTQsICdGMyc6IDE3NC42MTQsICdGIzMnOiAxODQuOTk3LCAnRzMnOiAxOTUuOTk4LFxuICAnRyMzJzogMjA3LjY1MiwgJ0EzJzogMjIwLjAwMCwgJ0EjMyc6IDIzMy4wODIsICdCMyc6IDI0Ni45NDIsICdDNCc6IDI2MS42MjYsXG4gICdDIzQnOiAyNzcuMTgzLCAnRDQnOiAyOTMuNjY1LCAnRCM0JzogMzExLjEyNywgJ0U0JzogMzI5LjYyOCwgJ0Y0JzogMzQ5LjIyOCxcbiAgJ0YjNCc6IDM2OS45OTQsICdHNCc6IDM5MS45OTUsICdHIzQnOiA0MTUuMzA1LCAnQTQnOiA0NDAuMDAwLCAnQSM0JzogNDY2LjE2NCxcbiAgJ0I0JzogNDkzLjg4MywgJ0M1JzogNTIzLjI1MSwgJ0MjNSc6IDU1NC4zNjUsICdENSc6IDU4Ny4zMzAsICdEIzUnOiA2MjIuMjU0LFxuICAnRTUnOiA2NTkuMjU1LCAnRjUnOiA2OTguNDU2LCAnRiM1JzogNzM5Ljk4OSwgJ0c1JzogNzgzLjk5MSwgJ0cjNSc6IDgzMC42MDksXG4gICdBNSc6IDg4MC4wMDAsICdBIzUnOiA5MzIuMzI4LCAnQjUnOiA5ODcuNzY3LCAnQzYnOiAxMDQ2LjUwLCAnQyM2JzogMTEwOC43MyxcbiAgJ0Q2JzogMTE3NC42NiwgJ0QjNic6IDEyNDQuNTEsICdFNic6IDEzMTguNTEsICdGNic6IDEzOTYuOTEsICdGIzYnOiAxNDc5Ljk4LFxuICAnRzYnOiAxNTY3Ljk4LCAnRyM2JzogMTY2MS4yMiwgJ0E2JzogMTc2MC4wMCwgJ0EjNic6IDE4NjQuNjYsICdCNic6IDE5NzUuNTMsXG4gICdDNyc6IDIwOTMuMDAsICdDIzcnOiAyMjE3LjQ2LCAnRDcnOiAyMzQ5LjMyLCAnRCM3JzogMjQ4OS4wMiwgJ0U3JzogMjYzNy4wMixcbiAgJ0Y3JzogMjc5My44MywgJ0YjNyc6IDI5NTkuOTYsICdHNyc6IDMxMzUuOTYsICdHIzcnOiAzMzIyLjQ0LCAnQTcnOiAzNTIwLjAwLFxuICAnQSM3JzogMzcyOS4zMSwgJ0I3JzogMzk1MS4wNywgJ0M4JzogNDE4Ni4wMVxufVxuXG52YXIgbm90ZXMgPSBPYmplY3Qua2V5cyhzdHIyZnJlcSlcblxuZnVuY3Rpb24gaW50MmZyZXEoaW50Tm90ZSwgb3B0aW9ucyl7XG4gIHZhciBpbmRleCwgc2NhbGU7XG4gIGlmKChpbmRleCA9IG5vdGVzLmluZGV4T2Yob3B0aW9ucy50b25pYykpID09PSAtMSkgdGhyb3cgJ3doYXQgaXMgdXAgd2l0aCB0aGF0IHRvbmljPydcbiAgaWYoIShzY2FsZSA9IHNjYWxlc1tvcHRpb25zLnNjYWxlXSkpIHRocm93ICd3aGF0IGlzIHVwIHdpdGggdGhhdCBzY2FsZT8nXG4gIHdoaWxlIChNYXRoLmFicyhpbnROb3RlKSA+IHNjYWxlLmxlbmd0aCkgc2NhbGUgPSBzY2FsZS5jb25jYXQoc2NhbGUpXG4gIGlmKGludE5vdGUgPj0gMCkgZm9yICh2YXIgaSA9IDA7IGkgPCBpbnROb3RlOyBpbmRleCArPSBzY2FsZVtpXSwgaSs9IDEgKXt9XG4gIGVsc2UgZm9yICh2YXIgaiA9IC0xOyBqID49IGludE5vdGU7IGluZGV4IC09IHNjYWxlW3NjYWxlLmxlbmd0aCArIGpdLCBqLT0gMSl7fVxuICByZXR1cm4gc3RyMmZyZXFbbm90ZXNbaW5kZXhdXVxufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGludDJmcmVxXG5tb2R1bGUuZXhwb3J0cy5zY2FsZXMgPSBPYmplY3Qua2V5cyhzY2FsZXMpXG5tb2R1bGUuZXhwb3J0cy5ub3RlcyA9IE9iamVjdC5rZXlzKG5vdGVzKSIsIm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oYW1vdW50KSB7XG4gIHZhciBrID0gdHlwZW9mIGFtb3VudCA9PT0gJ251bWJlcicgPyBhbW91bnQgOiA1MCxcbiAgICBuX3NhbXBsZXMgPSA0NDEwMCxcbiAgICBjdXJ2ZSA9IG5ldyBGbG9hdDMyQXJyYXkobl9zYW1wbGVzKSxcbiAgICBkZWcgPSBNYXRoLlBJIC8gMTgwLFxuICAgIGkgPSAwLFxuICAgIHg7XG4gIGZvciAoIDsgaSA8IG5fc2FtcGxlczsgKytpICkge1xuICAgIHggPSBpICogMiAvIG5fc2FtcGxlcyAtIDE7XG4gICAgY3VydmVbaV0gPSAoIDMgKyBrICkgKiB4ICogMjAgKiBkZWcgLyAoIE1hdGguUEkgKyBrICogTWF0aC5hYnMoeCkgKTtcbiAgfVxuICByZXR1cm4gY3VydmU7XG59XG4iLCJ2YXIgdmlkU3ludGggPSByZXF1aXJlKCcuLi8nKVxudmFyIGNvbnRleHQgPSBuZXcgKHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCkoKVxubmF2aWdhdG9yLmdldFVzZXJNZWRpYSA9IG5hdmlnYXRvci5nZXRVc2VyTWVkaWEgfHxcbiAgICAgICAgICAgICAgICAgICAgICAgICBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8XG4gICAgICAgICAgICAgICAgICAgICAgICAgbmF2aWdhdG9yLm1vekdldFVzZXJNZWRpYVxuXG52YXIgc3ludGggPSB2aWRTeW50aChjb250ZXh0KVxuc3ludGguY29ubmVjdChjb250ZXh0LmRlc3RpbmF0aW9uKVxuXG52YXIgZ2V0Q2VudGVyUGl4ZWwgPSByZXF1aXJlKCdnZXQtY2VudGVyLXBpeGVsJylcbnZhciBjdHggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnY2FuJykuZ2V0Q29udGV4dCgnMmQnKVxuXG4vLyByZWQgMjU1IDAgMFxuLy8gZ3JlZW4gMCAyNTUgMFxuLy8gYmx1ZSAwIDAgMjU1XG5cbmZ1bmN0aW9uIGlzUmVkIChwaXhlbCkge1xuICByZXR1cm4gcGl4ZWwuciAtIHBpeGVsLmcgLSBwaXhlbC5iID4gMFxufVxuXG5mdW5jdGlvbiBpc0dyZWVuIChwaXhlbCkge1xuICByZXR1cm4gcGl4ZWwuZyAtIHBpeGVsLnIgLSBwaXhlbC5iID4gLTUwXG59XG5cbmZ1bmN0aW9uIGlzQmx1ZSAocGl4ZWwpIHtcbiAgcmV0dXJuIHBpeGVsLmIgLSBwaXhlbC5yIC0gcGl4ZWwuZyA+IDBcbn1cblxudmFyIGNob3JkcyA9IFsnRTQnLCAnRzQnLCAnQjQnLCAnRDUnLCAnRTUnXVxuXG4vLyBtYXAgY29sb3IgdG8gY2hvcmQ/XG52YXIgY3VycmVudERlc2lyZSA9ICdyZWQnXG52YXIgY3VycmVudENob3JkID0gJ0U0J1xuXG5mdW5jdGlvbiBtYXliZUNoYW5nZSAoKSB7XG4gIGlmIChNYXRoLnJhbmRvbSgpIDwgMC4wMjUpIHtcbiAgICBjdXJyZW50RGVzaXJlID0gWydyZWQnLCAnZ3JlZW4nLCAnYmx1ZSddW35+KE1hdGgucmFuZG9tKCkgKiAzKV1cbiAgICBjdXJyZW50Q2hvcmQgPSBjaG9yZHNbfn4oTWF0aC5yYW5kb20oKSAqIDUpXVxuICAgIHN5bnRoLnVwZGF0ZU5vdGUoY3VycmVudENob3JkKVxuXG4gICAgc3RhdGVZb3VyRGVzaXJlKClcbiAgICBjb25zb2xlLmxvZyhjdXJyZW50RGVzaXJlLCBjdXJyZW50Q2hvcmQpXG4gIH1cbn1cblxudmFyIGRpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZGlzcGxheScpXG5cbmZ1bmN0aW9uIHN0YXRlWW91ckRlc2lyZSAoKSB7XG4gIGRpc3BsYXkudGV4dENvbnRlbnQgPSAnSSBERU1BTkQgWU9VIFNIT1cgTUUgJyArIGN1cnJlbnREZXNpcmVcbn1cblxuZnVuY3Rpb24gZG93biAoKSB7XG4gIGlmIChzeW50aC5yb290LmRldHVuZS52YWx1ZSA8IDApIHtcbiAgICBzeW50aC5yb290LmRldHVuZS52YWx1ZSArPSAoTWF0aC5yYW5kb20oKSAqIDUpXG4gIH0gZWxzZSB7XG4gICAgc3ludGgucm9vdC5kZXR1bmUudmFsdWUgLT0gKE1hdGgucmFuZG9tKCkgKiA1KVxuICB9XG4gIGlmIChzeW50aC50aGlyZC5kZXR1bmUudmFsdWUgPCAwKSB7XG4gICAgc3ludGgudGhpcmQuZGV0dW5lLnZhbHVlICs9IChNYXRoLnJhbmRvbSgpICogNSlcbiAgfSBlbHNlIHtcbiAgICBzeW50aC50aGlyZC5kZXR1bmUudmFsdWUgLT0gKE1hdGgucmFuZG9tKCkgKiA1KVxuICB9XG4gIGlmIChzeW50aC5maWZ0aC5kZXR1bmUudmFsdWUgPCAwKSB7XG4gICAgc3ludGguZmlmdGguZGV0dW5lLnZhbHVlICs9IChNYXRoLnJhbmRvbSgpICogNSlcbiAgfSBlbHNlIHtcbiAgICBzeW50aC5maWZ0aC5kZXR1bmUudmFsdWUgLT0gKE1hdGgucmFuZG9tKCkgKiA1KVxuICB9XG5cbiAgaWYgKHN5bnRoLmRlbGF5LmRlbGF5VGltZS52YWx1ZSA+IDEpIHtcbiAgICBzeW50aC5kZWxheS5kZWxheVRpbWUudmFsdWUgLT0gMC4wNVxuICB9XG5cbiAgaWYgKHN5bnRoLmxvd0ZpbHRlci5mcmVxdWVuY3kudmFsdWUgPiA3NTApIHtcbiAgICBzeW50aC5sb3dGaWx0ZXIuZnJlcXVlbmN5LnZhbHVlIC09IH5+KChNYXRoLnJhbmRvbSgpICogNSkgLSAyKVxuICB9XG4gIHJldHVybiAofn5NYXRoLmFicyhzeW50aC5yb290LmRldHVuZS52YWx1ZSkgPD0gMSAmJiB+fk1hdGguYWJzKHN5bnRoLnRoaXJkLmRldHVuZS52YWx1ZSkgPD0gMSAmJiB+fk1hdGguYWJzKHN5bnRoLmZpZnRoLmRldHVuZS52YWx1ZSkgPD0gMSlcbn1cblxuZnVuY3Rpb24gdXAgKCkge1xuICBzeW50aC5yb290LmRldHVuZS52YWx1ZSArPSAoKE1hdGgucmFuZG9tKCkgKiA1KSAtIDIpXG4gIHN5bnRoLmZpZnRoLmRldHVuZS52YWx1ZSArPSAoKE1hdGgucmFuZG9tKCkgKiA1KSAtIDIpXG4gIHN5bnRoLnRoaXJkLmRldHVuZS52YWx1ZSArPSAoKE1hdGgucmFuZG9tKCkgKiA1KSAtIDIpXG4gIHN5bnRoLmxvd0ZpbHRlci5mcmVxdWVuY3kudmFsdWUgKz0gKChNYXRoLnJhbmRvbSgpICogNSkgLSAyKVxuICBpZiAoc3ludGgubG93RmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSA+IDE1MDAwKSB7XG4gICAgc3ludGgubG93RmlsdGVyLmZyZXF1ZW5jeS52YWx1ZSAtPSAoTWF0aC5yYW5kb20oKSAqIDUwMClcbiAgfVxuICBpZiAoc3ludGguZGVsYXkuZGVsYXlUaW1lLnZhbHVlIDwgMTQuOTQ1KSB7XG4gICAgc3ludGguZGVsYXkuZGVsYXlUaW1lLnZhbHVlICs9IDAuMDVcbiAgfVxufVxuXG5ndW1Ecm9wTWFnaWMoZnVuY3Rpb24gKHBpeGVsKSB7XG4gIC8vIElGIHRoZSBwaXhlbCBpcyB3aXRoaW4gdGhyZXNoaG9sZCBvZiBjdXJyZW50IGNvbG9yIGRlc2lyZXMsIGxvd2VyIGRldHVuaW5nXG4gIC8vIGVsc2UsIGluY3JlYXNlIGRldHVuaW5nXG4gIGRpc3BsYXkuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gJ3JnYignICsgcGl4ZWwuciArICcsJyArIHBpeGVsLmcgKyAnLCcgKyBwaXhlbC5iICsgJyknXG5cbiAgaWYgKGN1cnJlbnREZXNpcmUgPT09ICdyZWQnKSB7XG4gICAgaWYgKGlzUmVkKHBpeGVsKSkge1xuICAgICAgaWYgKGRvd24oKSkge1xuICAgICAgICBtYXliZUNoYW5nZSgpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwKClcbiAgICB9XG4gIH0gZWxzZSBpZiAoY3VycmVudERlc2lyZSA9PT0gJ2dyZWVuJykge1xuICAgIGlmIChpc0dyZWVuKHBpeGVsKSkge1xuICAgICAgaWYgKGRvd24oKSkge1xuICAgICAgICBtYXliZUNoYW5nZSgpXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHVwKClcbiAgICB9XG4gIH0gZWxzZSBpZiAoY3VycmVudERlc2lyZSA9PT0gJ2JsdWUnKSB7XG4gICAgaWYgKGlzQmx1ZShwaXhlbCkpIHtcbiAgICAgIGlmIChkb3duKCkpIHtcbiAgICAgICAgbWF5YmVDaGFuZ2UoKVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB1cCgpXG4gICAgfVxuICB9XG59KVxuXG5mdW5jdGlvbiBndW1Ecm9wTWFnaWMgKGNiKSB7XG4gIGlmIChuYXZpZ2F0b3IuZ2V0VXNlck1lZGlhKSB7XG4gICAgbmF2aWdhdG9yLmdldFVzZXJNZWRpYSh7dmlkZW86IHRydWV9LCBmdW5jdGlvbiAoc3RyZWFtKSB7XG4gICAgICB2YXIgdmlkZW8gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgndmlkZW8nKVxuICAgICAgdmlkZW8uc3JjID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwoc3RyZWFtKVxuICAgICAgdmlkZW8ub25sb2FkZWRtZXRhZGF0YSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIHZpZGVvLnBsYXkoKVxuICAgICAgICBzeW50aC5zdGFydCgpXG4gICAgICAgIHN0YXRlWW91ckRlc2lyZSgpXG5cbiAgICAgICAgZnVuY3Rpb24gZHJhdyAoKSB7XG4gICAgICAgICAgY3R4LmRyYXdJbWFnZSh2aWRlbywgMCwgMCwgMzIwLCAyNDApXG4gICAgICAgICAgdmFyIGRhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIDMyMCwgMjQwKS5kYXRhXG4gICAgICAgICAgdmFyIHBpeGVsID0gZ2V0Q2VudGVyUGl4ZWwoZGF0YSwgMzIwLCAyNDApXG4gICAgICAgICAgY2IocGl4ZWwpXG4gICAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShkcmF3KVxuICAgICAgICB9XG4gICAgICAgIGRyYXcoKVxuXG4gICAgICAgIGNiKHRydWUpXG4gICAgICB9IC8vIGVycm9yIGNhbGxiYWNrOiBob3cgdG8gYXR0ZW1wdCB0byBnZXQganVzdCBhdWRpbyBpZiB2aWRlbyBmYWlscz9cbiAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIGRvY3VtZW50LmJvZHkudGV4dENvbnRlbnQgPSAnc29ycnkgZ29zaCwgd293LCBzb21ldGhpbmcgaG9ycmlibGUgbXVzdCBoYXZlIGhhcHBlbmVkJyArIGVyclxuICAgICAgfSlcbiAgfSBlbHNlIHtcbiAgICBkb2N1bWVudC5ib2R5LnRleHRDb250ZW50ID0gJ3NvcnJ5IHlyIGRldmljZSBkb2VzIG5vdCBoYXZlIGEgd2ViY2FtIG9yIHNvbWV0aGluZyB3aG9vcHMnXG4gIH1cbn1cbiJdfQ==
