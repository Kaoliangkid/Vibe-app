// script.js
import follow from './modes/follow.js';
// import other modes as needed

const modes = [ follow /*, momentum, game, music, relax */ ];
let activeMode = null;
let readoutListener = null;

window.addEventListener('DOMContentLoaded', () => {
  const modesDiv = document.getElementById('modes');
  modes.forEach((m, i) => {
    const label = document.createElement('label');
    const radio = document.createElement('input');
    radio.type  = 'radio';
    radio.name  = 'mode';
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

  // apply initial settings
  activeMode.echo        = document.getElementById('echoToggle').checked;
  activeMode.sensitivity = parseFloat(document.getElementById('sensitivitySlider').value);
  activeMode.delay       = parseFloat(document.getElementById('delaySlider').value);

  activeMode.start();

  // live readout
  readoutListener = e => {
    const a = e.accelerationIncludingGravity || {};
    const mag = Math.sqrt((a.x||0)**2 + (a.y||0)**2 + (a.z||0)**2);
    const magFt = (mag * 3.28084).toFixed(2);
    const r = e.rotationRate || {};
    document.getElementById('readoutText').textContent =
      `Accel: ${magFt} ft/s²` +
      `\nRotation \u03B1:${(r.alpha||0).toFixed(2)} ` +
      `\u03B2:${(r.beta||0).toFixed(2)} ` +
      `\u03B3:${(r.gamma||0).toFixed(2)}`;
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
