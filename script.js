// script.js
import follow from './modes/follow.js';
// import other modes as needed

const modes = [ follow /*, momentum, game, music, relax */ ];
let activeMode = null;
let readoutListener = null;
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
    label.append(radio, ' ', m.name);
    modesDiv.append(label, document.createElement('br'));
  });

  const sensSlide = document.getElementById('sensitivitySlider');
  const delaySlide = document.getElementById('delaySlider');

  sensSlide.oninput = e => {
    document.getElementById('sensLabel').textContent = e.target.value;
    if (activeMode) activeMode.sensitivity = parseFloat(e.target.value);
  };
  delaySlide.oninput = e => {
    document.getElementById('delayLabel').textContent = e.target.value;
    if (activeMode) activeMode.delay = parseFloat(e.target.value);
  };

  document.getElementById('startBtn').onclick = start;
  document.getElementById('stopBtn').onclick  = stop;
});

function start() {
  const chosen = document.querySelector('input[name="mode"]:checked').value;
  activeMode = modes.find(m => m.name === chosen);

  // apply settings
  activeMode.echo        = document.getElementById('echoToggle').checked;
  activeMode.sensitivity = parseFloat(document.getElementById('sensitivitySlider').value);
  activeMode.delay       = parseFloat(document.getElementById('delaySlider').value);

  activeMode.start();

  // live dynamic readout
  gravity = { x: 0, y: 0, z: 0 };
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
    const text = 
      `Accel: ${magFt} ft/s²\n` +
      `Rotation α:${(r.alpha||0).toFixed(2)} ` +
      `β:${(r.beta||0).toFixed(2)} ` +
      `γ:${(r.gamma||0).toFixed(2)}`;
    document.getElementById('readoutText').textContent = text;
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
  document.getElementById('stopBtn').disabled = true;
}
