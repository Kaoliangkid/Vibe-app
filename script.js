// script.js
import follow from './modes/follow.js';
// import other modes here:
// import momentum from './modes/momentum.js';

const modes = [ follow /*, momentum, ... */ ];
let activeMode = null;
let readoutListener = null;

window.addEventListener('DOMContentLoaded', () => {
  const modesDiv = document.getElementById('modes');

  modes.forEach((m, i) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio'; radio.name = 'mode'; radio.value = m.name;
    if (i === 0) radio.checked = true;
    radio.onchange = () => onModeChange(m);

    label.append(radio, ' ', m.name);
    modesDiv.append(label, document.createElement('br'));
  });

  // initialize first
  onModeChange(modes[0]);

  document.getElementById('startBtn').onclick = start;
  document.getElementById('stopBtn').onclick  = stop;
});

function onModeChange(mode) {
  // stop previous if running
  if (activeMode && activeMode.listener) activeMode.stop();

  activeMode = mode;
  const settingsDiv = document.getElementById('settings');
  settingsDiv.innerHTML = '';

  mode.settings.forEach(s => {
    const row = document.createElement('div');
    const lbl = document.createElement('label');
    lbl.textContent = s.label + ' ';

    let input;
    if (s.type === 'range') {
      input = document.createElement('input');
      input.type = 'range';
      input.min = s.min; input.max = s.max; input.step = s.step;
      input.value = s.default;
    } else if (s.type === 'checkbox') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = s.default;
    }

    const valDisplay = document.createElement('span');
    if (s.type === 'range') valDisplay.textContent = s.default;
    input.oninput = e => {
      const v = s.type === 'checkbox' ? e.target.checked : parseFloat(e.target.value);
      mode[s.key] = v;
      if (s.type === 'range') valDisplay.textContent = e.target.value;
    };

    // set initial
    mode[s.key] = s.default;

    row.append(lbl, input, valDisplay);
    settingsDiv.append(row);
  });
}

function start() {
  if (!activeMode) return;
  activeMode.start();

  // attach readout
  readoutListener = e => {
    const acc = e.acceleration;
    const mag = acc && acc.x !== null
      ? Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2)
      : 0;
    const magFt = (mag * 3.28084).toFixed(2);
    const rot = e.rotationRate || {};

    document.getElementById('readoutText').textContent =
      `Accel: ${magFt} ft/s² \n` +
      `Rotation α:${(rot.alpha||0).toFixed(2)} ` +
      `β:${(rot.beta||0).toFixed(2)} ` +
      `γ:${(rot.gamma||0).toFixed(2)}`;
  };
  window.addEventListener('devicemotion', readoutListener);

  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn').disabled  = false;
}

function stop() {
  if (!activeMode) return;
  activeMode.stop();
  navigator.vibrate(0);

  window.removeEventListener('devicemotion', readoutListener);
  document.getElementById('readoutText').textContent = '';

  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn').disabled  = true;
}
