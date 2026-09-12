// Keep the working 2D route available if a device cannot render the instrument.
function fallback() {
  document.querySelectorAll('#console, #panel, #scene, #diag, #hint, #latentcopy').forEach(e => e.style.display = 'none');
  const box = document.createElement('section'); box.className = 'instrument-fallback';
  box.innerHTML = '<h2>Continue on the Map.</h2><p>The 3D view is unavailable on this device. Your practice task and two-dimensional board are still available.</p><a href="./map.html?start#journey">Open your task and Map →</a>';
  document.body.appendChild(box);
}
const motion=document.createElement('label');motion.className='motion-control';
motion.innerHTML='<input type="checkbox"> Pause motion';
const toggle=motion.querySelector('input');toggle.checked=matchMedia('(prefers-reduced-motion: reduce)').matches;
toggle.onchange=()=>window.dispatchEvent(new CustomEvent('game42-motion',{detail:toggle.checked}));
document.querySelector('#title')?.appendChild(motion);
try {
  const probe = document.createElement('canvas');
  const gl = probe.getContext('webgl2') || probe.getContext('webgl');
  if (!gl) fallback();
  else {
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    const module = location.pathname.includes('constellation') ? import('./constellation.js') : import('./main.js');
    module.catch(e => { console.error(e); fallback(); });
  }
} catch(e) { console.error(e); fallback(); }
