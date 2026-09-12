// Editorial geometry only: no task, identity, storage or key inputs.
import {tetrahedra, manifoldPoint} from './star-geometry.js';
const figure = document.querySelector('.arrival-star');
const fallback = figure?.querySelector('svg');
if (figure && fallback) {
  const canvas = document.createElement('canvas');
  canvas.className = 'arrival-manifold';
  canvas.setAttribute('role', 'img');
  canvas.setAttribute('aria-label', 'Coral and cyan interlocking star tetrahedra inside a rippled spherical manifold. Illustrative geometry.');
  const ctx = canvas.getContext('2d');
  if (ctx) {
    figure.insertBefore(canvas, fallback);
    const controls = document.createElement('div');
    controls.className = 'arrival-views';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Star illustration views');
    controls.innerHTML = '<button data-view="manifold" aria-pressed="true">Manifold</button><button data-view="star" aria-pressed="false">Star</button><button data-view="axes" aria-pressed="false">Six axes</button><button data-pause aria-pressed="false">Pause motion</button>';
    figure.insertBefore(controls, figure.querySelector('figcaption'));
    const caption = figure.querySelector('figcaption');
    const motion = matchMedia('(prefers-reduced-motion: reduce)');
    let paused = motion.matches, view = 'manifold', visible = true, frame = 0, last = 0, time = 0;
    const pause = controls.querySelector('[data-pause]');
    const stars = tetrahedra(.9,1);
    const edges = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
    const faces = [[0,1,2],[0,1,3],[0,2,3],[1,2,3]];
    function project([x,y,z]) {
      const a = time * .065 + .42, b = .48 + Math.sin(time * .08) * .12;
      const X = x*Math.cos(a)+z*Math.sin(a), Z = z*Math.cos(a)-x*Math.sin(a);
      const Y = y*Math.cos(b)-Z*Math.sin(b), depth = y*Math.sin(b)+Z*Math.cos(b);
      const scale = 174 * 5 / (5-depth);
      return [280+X*scale,280-Y*scale,depth];
    }
    function path(points, color, alpha, width=1, fill=false) {
      ctx.beginPath();
      points.map(project).forEach(([x,y],i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y));
      ctx.globalAlpha = alpha; ctx.strokeStyle = color; ctx.lineWidth = width;
      if (fill) { ctx.closePath(); ctx.fillStyle=color; ctx.fill(); }
      else ctx.stroke();
    }
    function shell(lat, lon) {
      return manifoldPoint(Math.PI/2-lat,lon,{radius:1.2,epsilon:.18,m:5,n:6});
    }
    function draw() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      const size = Math.max(1,canvas.getBoundingClientRect().width);
      const pixels = Math.round(size*dpr);
      if (canvas.width!==pixels) { canvas.width=pixels; canvas.height=pixels; }
      ctx.setTransform(pixels/560,0,0,pixels/560,0,0);ctx.clearRect(0,0,560,560);
      const haze=ctx.createRadialGradient(280,280,10,280,280,260);
      haze.addColorStop(0,'#426d9325');haze.addColorStop(1,'#426d9300');
      ctx.globalAlpha=1;ctx.fillStyle=haze;ctx.fillRect(0,0,560,560);
      if(view==='manifold') {
        for(let i=1;i<19;i++) {
          const lat=-Math.PI/2+i*Math.PI/19;
          path(Array.from({length:81},(_,j)=>shell(lat,j*Math.PI/40)), '#8baac1', .16, .65);
        }
        for(let i=0;i<32;i++)
          path(Array.from({length:51},(_,j)=>shell(-Math.PI/2+j*Math.PI/50,i*Math.PI/16)), '#7bb6c4', .12, .65);
      }
      for(const [index,color] of [[0,'#e68f7e'],[1,'#94d5d4']]) {
        const v=stars[index];
        for(const f of faces)path(f.map(i=>v[i]),color,.055,1,true);
        for(const [a,b] of edges)path([v[a],v[b]],color,.85,1.6);
        for(const point of v) {
          const [x,y]=project(point);
          ctx.globalAlpha=.2;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();
          ctx.globalAlpha=.95;ctx.beginPath();ctx.arc(x,y,2.5,0,Math.PI*2);ctx.fill();
        }
      }
      ctx.globalAlpha=1;ctx.fillStyle='#eee5d6';ctx.beginPath();ctx.arc(280,280,4,0,Math.PI*2);ctx.fill();
    }
    function tick(now) {
      frame=0;
      if(last) time+=Math.min((now-last)/1000,.05);
      last=now;draw();
      if(!paused&&visible&&!document.hidden&&view!=='axes')frame=requestAnimationFrame(tick);
    }
    function sync() {
      cancelAnimationFrame(frame);frame=0;last=0;
      canvas.hidden=view==='axes';fallback.style.display=view==='axes'?'':'none';
      pause.disabled=view==='axes';pause.textContent=paused?'Resume motion':'Pause motion';
      pause.setAttribute('aria-pressed',String(paused));
      controls.querySelectorAll('[data-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.view===view)));
      caption.textContent=view==='axes'?'Six axes × seven stations. The work gives the shape meaning.':view==='star'?'Two interlocking tetrahedra · an illustrative Star, not a loaded key.':'The Star within a moving manifold · explore Six axes for the 42 stations.';
      if(view!=='axes')draw();
      if(!paused&&visible&&!document.hidden&&view!=='axes')frame=requestAnimationFrame(tick);
    }
    controls.addEventListener('click', e=>{
      const b=e.target.closest('button');if(!b)return;
      if(b.dataset.view)view=b.dataset.view;else paused=!paused;sync();
    });
    motion.addEventListener('change',e=>{paused=e.matches;sync();});
    document.addEventListener('visibilitychange',sync);
    new ResizeObserver(()=>{if(view!=='axes')draw();}).observe(figure);
    new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();}).observe(figure);
    sync();
  }
}
