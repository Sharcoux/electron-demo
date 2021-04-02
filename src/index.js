import React from 'react';
import ReactDOM from 'react-dom';
const { ipcRenderer } = global.require('electron')

ReactDOM.render(
  <React.StrictMode>
    <button onClick={() => ipcRenderer.send('activate-microphone')}>Start</button>
  </React.StrictMode>,
  document.getElementById('root')
);
