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
  readoutListener = e => {
    let dx, dy, dz;
    if (e.acceleration && e.acceleration.x !== null) {
      // use gravity-free acceleration directly
      dx = e.acceleration.x;
      dy = e.acceleration.y;
      dz = e.acceleration.z;
    } else {
      // fallback to high-pass filter
      const aIncl = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      gravity.x = alpha * gravity.x + (1 - alpha) * aIncl.x;
      gravity.y = alpha * gravity.y + (1 - alpha) * aIncl.y;
      gravity.z = alpha * gravity.z + (1 - alpha) * aIncl.z;
      dx = aIncl.x - gravity.x;
      dy = aIncl.y - gravity.y;
      dz = aIncl.z - gravity.z;
    }
    const mag = Math.sqrt(dx*dx + dy*dy + dz*dz);
    const magFt = (mag * 3.28084).toFixed(2);

    const r = e.rotationRate || {};
    document.getElementById('readoutText').textContent =
      `Accel: ${magFt} ft/s²\n` +
      `Rotation α:${(r.alpha||0).toFixed(2)} ` +
      `β:${(r.beta||0).toFixed(2)} ` +
      `γ:${(r.gamma||0).toFixed(2)}`;
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
