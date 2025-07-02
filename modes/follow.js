export default {
  name: 'Follow',

  start() {
    this.listener = e => {
      // use accelerationIncludingGravity for best responsiveness
      const a = e.accelerationIncludingGravity;
      if (!a) return;

      // calculate overall movement magnitude
      const mag = Math.sqrt(
        (a.x||0)**2 +
        (a.y||0)**2 +
        (a.z||0)**2
      );

      // map magnitude → vibration duration (20–200 ms)
      const dur = Math.min(Math.max(Math.round(mag * 50), 20), 200);

      // vibrate once (and echo if requested)
      navigator.vibrate(dur);
      if (this.echo) {
        setTimeout(() => navigator.vibrate(dur), dur + 50);
      }
    };

    window.addEventListener('devicemotion', this.listener);
  },

  stop() {
    window.removeEventListener('devicemotion', this.listener);
    this.listener = null;
  }
};
