// modes/follow.js
export default {
  name: 'Follow',
  echo: false,
  delay: 0.5,
  threshold: 1,       // ft/s² below this = no vibration
  maxMag: 40,         // ft/s² mapped to max duration
  maxDur: 300,        // ms

  start() {
    this.listener = e => {
      let mag;
      if (e.acceleration && e.acceleration.x !== null) {
        const acc = e.acceleration;
        mag = Math.sqrt((acc.x||0)**2 + (acc.y||0)**2 + (acc.z||0)**2);
      } else {
        return; // skip fallback to keep it simple
      }

      if (mag < this.threshold) return;
      const norm = Math.min((mag - this.threshold) / (this.maxMag - this.threshold), 1);
      const dur  = Math.round(norm * this.maxDur);

      navigator.vibrate(dur);

      if (this.echo) {
        setTimeout(() => navigator.vibrate(dur), this.delay * 1000);
      }
    };

    window.addEventListener('devicemotion', this.listener);
  },

  stop() {
    window.removeEventListener('devicemotion', this.listener);
    this.listener = null;
  }
};
