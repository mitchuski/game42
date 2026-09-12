// A local practice task is a learning record, never a credential or entitlement.
export const JOURNEY_KEY = 'game42.journey';
export const FIELDS = ['purpose', 'role', 'source', 'promise', 'participants', 'resourceLimit', 'acceptance', 'artefact', 'review'];
export const SCOPED = ['purpose', 'role', 'source', 'promise', 'participants', 'resourceLimit', 'acceptance'];
export const STAGES = ['draft', 'scoped', 'submitted', 'reviewed'];
export function validJourney(j) {
  return j && j.version === 1 && j.mode === 'practice' && STAGES.includes(j.stage)
    && ['compute','connection','delegation','protection','memory','value'].includes(j.axis)
    && FIELDS.every(k => typeof j[k] === 'string' && j[k].length <= 6000) && Array.isArray(j.history);
}
export function newJourney() {
  return { version: 1, mode: 'practice', stage: 'draft', axis: 'memory', ...Object.fromEntries(FIELDS.map(k => [k, ''])), history: [] };
}
export function exampleJourney() {
  return { ...newJourney(), purpose: 'Explain what a City Key carries', role: 'Chronicler · source reader',
    source: 'https://soulbis.com/guide/', promise: 'Write a short explanation separating a City Key, its fingerprint and control of identity.',
    participants: 'Practice learner and practice reviewer', resourceLimit: '20 minutes; public sources only',
    acceptance: 'The explanation identifies what the file carries, what κ checks, and what needs separate verification.' };
}
export function transition(journey, action, at = new Date().toISOString()) {
  const j = structuredClone(journey);
  if (!validJourney(j)) throw new Error('Unsupported practice record.');
  const routes = { scope: ['draft', 'scoped'], submit: ['scoped', 'submitted'], review: ['submitted', 'reviewed'] };
  const route = routes[action];
  if (!route || j.stage !== route[0]) throw new Error('Complete the preceding step first.');
  const needed = action === 'scope' ? SCOPED : action === 'submit' ? ['artefact'] : ['review'];
  if (needed.some(k => !String(j[k] || '').trim())) throw new Error('Complete the labelled fields for this step.');
  j.stage = route[1];
  j.history.push({ action, at, mode: 'practice' });
  return j;
}
export function reading(j, selected) {
  // Deliberate allowlist. Private history and unknown carried fields stay out.
  const out = { kind: 'game42-reading', version: 1, mode: 'practice', stage: j.stage,
    notice: 'A selected practice reading. Not a City Key, credential, or service receipt.' };
  for (const k of FIELDS) if (selected.includes(k) && typeof j[k] === 'string') out[k] = j[k];
  return out;
}
