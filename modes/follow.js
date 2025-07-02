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

      // high-pass filter
      this.gravity.x = alpha*this.gravity.x + (1-alpha)*aIncl.x;
      this.gravity.y = alpha*this.gravity.y + (1-alpha)*aIncl.y;
      this.gravity.z = alpha*this.gravity.z + (1-alpha)*aIncl.z;

      const dx    = aIncl.x - this.gravity.x;
      const dy    = aIncl.y - this.gravity.y;
      const dz    = aIncl.z - this.gravity.z;
      const magFt = Math.hypot(dx,dy,dz)*3.28084;

      if (magFt < this.threshold) return;
      const norm = Math.min((magFt-this.threshold)/(this.maxMag-this.threshold),1);
      const dur  = Math.round(norm*this.maxDur);

      const isNative = !!(window.NativeVibe && window.NativeVibe.vibrate);

      // buzz function
      const buzz = d => {
        if (isNative) {
          window.NativeVibe.vibrate(d,255);
        } else {
          navigator.vibrate([d,30,d,30,d]);
        }
      };

      buzz(dur);

      // update Vibe Info
      const infoEl = document.getElementById('vibeInfo');
      if (infoEl) {
        infoEl.textContent =
          `Vibe Info:\n` +
          `Time: ${new Date().toLocaleTimeString()}\n` +
          `Duration: ${dur} ms\n` +
          `Mode: ${isNative?'Native':'Burst'}\n` +
          `Amplitude: ${isNative?255:'n/a'}`;
      }

      // echo
      if (this.echo) {
        setTimeout(()=>{
          buzz(dur);
          const infoEl2 = document.getElementById('vibeInfo');
          if (infoEl2) infoEl2.textContent += `\nEcho at +${this.delay}s`;
        }, this.delay*1000);
      }
    };

    window.addEventListener('devicemotion', this.listener);
  },

  stop() {
    window.removeEventListener('devicemotion', this.listener);
    navigator.vibrate(0);
  }
};
