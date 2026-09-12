import { it, expect } from 'vitest';
import { createControls } from '../src/controls.js';
it('pauses automatic camera movement while retaining keyboard orbit',()=>{
  const events={}; const canvas={setAttribute(){},addEventListener(k,f){events[k]=f;}};
  let position; const camera={position:{set(...p){position=p;}},lookAt(){}};
  const params={reduced:true,focus:true,spin:1};const c=createControls(canvas,camera,params);
  c.update(.05);const still=[...position];c.update(.05);expect(position).toEqual(still);
  events.keydown({key:'ArrowLeft',preventDefault(){},stopPropagation(){}});
  c.update(.05);expect(position).not.toEqual(still);
});
