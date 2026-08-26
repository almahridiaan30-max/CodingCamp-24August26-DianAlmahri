'use strict';

const LS_KEYS = {
  tasks : 'lifeDashboardTasks',
  name  : 'lifeDashboardName',
  theme : 'lifeDashboardTheme',
  links : 'lifeDashboardLinks',
};

const DEFAULT_LINKS = [
  { id: 'link-1', label: 'Google',   url: 'https://google.com',  emoji: '🔍' },
  { id: 'link-2', label: 'YouTube',  url: 'https://youtube.com', emoji: '▶️' },
  { id: 'link-3', label: 'GitHub',   url: 'https://github.com',  emoji: '🐙' },
  { id: 'link-4', label: 'ChatGPT',  url: 'https://chatgpt.com', emoji: '🤖' },
];

const timerState = {
  totalSeconds : 25 * 60,
  remaining    : 25 * 60,
  intervalId   : null,
  isRunning    : false,
};

let currentFilter = 'all';
let editingTaskId = null;

function lsGet(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

let toastTimeout = null;

function showToast(message, type = 'info', duration = 2800) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.className = 'toast';
  toast.textContent = message;
  void toast.offsetWidth;
  toast.classList.add('show', type);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀️' : '🌙';
  lsSet(LS_KEYS.theme, theme);
}

function loadTheme() {
  const saved = lsGet(LS_KEYS.theme, 'light');
  setTheme(saved);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  setTheme(current === 'dark' ? 'light' : 'dark');
}

const MONTHS = [
  'Januari','Februari','Maret','April','Mei','Juni',
  'Juli','Agustus','September','Oktober','November','Desember',
];

const DAYS = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function formatDate(date) {
  const day  = DAYS[date.getDay()];
  const d    = date.getDate();
  const mon  = MONTHS[date.getMonth()];
  const year = date.getFullYear();
  return `${day}, ${d} ${mon} ${year}`;
}

function updateClock() {
  const now = new Date();
  const clockEl = document.getElementById('clock-display');
  if (clockEl) clockEl.textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const dateEl = document.getElementById('date-display');
  if (dateEl) dateEl.textContent = formatDate(now);
  updateGreetingText(now.getHours());
}

function initClock() {
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(syncGreetingName, 60000);
}

function getGreetingPhrase(hour) {
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 18) return 'Good Afternoon';
  return 'Good Evening';
}

function updateGreetingText(hour) {
  const el = document.getElementById('greeting-text');
  if (el) el.textContent = getGreetingPhrase(hour) + '!';
}

function syncGreetingName() {
  const name = lsGet(LS_KEYS.name, '');
  updateGreetingName(name);
}

function updateGreetingName(name) {
  const el = document.getElementById('greeting-name');
  if (!el) return;
  const phrase = getGreetingPhrase(new Date().getHours());
  el.textContent = (name && name.trim()) ? `${phrase}, ${name.trim()}!` : `${phrase}!`;
}

function loadName() {
  updateGreetingName(lsGet(LS_KEYS.name, ''));
}

function saveName(name) {
  const trimmed = name.trim();
  lsSet(LS_KEYS.name, trimmed);
  updateGreetingName(trimmed);
}

function openNameModal() {
  const modal = document.getElementById('name-modal');
  const input = document.getElementById('name-input');
  if (!modal || !input) return;
  input.value = lsGet(LS_KEYS.name, '');
  modal.removeAttribute('hidden');
  input.focus();
}

function closeNameModal() {
  const modal = document.getElementById('name-modal');
  if (modal) modal.setAttribute('hidden', '');
}

function initGreeting() {
  loadName();

  document.getElementById('edit-name-btn')
    ?.addEventListener('click', openNameModal);

  document.getElementById('save-name-btn')
    ?.addEventListener('click', () => {
      const input = document.getElementById('name-input');
      if (!input) return;
      saveName(input.value);
      closeNameModal();
      showToast('Nama berhasil disimpan! 👋', 'success');
    });

  document.getElementById('cancel-name-btn')
    ?.addEventListener('click', closeNameModal);

  document.getElementById('name-modal')
    ?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeNameModal();
    });

  document.getElementById('name-input')
    ?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('save-name-btn')?.click();
    });
}

const TIMER_DEFAULT_SECONDS = 25 * 60;

function renderTimer() {
  const minsEl = document.getElementById('timer-minutes');
  const secsEl = document.getElementById('timer-seconds');
  if (minsEl) minsEl.textContent = pad(Math.floor(timerState.remaining / 60));
  if (secsEl) secsEl.textContent = pad(timerState.remaining % 60);
}

function syncTimerButtons() {
  const startBtn = document.getElementById('timer-start');
  const stopBtn  = document.getElementById('timer-stop');
  if (startBtn) startBtn.disabled = timerState.isRunning;
  if (stopBtn)  stopBtn.disabled  = !timerState.isRunning;
}

function updateTimerStatus(text) {
  const el = document.getElementById('timer-status');
  if (el) el.textContent = text;
}

function timerTick() {
  timerState.remaining -= 1;
  renderTimer();

  if (timerState.remaining <= 0) {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
    timerState.isRunning  = false;
    timerState.remaining  = 0;
    syncTimerButtons();
    updateTimerStatus('Waktu habis! Istirahat sebentar ☕');
    showToast('Fokus selesai! Saatnya istirahat ☕', 'success', 4000);
  }
}

function startTimer() {
  if (timerState.isRunning) return;
  if (timerState.remaining <= 0) return;
  if (timerState.intervalId !== null) {
    clearInterval(timerState.intervalId);
    timerState.intervalId = null;
  }
  timerState.isRunning  = true;
  timerState.intervalId = setInterval(timerTick, 1000);
  syncTimerButtons();
  updateTimerStatus('Fokus dimulai — semangat! 🎯');
}

function stopTimer() {
  if (!timerState.isRunning) return;
  clearInterval(timerState.intervalId);
  timerState.intervalId = null;
  timerState.isRunning  = false;
  syncTimerButtons();
  updateTimerStatus('Dijeda — lanjutkan kapan saja');
}

function resetTimer() {
  clearInterval(timerState.intervalId);
  timerState.intervalId = null;
  timerState.isRunning  = false;
  timerState.remaining  = TIMER_DEFAULT_SECONDS;
  renderTimer();
  syncTimerButtons();
  updateTimerStatus('Pomodoro · 25 menit');
}

function initTimer() {
  renderTimer();
  syncTimerButtons();
  document.getElementById('timer-start')?.addEventListener('click', startTimer);
  document.getElementById('timer-stop')?.addEventListener('click', stopTimer);
  document.getElementById('timer-reset')?.addEventListener('click', resetTimer);
}

function loadTasks() {
  return lsGet(LS_KEYS.tasks, []);
}

function saveTasks(tasks) {
  lsSet(LS_KEYS.tasks, tasks);
}

function generateId() {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function isDuplicate(tasks, name, excludeId = null) {
  const normalized = name.trim().toLowerCase();
  return tasks.some((t) => t.name.toLowerCase() === normalized && t.id !== excludeId);
}

function updateTaskCount(tasks) {
  const el = document.getElementById('todo-count');
  if (el) el.textContent = `${tasks.filter((t) => !t.completed).length} aktif / ${tasks.length} total`;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderTasks() {
  const tasks   = loadTasks();
  const listEl  = document.getElementById('task-list');
  const emptyEl = document.getElementById('empty-state');
  if (!listEl) return;

  let visible;
  if (currentFilter === 'active')         visible = tasks.filter((t) => !t.completed);
  else if (currentFilter === 'completed') visible = tasks.filter((t) => t.completed);
  else                                    visible = tasks;

  updateTaskCount(tasks);

  if (visible.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.removeAttribute('hidden');
    return;
  }

  if (emptyEl) emptyEl.setAttribute('hidden', '');

  listEl.innerHTML = visible.map((task) => `
    <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}" role="listitem">
      <input
        type="checkbox"
        class="task-checkbox"
        id="chk-${task.id}"
        ${task.completed ? 'checked' : ''}
        aria-label="Tandai selesai: ${escapeHtml(task.name)}"
      />
      <label for="chk-${task.id}" class="task-text">${escapeHtml(task.name)}</label>
      <div class="task-actions">
        <button
          class="task-btn edit-btn"
          data-id="${task.id}"
          aria-label="Edit task: ${escapeHtml(task.name)}"
          title="Edit task"
          ${task.completed ? 'disabled' : ''}
        >✏️</button>
        <button
          class="task-btn delete-btn"
          data-id="${task.id}"
          aria-label="Hapus task: ${escapeHtml(task.name)}"
          title="Hapus task"
        >🗑️</button>
      </div>
    </li>
  `).join('');

  listEl.querySelectorAll('.task-checkbox').forEach((chk) => {
    chk.addEventListener('change', (e) => {
      toggleTask(e.target.closest('.task-item').dataset.id);
    });
  });

  listEl.querySelectorAll('.edit-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => openEditModal(e.currentTarget.dataset.id));
  });

  listEl.querySelectorAll('.delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => deleteTask(e.currentTarget.dataset.id));
  });
}

function addTask(name) {
  const trimmed = name.trim();
  if (!trimmed) {
    showToast('Task tidak boleh kosong.', 'warning');
    return false;
  }
  const tasks = loadTasks();
  if (isDuplicate(tasks, trimmed)) {
    showToast('Task sudah ada. Coba nama yang berbeda.', 'warning');
    return false;
  }
  tasks.push({ id: generateId(), name: trimmed, completed: false, createdAt: Date.now() });
  saveTasks(tasks);
  renderTasks();
  showToast('Task berhasil ditambahkan! ✅', 'success');
  return true;
}

function toggleTask(id) {
  const tasks = loadTasks();
  const task  = tasks.find((t) => t.id === id);
  if (!task) return;
  task.completed = !task.completed;
  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  saveTasks(loadTasks().filter((t) => t.id !== id));
  renderTasks();
  showToast('Task dihapus.', 'info');
}

function openEditModal(id) {
  const tasks = loadTasks();
  const task  = tasks.find((t) => t.id === id);
  if (!task) return;
  editingTaskId = id;
  const modal = document.getElementById('edit-modal');
  const input = document.getElementById('edit-task-input');
  if (!modal || !input) return;
  input.value = task.name;
  modal.removeAttribute('hidden');
  input.focus();
  input.select();
}

function closeEditModal() {
  editingTaskId = null;
  const modal = document.getElementById('edit-modal');
  if (modal) modal.setAttribute('hidden', '');
}

function saveEditTask(newName) {
  if (!editingTaskId) return;

  const trimmed = newName.trim();
  if (!trimmed) {
    showToast('Nama task tidak boleh kosong.', 'warning');
    return;
  }
  const tasks = loadTasks();
  if (isDuplicate(tasks, trimmed, editingTaskId)) {
    showToast('Task sudah ada. Coba nama yang berbeda.', 'warning');
    return;
  }
  const task = tasks.find((t) => t.id === editingTaskId);
  if (!task) { closeEditModal(); return; }
  task.name = trimmed;
  saveTasks(tasks);
  renderTasks();
  closeEditModal();
  showToast('Task berhasil diperbarui! ✏️', 'success');
}

function initTodo() {
  document.getElementById('add-task-btn')
    ?.addEventListener('click', () => {
      const input = document.getElementById('task-input');
      if (!input) return;
      if (addTask(input.value)) input.value = '';
      input.focus();
    });

  document.getElementById('task-input')
    ?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('add-task-btn')?.click();
    });

  document.querySelectorAll('.filter-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach((b) => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  document.getElementById('save-edit-btn')
    ?.addEventListener('click', () => {
      const input = document.getElementById('edit-task-input');
      if (input) saveEditTask(input.value);
    });

  document.getElementById('cancel-edit-btn')
    ?.addEventListener('click', closeEditModal);

  document.getElementById('edit-modal')
    ?.addEventListener('click', (e) => {
      if (e.target === e.currentTarget) closeEditModal();
    });

  document.getElementById('edit-task-input')
    ?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter')  document.getElementById('save-edit-btn')?.click();
      if (e.key === 'Escape') closeEditModal();
    });

  renderTasks();
}

function loadLinks() {
  return lsGet(LS_KEYS.links, DEFAULT_LINKS);
}

function saveLinks(links) {
  lsSet(LS_KEYS.links, links);
}

function validateUrl(raw) {
  let url = raw.trim();
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try {
    const parsed = new URL(url);
    if (!parsed.hostname || !parsed.hostname.includes('.')) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function getLinkEmoji(url) {
  const host = url.toLowerCase();
  if (host.includes('google'))              return '🔍';
  if (host.includes('youtube'))             return '▶️';
  if (host.includes('github'))              return '🐙';
  if (host.includes('chatgpt') || host.includes('openai')) return '🤖';
  if (host.includes('twitter') || host.includes('x.com'))  return '🐦';
  if (host.includes('instagram'))           return '📸';
  if (host.includes('facebook'))            return '📘';
  if (host.includes('linkedin'))            return '💼';
  if (host.includes('reddit'))              return '🟠';
  if (host.includes('wikipedia'))           return '📖';
  if (host.includes('stackoverflow'))       return '💬';
  return '🌐';
}

function renderLinks() {
  const links = loadLinks();
  const grid  = document.getElementById('links-grid');
  if (!grid) return;

  if (links.length === 0) {
    grid.innerHTML = '<p style="font-size:13px;color:var(--text-muted);grid-column:1/-1;">Belum ada link. Tambahkan di bawah!</p>';
    return;
  }

  grid.innerHTML = links.map((link) => `
    <div class="link-item" role="listitem">
      <a
        href="${escapeHtml(link.url)}"
        target="_blank"
        rel="noopener noreferrer"
        class="link-btn"
        aria-label="Buka ${escapeHtml(link.label)}"
      >
        <span class="link-favicon" aria-hidden="true">${escapeHtml(link.emoji || '🌐')}</span>
        <span>${escapeHtml(link.label)}</span>
      </a>
      <button
        class="link-delete-btn"
        data-id="${link.id}"
        aria-label="Hapus link ${escapeHtml(link.label)}"
        title="Hapus link"
      >✕</button>
    </div>
  `).join('');

  grid.querySelectorAll('.link-delete-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => deleteLink(e.currentTarget.dataset.id));
  });
}

function addLink(label, rawUrl) {
  const trimLabel = label.trim();
  const validUrl  = validateUrl(rawUrl);

  if (!trimLabel) {
    showToast('Nama link tidak boleh kosong.', 'warning');
    return false;
  }
  if (!validUrl) {
    showToast('URL tidak valid. Contoh: https://google.com', 'error');
    return false;
  }
  const links = loadLinks();
  if (links.some((l) => l.url === validUrl)) {
    showToast('Link ini sudah ada.', 'warning');
    return false;
  }
  links.push({ id: `link-${Date.now()}`, label: trimLabel, url: validUrl, emoji: getLinkEmoji(validUrl) });
  saveLinks(links);
  renderLinks();
  showToast(`Link "${trimLabel}" ditambahkan! 🔗`, 'success');
  return true;
}

function deleteLink(id) {
  saveLinks(loadLinks().filter((l) => l.id !== id));
  renderLinks();
  showToast('Link dihapus.', 'info');
}

function initLinks() {
  renderLinks();

  document.getElementById('add-link-btn')
    ?.addEventListener('click', () => {
      const labelInput = document.getElementById('link-label-input');
      const urlInput   = document.getElementById('link-url-input');
      if (!labelInput || !urlInput) return;
      if (addLink(labelInput.value, urlInput.value)) {
        labelInput.value = '';
        urlInput.value   = '';
        labelInput.focus();
      }
    });

  document.getElementById('link-url-input')
    ?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('add-link-btn')?.click();
    });
}

document.addEventListener('DOMContentLoaded', () => {
  loadTheme();

  document.getElementById('theme-toggle')
    ?.addEventListener('click', toggleTheme);

  initClock();
  initGreeting();
  initTimer();
  initTodo();
  initLinks();

  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeNameModal();
      closeEditModal();
    }
  });
});
