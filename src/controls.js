// controls.js — orbit + zoom, no dependency, with tap-to-inspect.
// onTap(event) fires for a click that wasn't a drag.
export function createControls(canvas, camera, params, onTap) {
  const minD = params.minDist || 3.2, maxD = params.maxDist || 15;
  let az = 0.0, pol = 1.02, azV = 0, polV = 0, dist = params.startDist || 6.6;
  let dragging = false, px = 0, py = 0, downX = 0, downY = 0, downT = 0;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', 'Assembly view. Arrow keys orbit; plus and minus zoom. The Map provides a text and two-dimensional view.');
  canvas.addEventListener('keydown', e => {
    const keys=['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'];
    if(!keys.includes(e.key))return;
    e.preventDefault(); e.stopPropagation();
    if(e.key==='ArrowLeft')az-=0.12;if(e.key==='ArrowRight')az+=0.12;
    if(e.key==='ArrowUp')pol-=0.12;if(e.key==='ArrowDown')pol+=0.12;
    pol=Math.max(0.15,Math.min(Math.PI-0.15,pol));
    if(e.key==='+'||e.key==='=')dist=Math.max(minD,dist-0.3);
    if(e.key==='-')dist=Math.min(maxD,dist+0.3);
  });

  canvas.addEventListener('pointerdown', (e) => {
    dragging = true; px = e.clientX; py = e.clientY;
    downX = e.clientX; downY = e.clientY; downT = performance.now();
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    azV = -(e.clientX - px) * 0.005; polV = -(e.clientY - py) * 0.005;
    az += azV; pol += polV; pol = Math.max(0.15, Math.min(Math.PI - 0.15, pol));
    px = e.clientX; py = e.clientY;
  });
  canvas.addEventListener('pointerup', (e) => {
    dragging = false;
    const d = Math.hypot(e.clientX - downX, e.clientY - downY), dt = performance.now() - downT;
    if (d < 6 && dt < 400 && onTap) onTap(e);
  });
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault(); dist = Math.max(minD, Math.min(maxD, dist + e.deltaY * 0.004 * (dist / 6)));
  }, { passive: false });

  let focusT = 0;
  function update(dt) {
    if (params.reduced) { azV = 0; polV = 0; }
    else if (params.focus && !dragging) {
      // [f] focus mode — presentation orbit: steady spin + a slow polar sway (the breath)
      focusT += dt;
      az += dt * 0.22;
      pol = Math.PI * 0.5 + Math.sin(focusT * 0.16) * 0.45;
    } else if (!dragging) {
      az += (params.spin || 0) * 0.3 * dt; azV *= 0.92; polV *= 0.92; az += azV; pol += polV;
      pol = Math.max(0.15, Math.min(Math.PI - 0.15, pol));
    }
    camera.position.set(dist * Math.sin(pol) * Math.sin(az), dist * Math.cos(pol), dist * Math.sin(pol) * Math.cos(az));
    camera.lookAt(0, 0, 0);
  }
  return { update };
}
