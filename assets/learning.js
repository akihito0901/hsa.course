/* Browser-local study records. Existing completion/bookmark IDs remain zero-based. */
window.Study = (() => {
  let memory = {};
  const unsaved = new Set();
  const read = (key, fallback) => {
    if (unsaved.has(key)) return memory[key] ?? fallback;
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch { return memory[key] ?? fallback; }
  };
  const write = (key, value) => {
    memory[key] = value;
    try { localStorage.setItem(key, JSON.stringify(value)); unsaved.delete(key); return true; }
    catch { unsaved.add(key); return false; }
  };
  const list = key => { const v=read(key, []); return new Set(Array.isArray(v) ? v.filter(x=>typeof x==='string') : []); };
  const toggle = (key, id) => { const s=list(key); s.has(id)?s.delete(id):s.add(id); const saved=write(key,[...s]); window.dispatchEvent(new Event('studychange')); return {on:s.has(id),saved}; };
  const esc = s => String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return {read,write,list,toggle,esc};
})();
