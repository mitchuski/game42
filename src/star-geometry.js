// Soulbis /star: antipodal regular tetrahedra and radial harmonic manifold.
export const TETRA = [[1,1,1],[1,-1,-1],[-1,1,-1],[-1,-1,1]];
export function tetrahedra(core=.6, ratio=1) {
  if (!(core>0 && ratio>0 && Number.isFinite(core) && Number.isFinite(ratio))) throw Error('Invalid Star dimensions');
  return [TETRA.map(p=>p.map(x=>x*core/Math.sqrt(3))),
    TETRA.map(p=>p.map(x=>-x*core/(Math.sqrt(3)*ratio)))];
}
export function manifoldPoint(phi, theta, {radius=1.2,epsilon=.35,m=5,n=6}={}) {
  const r=radius+epsilon*Math.sin(m*phi)*Math.cos(n*theta);
  return [r*Math.sin(phi)*Math.cos(theta),r*Math.sin(phi)*Math.sin(theta),r*Math.cos(phi)];
}
