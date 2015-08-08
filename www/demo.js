var vidSynth = require('../')
var context = new (window.AudioContext || window.webkitAudioContext)()
navigator.getUserMedia = navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia


var synth = vidSynth(context)
synth.connect(context.destination)


var getCenterPixel =require('get-center-pixel')
var ctx = document.getElementById('canvas').getContext("2d")


// red 255 0 0
// green 0 255 0
// blue 0 0 255

function isRed (pixel) {
  return pixel.r - pixel.g - pixel.b > 127
}

function isGreen (pixel){
  return pixel.g - pixel.r - pixel.b > 127
}

function isBlue (pixel) {
  return pixel.b - pixel.r - pixel.g > 127
}



var chords = ["E4", "G4", "B4", "D5", "E5"]
// map color to chord?
var currentDesire = "red"
var currentChord = "E4"

function maybeChange () {
  if(Math.random() < 0.01){
    currentDesire = ["red", "green", "blue"][~~(Math.random() * 3)]
    synth.updateNote(chords[~~(Math.random * 5)])
    stateYourDesire()
  }
}

var display = document.getElementById("display")

function stateYourDesire () {
  display.textContent = "I DEMAND YOU SHOW ME " + currentDesire
  window.setTimeout(function(){
    display.textContent = ""

  }, 7500)
}

function down () {
  synth.root.detune.value -= Math.random() * 5
  synth.fifth.detune.value -= Math.random() * 5
  synth.third.detune.value -= Math.random() * 5
  if(synth.root.detune.value < 0) synth.root.detune.value = 0
  if(synth.fifth.detune.value < 0) synth.fifth.detune.value = 0
  if(synth.third.detune.value < 0) synth.third.detune.value = 0
  return (synth.root.detune.value == 0 && synth.third.detune.value == 0 && synth.fifth.detune.value == 0)
}

function up () {
  synth.root.detune.value += Math.random() * 5
  synth.fifth.detune.value += Math.random() * 5
  synth.third.detune.value += Math.random() * 5
}

gumDropMagic(function(pixel){
  // IF the pixel is within threshhold of current color desires, lower detuning
  // else, increase detuning
  display.style.backgroundColor = "rgb(" + pixel.r + "," + pixel.g + "," + pixel.b + ")"

  if (currentDesire == 'red') {
    if (isRed(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  } else if (currentDesire == 'green') {
    if (isGreen(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  } else if (currentDesire == 'blue') {
    if (isBlue(pixel)) {
      if (down()) {
        maybeChange()
      }
    } else {
      up()
    }
  }


  // OCCASIONALLY, change the current chord and desire

})



function gumDropMagic (cb){
  if (navigator.getUserMedia) {
    navigator.getUserMedia({video: true}, function (stream) {
      var video = document.getElementById('video')
      video.src = window.URL.createObjectURL(stream)
      video.onloadedmetadata = function (e) {
        video.play()
        synth.start()

        function draw () {
          ctx.drawImage(video)
          var data = ctx.getImageData(0, 0, 320, 240).data
          cb(getCenterPixel(data, 320, 240))

          requestAnimationFrame(draw)
        }
        draw()

        cb(true)
      } // error callback: how to attempt to get just audio if video fails?
    }, function (err)  {
        document.body.textContent = "sorry gosh, wow, something horrible must have happened"
        console.log(err)
      })
  } else {
    document.body.textContent = "sorry yr device does not have a webcam or something whoops"
  }
}