import {
  MediaRecorder,
  register
} from 'extendable-media-recorder'
import { connect } from 'extendable-media-recorder-wav-encoder'
connect().then((connection) => register(connection))

const { ipcRenderer } = global.require('electron')

async function voskRecognizer (
  stream,
  sampleRate,
  onResult
) {
  const recorder = new MediaRecorder(stream, { mimeType: 'audio/wav' })
  recorder.ondataavailable = function (e) {
    const readStream = e.data.stream()
    const reader = readStream.getReader()
    async function processWav ({
      value,
      done
    }) {
      if (!done) {
        ipcRenderer.send('feed-speech2text', { data: value, sampleRate })
        return reader.read().then((e) => processWav(e))
      }
      if (recorder.state === 'inactive') {
        ipcRenderer.send('finish-speech2text')
      }
    }
    reader.read().then(processWav)
  }
  const partialCallback = (_event, value) =>
  onResult([value.text])
  ipcRenderer.on('partial-speech2text', partialCallback)
  ipcRenderer.once(
  'result-speech2text',
  (_event, value) => {
    ipcRenderer.removeListener('partial-speech2text', partialCallback)
    onResult([value.text])
  }
  )

  ipcRenderer.sendSync('start-speech2text', sampleRate)
  recorder.start(2000)
}

export async function start (callback) {
  console.info('Wav support:', MediaRecorder.isTypeSupported('audio/wav'))
  return new Promise((resolve, reject) => {
    ipcRenderer.send('activate-microphone')
    ipcRenderer.once(
      'activate-microphone-response',
      (_event, allowed) => allowed ? resolve() : reject(new Error('unauthorized to use mic'))
    )
  }).then(() => navigator.mediaDevices
    .getUserMedia({
      audio: {
        sampleSize: 16,
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
      }
    }))
    .then((stream) => {
      const audioTrack = stream.getAudioTracks()[0]
      if (!audioTrack) { return Promise.reject(new Error('No compatible microphone detected')) }
      const sampleRate = audioTrack.getSettings().sampleRate || 16000
      console.info('Using sample rate:', sampleRate)
      // convert to wav and pass to vosk Recognizer
      return voskRecognizer(stream, sampleRate, callback)
    })
    .catch(function (error) {
      console.log(error)
    })
}

function App() {
  return (
    <div>
      <header>
        <button onClick={start}>Start</button>
      </header>
    </div>
  );
}

export default App;
