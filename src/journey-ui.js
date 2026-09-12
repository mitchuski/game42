import { JOURNEY_KEY, FIELDS, newJourney, exampleJourney, transition, reading, validJourney } from './journey.js';
import { AXIS_IDS, esc } from './canon.js';
import * as store from './store.js';
import { previewDownload } from './carry.js';
import { SLOTS } from './data.js';

const host = document.getElementById('journey');
let task = store.load(JOURNEY_KEY, null) || newJourney();
const labels = { purpose: 'Your purpose or question', role: 'Role and skill to practise', source: 'Source and version / date checked',
  promise: 'What will you make or clarify?', participants: 'Learner and reviewer roles', resourceLimit: 'Time, resources and boundaries',
  acceptance: 'What should the reviewer check?', artefact: 'Your artefact or source-linked explanation', review: 'Review outcome, correction or remaining question' };
const hints = { purpose: 'What brings you here?', role: 'For example: Chronicler · source reading', source: 'A public source URL and the version you read',
  promise: 'One small, useful result', participants: 'Name roles without disclosing private identity', resourceLimit: 'For example: 20 minutes; public sources only',
  acceptance: 'An observable acceptance check', artefact: 'Record the work, its source and its limits', review: 'What met the check? What still needs work?' };
function persist() { store.save(JOURNEY_KEY, task); window.dispatchEvent(new Event('journeychange')); }
function illuminatePractice() {
  const seat = SLOTS.find(s => s.axisId === task.axis && s.fillOrder === 1);
  if (!seat) return;
  const locked = store.load('game42.locked', []);
  store.save('game42.locked', [...new Set([...(Array.isArray(locked) ? locked : []), seat.slotId])]);
}
function message(text) { const el = host.querySelector('[role=status]'); if (el) el.textContent = text; }
function field(k, disabled = false) {
  return `<label class="journey-field">${labels[k]}<textarea name="${k}" maxlength="6000" ${disabled ? 'readonly' : ''} placeholder="${hints[k]}">${esc(task[k] || '')}</textarea></label>`;
}
function render() {
  if (!host) return;
  if (!validJourney(task)) { host.textContent = 'This saved journey is unsupported or unreadable. Your stored record has been left unchanged.'; return; }
  const draft = task.stage === 'draft';
  host.innerHTML = `<div class="journey-heading"><div><p class="eyebrow">YOUR FIRST WORKING · LOCAL PRACTICE</p><h2>One question. One useful contribution.</h2></div><span class="stage-label">${esc(task.stage)}</span></div>
    <p>Choose a purpose, make a small promise and review what you learned. Start here with one role; the six-by-seven board can grow around it.</p>
    <p class="journey-note">Saved in this browser. Nothing is submitted to the City. A practice review records your reflection; it does not verify an identity or award standing.</p>
    <div class="journey-actions"><button id="journey-example" ${task.stage !== 'draft' || task.purpose ? 'hidden' : ''}>Use the City Key practice task</button>
    <a href="https://skills.agentprivacy.ai/#loadouts" target="_blank" rel="noopener noreferrer">Find a skill ↗</a><a href="https://soulbis.com/guide/" target="_blank" rel="noopener noreferrer">Read the Star guide ↗</a></div>
    <form id="journey-form"><div class="journey-fields">${['purpose','role'].map(k => field(k,!draft)).join('')}
    <label class="journey-field">Primary need<select name="axis" ${!draft ? 'disabled' : ''}>${AXIS_IDS.map(a => `<option ${task.axis===a?'selected':''}>${a}</option>`).join('')}</select></label>
    ${['source','promise','participants','resourceLimit','acceptance'].map(k => field(k,!draft)).join('')}</div>
    ${!draft ? `<div class="journey-work">${field('artefact',task.stage !== 'scoped')}</div>` : ''}
    ${['submitted','reviewed'].includes(task.stage) ? `<div class="journey-work">${field('review',task.stage === 'reviewed')}</div>` : ''}
    <div class="journey-actions">${task.stage !== 'reviewed' ? `<button type="submit" class="primary">${{draft:'Save practice scope',scoped:'Record practice result',submitted:'Complete practice review'}[task.stage]}</button>` : '<a class="primary" href="./territory.html">Explore the assembly’s fold →</a>'}
    ${!draft ? '<button type="button" id="journey-revise">Revise as a new draft</button>' : ''}</div></form>
    <p role="status" aria-live="polite"></p>
    <details class="journey-carry"><summary>Choose what to carry onward</summary><p>Select the fields to include in a compact reading. This format is for sharing your practice work; Star consumers do not accept it as a City Key.</p>
    <div class="reading-fields">${FIELDS.filter(k => task[k]).map(k => `<label><input type="checkbox" name="share" value="${k}"> ${labels[k]}</label>`).join('')}</div>
    <div class="journey-actions"><button id="journey-reading">Preview selected reading</button><button id="journey-backup">Preview full journey backup</button></div>
    <label class="journey-field">Restore a full journey backup (current version is retained in private history)<input id="journey-restore" type="file" accept="application/json"></label></details>
    <p class="journey-links"><a href="./flower.html">Plan the six roles →</a> · <a href="./map.html?start#journey">Explore the board →</a> · <a href="https://agentprivacy.org/begin/" target="_blank" rel="noopener noreferrer">Find a real trust task ↗</a></p>`;
  host.querySelector('form').addEventListener('input', e => {
    const k = e.target.name; if (FIELDS.includes(k) || k === 'axis') { task[k] = e.target.value; persist(); }
  });
  host.querySelector('form').addEventListener('submit', e => {
    e.preventDefault();
    try { task = transition(task, {draft:'scope',scoped:'submit',submitted:'review'}[task.stage]); if (task.stage === 'reviewed') illuminatePractice(); persist(); render(); message(task.stage === 'reviewed' ? 'Practice reviewed. One station on your chosen axis is now lit as a practice marker. Carry a selected reading or explore the fold.' : 'Saved. Continue with the next step below.'); }
    catch (err) { message(err.message); }
  });
  host.querySelector('#journey-example').onclick = () => { task = exampleJourney(); persist(); render(); message('Synthetic scope loaded. Read the source and write your own result.'); };
  const revise = host.querySelector('#journey-revise');
  if (revise) revise.onclick = () => {
    // Keep the previous version, including its work and review, privately in history.
    const { history, ...previous } = task;
    task = { ...task, stage: 'draft', artefact: '', review: '', history: [...history, {action:'revise', at:new Date().toISOString(), previous}] };
    persist(); render(); message('Previous version retained in the private backup. Changes need a new practice scope and review.');
  };
  host.querySelector('#journey-reading').onclick = () => {
    const selected = [...host.querySelectorAll('input[name=share]:checked')].map(e => e.value);
    if (!selected.length) return message('Select at least one field to share.');
    const payload = reading(task, selected);
    previewDownload({ title: 'Selected practice reading', description: 'Only the fields below will be in this JSON file. No private history, City Key or credential is included.', payload,
      blob: new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}), filename:'game42-practice-reading.json' });
  };
  host.querySelector('#journey-backup').onclick = () => {
    const payload = {kind:'game42-journey-backup', ...structuredClone(task)};
    previewDownload({title:'Full private journey backup',description:'This JSON contains all task fields and revision history. Keep it privately or share it deliberately.',payload,
      blob:new Blob([JSON.stringify(payload,null,2)],{type:'application/json'}),filename:'game42-journey-backup.json'});
  };
  host.querySelector('#journey-restore').onchange = async e => {
    const file=e.target.files[0]; if(!file)return;
    try {
      if(file.size>1000000)throw new Error('Choose a journey backup smaller than 1 MB.');
      const imported=JSON.parse(await file.text());
      if(imported.kind!=='game42-journey-backup'||!validJourney(imported))throw new Error('Expected a full practice journey backup. A selected reading cannot restore the private history.');
      const {history,...previous}=task;
      task={...imported,history:[...imported.history,{action:'restore',at:new Date().toISOString(),previous}]};
      persist(); render(); message('Practice backup restored locally. The previous task is retained in the full backup history.');
    }catch(err){message(err.message);}
  };
}
render();
