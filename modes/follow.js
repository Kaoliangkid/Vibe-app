export default {
  name: "Follow",

  // Tuning parameters (you can tweak these in one place)
  settings: {
    threshold: 1,     // ft/s² below this → no vibration
    maxDur:    800,   // ms for a 40 ft/s² shake
    echoDelay: 0.5    // seconds after first buzz for echo
  },

  start() {
    const { threshold, maxDur, echoDelay } = this.settings;

    // Device-motion listener
    this.listener = (e) => {
      // Use raw acceleration (zero at rest)
      const a = e.acceleration || { x: 0, y: 0, z: 0 };
      const mag = Math.hypot(a.x, a.y, a.z);

      if (mag <= threshold) return;
      // Map [threshold‥40] → [0‥maxDur]
      const norm = Math.min((mag - threshold) / (40 - threshold), 1);
      const dur  = Math.round(norm * maxDur);

      // Choose native if available, else fallback
      const buzz = (d) => {
        if (window.NativeVibe?.vibrate) {
          window.NativeVibe.vibrate(d, 255);
        } else {
          navigator.vibrate(d);
        }
      };

      // Fire main buzz
      buzz(dur);

      // Schedule one echo after echoDelay
      if (echoDelay > 0) {
        setTimeout(() => buzz(dur), echoDelay * 1000);
      }
    };

    window.addEventListener("devicemotion", this.listener);
  },

  stop() {
    window.removeEventListener("devicemotion", this.listener);
    navigator.vibrate(0);
    this.listener = null;
  },
};
