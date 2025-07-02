// import each mode; once you add more you'll just add imports here
import follow from './modes/follow.js';
// import momentum from './modes/momentum.js';
// import game     from './modes/game.js';
// import music    from './modes/music.js';
// import relax    from './modes/relax.js';

const modes = [ follow /*, momentum, game, music, relax */ ];

let activeMode = null;

window.addEventListener('DOMContentLoaded', () => {
  const modesDiv = document.getElementById('modes');
  modes.forEach((m, i) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'mode';
    radio.value = m.name;
    if (i === 0) radio.checked = true;
    label.append(radio, ' ', m.name);
    modesDiv.append(label, document.createElement('br'));
  });

  document.getElementById('startBtn').onclick = start;
  document.getElementById('stopBtn').onclick  = stop;
});

function start() {
  const chosen = document.querySelector('input[name="mode"]:checked').value;
  activeMode = modes.find(m => m.name === chosen);
  activeMode.echo = document.getElementById('echoToggle').checked;
  activeMode.start();
  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled  = false;
}

function stop() {
  if (!activeMode) return;
  activeMode.stop();
  navigator.vibrate(0);
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled  = true;
}
