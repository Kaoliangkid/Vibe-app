// modes/follow.js
export default {
  name: 'Follow',
  echo: false,
  sensitivity: 1,
  delay: 0.5,

  start() {
    this.listener = e => {
      const a = e.accelerationIncludingGravity;
      if (!a) return;

      const mag = Math.sqrt(
        (a.x||0)**2 +
        (a.y||0)**2 +
        (a.z||0)**2
      );

      // map magnitude → vibration duration
      let dur = Math.min(Math.max(
        Math.round(mag * 50 * this.sensitivity),
        0), 300
      );
      if (dur <= 0) return;

      navigator.vibrate(dur);

      if (this.echo) {
        // diminishing echoes (3 repeats)
        let repDur = dur;
        for (let i = 1; i <= 3; i++) {
          repDur = Math.round(repDur * 0.6);
          setTimeout(() => {
            if (repDur > 10) navigator.vibrate(repDur);
          }, (this.delay * 1000) * i);
        }
      }
    };

    window.addEventListener('devicemotion', this.listener);
  },

  stop() {
    window.removeEventListener('devicemotion', this.listener);
    this.listener = null;
  }
};
