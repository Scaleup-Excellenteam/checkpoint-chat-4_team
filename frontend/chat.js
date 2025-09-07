// ====== Config ======
const BASE_URL    = 'http://localhost:3000';
const USE_COOKIES = false;
const TOKEN_KEY   = 'auth_token';
const NAME_KEY    = 'user_name';
const POLL_MS     = 3000;

// ====== Helpers ======
function authHeaders() {
  if (USE_COOKIES) return {};
  const t = localStorage.getItem(TOKEN_KEY);
  return t ? { Authorization: `Bearer ${t}` } : {};
}
function qs(name, def = '') {
  const url = new URL(window.location.href);
  return url.searchParams.get(name) ?? def;
}
function escapeHTML(s = '') {
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;', "'":'&#039;'}[c]));
}
function fmtTime(iso) {
  try { const d = new Date(iso); return Number.isNaN(+d) ? '' : d.toLocaleString(); }
  catch { return ''; }
}
async function req(method, path, bodyObj) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    ...(USE_COOKIES ? { credentials:'include' } : {}),
    body: bodyObj ? JSON.stringify(bodyObj) : undefined,
  });
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

// ====== API stubs ======
async function fetchMessages(roomId) { return req('GET',  `/rooms/${encodeURIComponent(roomId)}/messages`); }
async function sendMessage(roomId, text){ return req('POST', `/rooms/${encodeURIComponent(roomId)}/messages`, { text }); }
async function fetchMembers(roomId)  { return req('GET',  `/rooms/${encodeURIComponent(roomId)}/members`); }

// ====== UI wiring ======
document.addEventListener('DOMContentLoaded', () => {
  const historyEl = document.getElementById('history');
  const membersEl = document.getElementById('members');
  const statusEl  = document.getElementById('status');
  const sendBtn   = document.getElementById('send-btn');
  const inputEl   = document.getElementById('msg-input');
  const titleEl   = document.getElementById('room-title');
  const roomIdLine= document.getElementById('room-id-line');
  const backBtn   = document.getElementById('back-btn');

  const roomId = qs('id');
  const roomName = qs('name') || 'Room';
  if (!roomId) {
    alert('Missing room id');
    window.location.href = 'rooms.html';
    return;
  }
  titleEl.textContent = roomName;
  roomIdLine.textContent = `ID: ${roomId}`;

  // <<< NAVIGATE: Chat → Rooms >>>
  backBtn.addEventListener('click', () => {
    window.location.href = 'rooms.html';
  });

  function setStatus(msg) { statusEl.textContent = msg || ''; }

  function renderMessages(list) {
    if (!Array.isArray(list)) list = [];
    historyEl.innerHTML = '';
    for (const m of list) {
      const user = escapeHTML(m.user ?? 'Unknown');
      const text = escapeHTML(m.text ?? '');
      const time = escapeHTML(fmtTime(m.createdAt) || '');
      const div = document.createElement('div');
      div.className = 'msg';
      div.innerHTML = `<span class="user">${user}:</span> <span class="text">${text}</span>${time ? ` <span class="time">${time}</span>` : ''}`;
      historyEl.appendChild(div);
    }
    historyEl.scrollTop = historyEl.scrollHeight;
  }

  function renderMembers(list) {
    if (!Array.isArray(list)) list = [];
    membersEl.innerHTML = '';
    if (!list.length) {
      const p = document.createElement('div');
      p.className = 'member';
      p.textContent = 'No members yet.';
      membersEl.appendChild(p);
      return;
    }
    for (const u of list) {
      const div = document.createElement('div');
      div.className = 'member';
      div.textContent = u.name || u.id || 'Unknown';
      membersEl.appendChild(div);
    }
  }

  async function refreshAll() {
    try {
      const [msgs, members] = await Promise.all([fetchMessages(roomId), fetchMembers(roomId)]);
      renderMessages(msgs);
      renderMembers(members);
      setStatus('Updated.');
    } catch (e) {
      setStatus(`Refresh failed: ${e.message}`);
    }
  }

  // Initial load + polling
  refreshAll();
  const timer = setInterval(refreshAll, POLL_MS);
  window.addEventListener('beforeunload', () => clearInterval(timer));

  async function doSend() {
    const text = inputEl.value.trim();
    if (!text) return;
    sendBtn.disabled = true;
    try {
      await sendMessage(roomId, text);
      inputEl.value = '';
      await refreshAll();
    } catch (e) {
      setStatus(`Send failed: ${e.message}`);
    } finally {
      sendBtn.disabled = false;
      inputEl.focus();
    }
  }

  sendBtn.addEventListener('click', doSend);
  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      doSend();
    }
  });
});
