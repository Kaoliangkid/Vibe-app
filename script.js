// script.js
import follow from './modes/follow.js';

const modes = [ follow ];
let activeMode = null;
let readoutListener = null;

// Globals for readout high-pass filter
let gravity = { x: 0, y: 0, z: 0 };
const alpha = 0.8;

window.addEventListener('DOMContentLoaded', () => {
  const modesDiv = document.getElementById('modes');
  modes.forEach((m, i) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'mode';
    radio.value = m.name;
    if (i === 0) radio.checked = true;
    radio.onchange = () => onModeChange(m);

    label.append(radio, ' ', m.name);
    modesDiv.append(label, document.createElement('br'));
  });

  // initialize first mode
  onModeChange(modes[0]);

  document.getElementById('startBtn').addEventListener('click', start);
  document.getElementById('stopBtn').addEventListener('click', stop);
});

function onModeChange(mode) {
  // stop any running mode
  if (activeMode && activeMode.listener) activeMode.stop();

  activeMode = mode;
  const settingsDiv = document.getElementById('settings');
  settingsDiv.innerHTML = '';

  mode.settings.forEach(s => {
    const row = document.createElement('div');
    const lbl = document.createElement('label');
    lbl.textContent = s.label + ': ';
    let input, valDisplay;

    if (s.type === 'range') {
      input = document.createElement('input');
      input.type  = 'range';
      input.min   = s.min;
      input.max   = s.max;
      input.step  = s.step;
      input.value = s.default;
      valDisplay   = document.createElement('span');
      valDisplay.textContent = s.default;
    } else if (s.type === 'checkbox') {
      input = document.createElement('input');
      input.type    = 'checkbox';
      input.checked = s.default;
      valDisplay     = document.createElement('span');
      valDisplay.textContent = '';
    }

    input.oninput = e => {
      const v = s.type === 'checkbox'
        ? e.target.checked
        : parseFloat(e.target.value);
      mode[s.key] = v;
      if (s.type === 'range') valDisplay.textContent = e.target.value;
    };

    // set initial value on mode
    mode[s.key] = s.default;

    row.append(lbl, input, ' ', valDisplay);
    settingsDiv.append(row);
  });
}

function start() {
  if (!activeMode) return;
  activeMode.start();

  // live readout
  readoutListener = e => {
    const aIncl = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
    gravity.x = alpha * gravity.x + (1 - alpha) * aIncl.x;
    gravity.y = alpha * gravity.y + (1 - alpha) * aIncl.y;
    gravity.z = alpha * gravity.z + (1 - alpha) * aIncl.z;

    const dx = aIncl.x - gravity.x;
    const dy = aIncl.y - gravity.y;
    const dz = aIncl.z - gravity.z;
    const mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const magFt = (mag * 3.28084).toFixed(2);

    const r = e.rotationRate || {};
    document.getElementById('readoutText').textContent =
      `Accel: ${magFt} ft/s²\n` +
      `Rotation α:${(r.alpha||0).toFixed(2)} β:${(r.beta||0).toFixed(2)} γ:${(r.gamma||0).toFixed(2)}`;
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
