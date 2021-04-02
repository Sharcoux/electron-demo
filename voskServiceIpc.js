const vosk = require('vosk')
const { ipcMain, systemPreferences } = require('electron')

function register () {
  /** @type {vosk.Model} */
  /** @type {vosk.Recognizer<Partial<vosk.GrammarRecognizerParam>>} */
  let rec

  ipcMain.on('start-speech2text', (event, sampleRate) => {
    const model = new vosk.Model('./assets/models/en-US')
    rec = new vosk.Recognizer({ model, sampleRate })
    event.returnValue = true
  })

  ipcMain.on('feed-speech2text', async (
    event,
    /** @type {{ data: Buffer }} **/ { data }
  ) => {
    if (!rec) return
    const endOfSpeech = rec.acceptWaveform(data)
    if (endOfSpeech) {
      event.reply('partial-speech2text', rec.result())
    }
  })

  ipcMain.on('finish-speech2text', (event) => {
    if (!rec) return
    const result = rec.finalResult()
    event.reply('result-speech2text', result)
    rec.free()
    rec = undefined
  })

  // Request for authorization to use microphone
  ipcMain.on('activate-microphone', (event) => {
    systemPreferences
      .askForMediaAccess('microphone')
      .then((result) => event.reply('activate-microphone-response', result))
  })
}

module.exports = register
