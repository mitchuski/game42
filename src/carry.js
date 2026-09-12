// Every download has an explicit preview; the selected payload is captured once.
export function download(blob, filename) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = filename; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
export function previewDownload({ title, description, payload, blob, filename }) {
  const d = document.createElement('dialog'); d.className = 'carry-dialog';
  const h = document.createElement('h2'); h.textContent = title;
  const p = document.createElement('p'); p.textContent = description;
  const pre = document.createElement('pre'); pre.textContent = payload ? JSON.stringify(payload, null, 2) : 'Picture only. No embedded game log or City Key.';
  const buttons = document.createElement('div'); buttons.className = 'journey-actions';
  const cancel = document.createElement('button'); cancel.textContent = 'Keep editing';
  const save = document.createElement('button'); save.textContent = 'Download this file'; save.className = 'primary';
  cancel.onclick = () => d.close();
  save.onclick = () => { download(blob, filename); d.close(); };
  buttons.append(cancel, save); d.append(h, p, pre, buttons); document.body.appendChild(d);
  d.setAttribute('aria-label', title); d.addEventListener('close', () => d.remove()); d.showModal(); cancel.focus();
}
