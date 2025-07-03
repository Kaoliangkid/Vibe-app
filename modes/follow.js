const alpha = 0.8;

export default {
  name: 'Follow',
  settings: [
    { key:'threshold', label:'Threshold (ft/s²)', type:'range',    min:0,  max:10,   step:0.1, default:1   },
    { key:'maxMag',    label:'Max Motion (ft/s²)', type:'range',    min:10, max:60,   step:1,   default:40  },
    { key:'maxDur',    label:'Max Duration (ms)',  type:'range',    min:100,max:1000, step:10,  default:800 },
    { key:'echo',      label:'Echo',                type:'checkbox',               default:true},
    { key:'delay',     label:'Echo Delay (s)',     type:'range',    min:0.1, max:2,    step:0.1, default:0.5}
  ],

  start() {
    this.gravity = { x:0, y:0, z:0 };

    this.listener = e => {
      const aIncl = e.accelerationIncludingGravity;
      if (!aIncl) return;

      this.gravity.x = alpha*this.gravity.x + (1-alpha)*aIncl.x;
      this.gravity.y = alpha*this.gravity.y + (1-alpha)*aIncl.y;
      this.gravity.z = alpha*this.gravity.z + (1-alpha)*aIncl.z;

      const dx = aIncl.x - this.gravity.x;
      const dy = aIncl.y - this.gravity.y;
      const dz = aIncl.z - this.gravity.z;
      const magFt = Math.hypot(dx, dy, dz) * 3.28084;

      if (magFt < this.threshold) return;

      const norm = Math.min((magFt - this.threshold) / (this.maxMag - this.threshold), 1);
      const totalDur = Math.round(norm * this.maxDur);

      // build a pattern of fast pulses: e.g. [10,10,10,10,...] for 'buzz' feel
      const pulse = 10;
      const count = Math.max(1, Math.floor(totalDur / (pulse * 2)));
      const pattern = Array(count * 2).fill(pulse);

      const isNative = !!(window.NativeVibe && window.NativeVibe.vibrate);
      const buzz = () => {
        if (isNative) {
          // native version will use the pattern but amplitude always max
          window.NativeVibe.vibrate(pattern, -1);
        } else {
          navigator.vibrate(pattern);
        }
      };

      buzz();

      if (this.echo) {
        setTimeout(() => buzz(), this.delay * 1000);
      }

      // optional log
      const info = document.getElementById('vibeInfo');
      if (info) {
        info.textContent =
          `Vibe Info:\n` +
          `Time: ${new Date().toLocaleTimeString()}\n` +
          `Motion: ${magFt.toFixed(2)} ft/s²\n` +
          `Norm: ${norm.toFixed(2)}\n` +
          `Duration: ${totalDur} ms\n` +
          `Buzz pattern: ${count}× ${pulse}ms pulses\n` +
          `Mode: ${isNative ? 'Native Pattern' : 'Fallback Pattern'}\n` +
          (this.echo ? `Echo in ${this.delay}s\n` : '');
      }
    };

    window.addEventListener('devicemotion', this.listener);
  },

  stop() {
    window.removeEventListener('devicemotion', this.listener);
    navigator.vibrate(0);
  }
};
