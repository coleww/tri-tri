var makeDistortionCurve = require('make-distortion-curve')
var int2freq = require('int2freq')

// ADD SP<E DE:LAY
// MAKE IT WEIRDER, YEAH?

module.exports = function (context, data) {
  var nodes={}
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

  nodes.updateNote = function (note, scaale){
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

  nodes.export = function(){
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

  nodes.connect = function(destination){
    this.volume.connect(destination)
  }

  nodes.start = function(){
    this.root.start()
    this.third.start()
    this.fifth.start()
  }

  nodes.keys = function(){
    return Object.keys(this).filter(function(k){
      return ['import', 'export', 'connect', 'start', 'keys', 'updateNote'].indexOf(k) === -1
    })
  }

  nodes.import(data)

  return nodes
}