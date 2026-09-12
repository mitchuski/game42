import {it,expect} from 'vitest';
import {tetrahedra,manifoldPoint} from '../src/star-geometry.js';
it('preserves regular tetrahedra, circumradius and antipodal dual',()=>{
  const [a,b]=tetrahedra(.9,1);
  for(let i=0;i<4;i++){
    expect(Math.hypot(...a[i])).toBeCloseTo(.9);
    a[i].forEach((x,j)=>expect(b[i][j]).toBeCloseTo(-x));
    for(let j=i+1;j<4;j++)expect(Math.hypot(...a[i].map((x,k)=>x-a[j][k]))).toBeCloseTo(.9*Math.sqrt(8/3));
  }
});
it('matches the Soulbis radial harmonic and periodic seam',()=>{
  const phi=.7,theta=.9;
  expect(Math.hypot(...manifoldPoint(phi,theta))).toBeCloseTo(1.2+.35*Math.sin(5*phi)*Math.cos(6*theta));
  manifoldPoint(phi,0).forEach((x,i)=>expect(manifoldPoint(phi,2*Math.PI)[i]).toBeCloseTo(x));
  expect(()=>tetrahedra(1,0)).toThrow();
});
