import follow from './modes/follow.js';
const modes = [ follow ];
let activeMode = null;

window.addEventListener('DOMContentLoaded', () => {
  const modesDiv = document.getElementById('modes');
  const startBtn = document.getElementById('startBtn');
  const stopBtn  = document.getElementById('stopBtn');

  modes.forEach((m, i) => {
    const lbl   = document.createElement('label');
    const radio = document.createElement('input');
    radio.type  = 'radio';
    radio.name  = 'mode';
    radio.value = m.name;
    if (i === 0) radio.checked = true;
    radio.addEventListener('change', () => buildSettings(m));
    lbl.append(radio, ' ', m.name);
    modesDiv.append(lbl, document.createElement('br'));
    if (i === 0) buildSettings(m);
  });

  startBtn.addEventListener('click', start);
  stopBtn .addEventListener('click', stop);
});

function buildSettings(mode) {
  const settingsDiv = document.getElementById('settings');
  settingsDiv.innerHTML = '';
  mode.settings.forEach(s => {
    const row   = document.createElement('div');
    const label = document.createElement('label');
    label.textContent = s.label + (s.type==='range' ? `: ${s.default}` : '');
    row.append(label);

    let input;
    if (s.type === 'range') {
      input = document.createElement('input');
      Object.assign(input, {
        type: 'range',
        min:  s.min,
        max:  s.max,
        step: s.step,
        value:s.default
      });
      const valSpan = document.createElement('span');
      valSpan.textContent = s.default;
      input.addEventListener('input', () => {
        valSpan.textContent   = input.value;
        label.textContent     = `${s.label}: ${input.value}`;
      });
      row.append(input, valSpan);

    } else if (s.type === 'checkbox') {
      input = document.createElement('input');
      Object.assign(input, {
        type:    'checkbox',
        checked: s.default
      });
      row.insertBefore(input, label);
    }

    input.addEventListener('change', () => {
      mode[s.key] = (s.type === 'checkbox') ? input.checked : parseFloat(input.value);
    });
    mode[s.key] = s.default;
    settingsDiv.append(row);
  });
}

function start() {
  const chosen = document.querySelector('input[name="mode"]:checked').value;
  activeMode = modes.find(m => m.name === chosen);
  activeMode.start();

  // Motion readout
  activeMode.readout = document.getElementById('readout');
  activeMode.readoutListener = e => {
    const a    = e.acceleration || { x:0,y:0,z:0 };
    const magFt= Math.hypot(a.x,a.y,a.z)*3.28084;
    activeMode.readout.textContent = `Motion: ${magFt.toFixed(2)} ft/s²`;
  };
  window.addEventListener('devicemotion', activeMode.readoutListener);

  // Vibe Info panel
  let infoEl = document.getElementById('vibeInfo');
  if (!infoEl) {
    infoEl = document.createElement('pre');
    infoEl.id = 'vibeInfo';
    infoEl.textContent = 'Vibe Info:';
    document.body.append(infoEl);
  }
  activeMode.vibeInfoEl = infoEl;

  document.getElementById('startBtn').disabled = true;
  document.getElementById('stopBtn') .disabled = false;
}

function stop() {
  if (!activeMode) return;
  activeMode.stop();
  window.removeEventListener('devicemotion', activeMode.readoutListener);
  document.getElementById('startBtn').disabled = false;
  document.getElementById('stopBtn') .disabled = true;
}
