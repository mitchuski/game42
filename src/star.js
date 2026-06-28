// star.js — the floating Sword/Mage star at the centre (GEOMETRY.md §3 + the
// soulbis stella octangula). Two interpenetrating dual tetrahedra: the
// Swordsman (amber, protection) ⊥ the Mage (sapphire, delegation).
//
// Modes (all sword/mage colourable):
//   facet   (default) — flat-shaded, iridescent gem faces + edges
//   surface           — smooth additive-glow faces, no wire
//   wire              — edges only
import * as THREE from 'three';
import { theme } from './palette.js';

const TET_A = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]]; // Swordsman
const TET_B = [[-1, -1, -1], [-1, 1, 1], [1, -1, 1], [1, 1, -1]]; // Mage
const FACES = [[0, 1, 2], [0, 1, 3], [0, 2, 3], [1, 2, 3]];
const EDGES = [[0, 1], [0, 2], [0, 3], [1, 2], [1, 3], [2, 3]];

function makeTetra(verts, hex, R) {
  const v = verts.map((p) => new THREE.Vector3(p[0], p[1], p[2]).multiplyScalar(R));
  const fpos = [];
  for (const [a, b, c] of FACES) fpos.push(...v[a].toArray(), ...v[b].toArray(), ...v[c].toArray());
  const fg = new THREE.BufferGeometry();
  fg.setAttribute('position', new THREE.Float32BufferAttribute(fpos, 3));
  fg.computeVertexNormals();

  // surface look: smooth translucent faces — normal (alpha) blending so the two
  // overlapping tetrahedra stay sword/mage coloured instead of summing to white
  const baseMat = new THREE.MeshBasicMaterial({ color: hex, transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false });
  // facet look: chrome — metallic + iridescent, flat-shaded so each face mirrors
  // the environment separately. Tints to the theme colour (metal uses colour as
  // its reflection tint). Needs scene.environment (set in main.js) to reflect.
  const facetMat = new THREE.MeshPhysicalMaterial({
    color: hex, emissive: hex, emissiveIntensity: 0.12, flatShading: true,
    roughness: 0.08, metalness: 1.0, clearcoat: 1.0, clearcoatRoughness: 0.1,
    iridescence: 1.0, iridescenceIOR: 1.3, envMapIntensity: 1.4,
    transparent: true, opacity: 0.72, side: THREE.DoubleSide, depthWrite: false,
  });
  const fill = new THREE.Mesh(fg, facetMat);

  const epos = [];
  for (const [a, b] of EDGES) epos.push(...v[a].toArray(), ...v[b].toArray());
  const eg = new THREE.BufferGeometry();
  eg.setAttribute('position', new THREE.Float32BufferAttribute(epos, 3));
  const edges = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: hex, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending }));

  const g = new THREE.Group();
  g.add(fill, edges);
  g.userData = { fill, edges, baseMat, facetMat };
  return g;
}

export function buildStar() {
  const group = new THREE.Group();
  const R = 1.25;
  const sword = makeTetra(TET_A, theme.sword, R);
  const mage = makeTetra(TET_B, theme.mage, R);
  group.add(sword, mage);
  const tets = [sword, mage];
  let mode = 'facet';
  let sizeMul = 1; // external size (territory self-core vs constellation greater-star)
  function setSize(m) { sizeMul = m; }

  const core = new THREE.PointLight(0xffffff, 1.4, 8, 2);
  group.add(core);
  const heart = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 20, 20),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false })
  );
  group.add(heart);

  function setMode(m) {
    mode = m;
    for (const tet of tets) {
      const { fill, edges, baseMat, facetMat } = tet.userData;
      if (m === 'wire') { fill.visible = false; edges.visible = true; }
      else if (m === 'surface') { fill.material = baseMat; fill.visible = true; edges.visible = false; }
      else { fill.material = facetMat; fill.visible = true; edges.visible = true; }
    }
  }

  const cs = new THREE.Color(), cm = new THREE.Color(), mix = new THREE.Color();
  let curScale = 1.0; // smoothed so latent->live never jumps
  function update(p, t, reduced, dt, latent) {
    cs.set(theme.sword); cm.set(theme.mage);
    mix.copy(cs).lerp(cm, reduced ? 0.5 : 0.5 + 0.5 * Math.sin(t * 0.9));
    core.color.copy(mix);

    // every face/edge material follows the theme so the pickers always work
    for (const [tet, col] of [[sword, cs], [mage, cm]]) {
      const u = tet.userData;
      u.edges.material.color.copy(col);
      u.baseMat.color.copy(col);
      u.facetMat.color.copy(col);
      u.facetMat.emissive.copy(col);
    }

    const targetScale = latent ? 1.0 : 0.6 + 0.4 * p;
    curScale += (targetScale - curScale) * Math.min(1, dt * 4);
    group.scale.setScalar(curScale * sizeMul);

    const eo = latent ? 0.18 : 0.35 + 0.5 * p;
    const faceO = latent ? 0.28 : 0.45 + 0.25 * p;
    const glowO = latent ? 0.08 : 0.28 + 0.3 * p;
    for (const tet of tets) {
      tet.userData.edges.material.opacity = eo;
      tet.userData.facetMat.opacity = faceO;
      tet.userData.baseMat.opacity = glowO;
    }
    if (latent) {
      core.intensity = 0.5;
      heart.material.opacity = 0.18;
    } else {
      core.intensity = reduced ? 1.2 : 1.1 + 0.5 * Math.sin(t * 1.6);
      heart.material.color.copy(mix);
      heart.material.opacity = (reduced ? 0.45 : 0.4 + 0.15 * Math.sin(t * 1.6)) * (0.5 + 0.5 * p);
    }
    if (!reduced) {
      sword.rotation.y += dt * 0.18; sword.rotation.x = 0.3;
      mage.rotation.y -= dt * 0.14; mage.rotation.z = 0.3;
    }
  }
  return { group, update, setMode, setSize };
}
