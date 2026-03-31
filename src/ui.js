import { CONFIG_SCHEMA, DEFAULT_CONFIG, STORAGE_KEY, deepClone } from './config.js';

export function createUiManager(api) {
  function dom() { return api.dom; }
  function getConfig() { return api.getConfig(); }
  function setConfig(nextConfig) { api.setConfig(nextConfig); }
  function getConfigDraft() { return api.getConfigDraft(); }
  function setConfigDraft(nextDraft) { api.setConfigDraft(nextDraft); }
  function setMessage(text) { api.setMessage(text); }
  function saveConfigToStorage(config) { api.saveConfigToStorage(config); }
  function saveConfigToDatabase(config) { return api.saveConfigToDatabase(config); }
  function onConfigApplied() { api.onConfigApplied(); }

  function getValueByPath(source, dottedPath) {
    return dottedPath.split('.').reduce((acc, part) => acc?.[part], source);
  }

  function renderConfigForm() {
    const draft = getConfigDraft();
    const grid = dom().configGridEl;
    grid.innerHTML = '';
    for (const groupKey of Object.keys(CONFIG_SCHEMA)) {
      const group = CONFIG_SCHEMA[groupKey];
      for (const sectionKey of Object.keys(group.sections)) {
        const section = group.sections[sectionKey];
        const wrap = document.createElement('section');
        wrap.className = 'config-section';
        wrap.innerHTML = `<h3>${section.title}</h3><div class="field-grid"></div>`;
        const fieldGrid = wrap.querySelector('.field-grid');
        for (const fieldKey of Object.keys(section.fields)) {
          const field = section.fields[fieldKey];
          const inputId = field.path || `${groupKey}.${sectionKey}.${fieldKey}`;
          const value = getValueByPath(draft, inputId);
          const fieldEl = document.createElement('div');
          fieldEl.className = 'field';
          fieldEl.innerHTML = `<label for="${inputId}">${field.label}</label><input id="${inputId}" type="number" step="${field.step}" value="${value}" data-path="${inputId}" />`;
          fieldGrid.appendChild(fieldEl);
        }
        grid.appendChild(wrap);
      }
    }
  }

  function openConfig() { setConfigDraft(deepClone(getConfig())); renderConfigForm(); dom().configOverlayEl.classList.add('open'); }
  function closeConfig() { dom().configOverlayEl.classList.remove('open'); }
  function openCheats() { dom().cheatsOverlayEl.classList.add('open'); }
  function closeCheats() { dom().cheatsOverlayEl.classList.remove('open'); }

  function readDraftFromInputs() {
    const draft = getConfigDraft();
    const inputs = dom().configGridEl.querySelectorAll('input[data-path]');
    for (const input of inputs) {
      const path = input.dataset.path.split('.');
      let ref = draft;
      for (let i = 0; i < path.length - 1; i += 1) ref = ref[path[i]];
      ref[path[path.length - 1]] = Number(input.value);
    }
    setConfigDraft(draft);
  }

  function validateConfig(draft) {
    const errors = [];
    if (draft.enemies.global.levelEveryWaves < 1) errors.push('רמת אויב כל כמה גלים חייבת להיות לפחות 1');
    for (const key of Object.keys(draft.buildings)) if (draft.buildings[key].refund > draft.buildings[key].cost) errors.push(`החזר ${key} לא יכול להיות גדול מהמחיר`);
    return errors;
  }

  async function applyConfig() {
    readDraftFromInputs();
    const draft = getConfigDraft();
    const errors = validateConfig(draft);
    if (errors.length) { setMessage(errors[0]); return false; }
    const nextConfig = deepClone(draft);
    setConfig(nextConfig);
    saveConfigToStorage(nextConfig);
    let savedToDatabase = false;
    try {
      await saveConfigToDatabase(nextConfig);
      savedToDatabase = true;
    } catch (error) {
      console.error(error);
    }
    onConfigApplied();
    closeConfig();
    setMessage(savedToDatabase ? 'הקונפיג נשמר בדאטאבייס' : 'הקונפיג נשמר מקומית בלבד');
    return savedToDatabase;
  }

  function resetConfig() { setConfigDraft(deepClone(DEFAULT_CONFIG)); renderConfigForm(); }

  function exportConfig() {
    const payload = { exportedAt: new Date().toISOString(), version: STORAGE_KEY, config: getConfig() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'tower-defense-config.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMessage('קובץ קונפיג יוצא');
  }

  return { applyConfig, closeCheats, closeConfig, exportConfig, openCheats, openConfig, renderConfigForm, resetConfig };
}
