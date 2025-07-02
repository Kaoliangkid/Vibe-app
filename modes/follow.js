// modes/follow.js
export default {
  name: 'Follow',
  echo: false,
  sensitivity: 1,
  delay: 0.5,
  gravity: { x: 0, y: 0, z: 0 },
  alpha: 0.8,

  start() {
    this.gravity = { x: 0, y: 0, z: 0 };
    this.listener = e => {
      const aIncl = e.accelerationIncludingGravity;
      if (!aIncl) return;

      this.gravity.x = this.alpha * this.gravity.x + (1 - this.alpha) * aIncl.x;
      this.gravity.y = this.alpha * this.gravity.y + (1 - this.alpha) * aIncl.y;
      this.gravity.z = this.alpha * this.gravity.z + (1 - this.alpha) * aIncl.z;

      const dx = aIncl.x - this.gravity.x;
      const dy = aIncl.y - this.gravity.y;
      const dz = aIncl.z - this.gravity.z;
      const mag = Math.sqrt(dx*dx + dy*dy + dz*dz);

      const dur = Math.min(Math.round(mag * 50 * this.sensitivity), 300);
      if (dur <= 0) return;

      navigator.vibrate(dur);

      if (this.echo) {
        let repDur = dur;
        for (let i = 1; i <= 3; i++) {
          repDur = Math.round(repDur * 0.6);
          setTimeout(() => {
            if (repDur > 10) navigator.vibrate(repDur);
          }, this.delay * 1000 * i);
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
