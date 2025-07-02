// script.js
import follow from './modes/follow.js';

const modes = [ follow /*, momentum, game, music, relax */ ];
let activeMode = null;
let readoutListener = null;

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

  // update echo delay label live
  document.getElementById('delaySlider').oninput = e => {
    document.getElementById('delayLabel').textContent = e.target.value;
    if (activeMode) activeMode.delay = parseFloat(e.target.value);
  };
});

function start() {
  const chosen = document.querySelector('input[name="mode"]:checked').value;
  activeMode = modes.find(m => m.name === chosen);

  activeMode.echo  = document.getElementById('echoToggle').checked;
  activeMode.delay = parseFloat(document.getElementById('delaySlider').value);

  activeMode.start();

  // live accel/gyro readout
  readoutListener = e => {
    let dx, dy, dz;
    if (e.acceleration && e.acceleration.x !== null) {
      dx = e.acceleration.x;
      dy = e.acceleration.y;
      dz = e.acceleration.z;
    } else {
      // fallback: high-pass to remove gravity
      const aIncl = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      // simple single-pole HPF (persistent gravity filter)
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

// persistent globals for fallback filter
let gravity = { x: 0, y: 0, z: 0 };
const alpha = 0.8;
