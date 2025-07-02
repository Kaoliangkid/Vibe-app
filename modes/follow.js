// modes/follow.js
export default {
  name: 'Follow',

  // settings metadata: only this file needs editing
  settings: [
    { key: 'threshold', label: 'Threshold (ft/s²)', type: 'range', min: 1, max: 10, step: 0.1, default: 1 },
    { key: 'maxMag',    label: 'Max Motion (ft/s²)', type: 'range', min: 10, max: 60, step: 1, default: 40 },
    { key: 'maxDur',    label: 'Max Duration (ms)', type: 'range', min: 100, max: 500, step: 10, default: 300 },
    { key: 'echo',      label: 'Echo', type: 'checkbox', default: false },
    { key: 'delay',     label: 'Echo Delay (s)', type: 'range', min: 0.01, max: 2, step: 0.01, default: 0.5 }
  ],

  start() {
    this.listener = e => {
      const acc = e.acceleration;
      if (!acc || acc.x === null) return;

      const mag = Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2);
      if (mag < this.threshold) return;

      const norm = Math.min((mag - this.threshold) / (this.maxMag - this.threshold), 1);
      const dur  = Math.round(norm * this.maxDur);

      navigator.vibrate(dur);
      if (this.echo) setTimeout(() => navigator.vibrate(dur), this.delay * 1000);
    };
    window.addEventListener('devicemotion', this.listener);
  },

  stop() {
    window.removeEventListener('devicemotion', this.listener);
    this.listener = null;
  }
};
