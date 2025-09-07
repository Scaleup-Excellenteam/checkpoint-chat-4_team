const BASE_URL = 'http://localhost:3000';
const POLL_MS  = 3000;

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

// Server calls with JWT via Auth.fetchAuthed
async function fetchMessages(roomId) {
  return Auth.fetchAuthed(`/rooms/${encodeURIComponent(roomId)}/messages`, { method:'GET' }, { baseUrl: BASE_URL });
}
async function sendMessage(roomId, text) {
  return Auth.fetchAuthed(`/rooms/${encodeURIComponent(roomId)}/messages`, { method:'POST', body: JSON.stringify({ text }) }, { baseUrl: BASE_URL });
}
async function fetchMembers(roomId) {
  return Auth.fetchAuthed(`/rooms/${encodeURIComponent(roomId)}/members`, { method:'GET' }, { baseUrl: BASE_URL });
}

document.addEventListener('DOMContentLoaded', () => {
  // Require token
  if (!Auth.requireAuthOrRedirect('index.html')) return;

  const historyEl  = document.getElementById('history');
  const membersEl  = document.getElementById('members');
  const statusEl   = document.getElementById('status');
  const sendBtn    = document.getElementById('send-btn');
  const inputEl    = document.getElementById('msg-input');
  const titleEl    = document.getElementById('room-title');
  const roomIdLine = document.getElementById('room-id-line');
  const backBtn    = document.getElementById('back-btn');

  const roomId   = qs('id');
  const roomName = qs('name') || 'Room';
  if (!roomId) {
    alert('Missing room id');
    window.location.href = 'rooms.html';
    return;
  }

  // Read current user from storage (set at login)
  const user = Auth.getUser() || {};
  const displayName = user.name || user.username || user.id || 'You';

  titleEl.textContent = roomName;
  roomIdLine.textContent = `ID: ${roomId}`;

  backBtn.addEventListener('click', () => {
    window.location.href = 'rooms.html';
  });

  function setStatus(msg) { statusEl.textContent = msg || ''; }

  function renderMessages(list) {
    if (!Array.isArray(list)) list = [];
    historyEl.innerHTML = '';
    for (const m of list) {
      // Expecting server fields: user, text, createdAt
      const u = escapeHTML(m.user ?? 'Unknown');
      const t = escapeHTML(m.text ?? '');
      const time = escapeHTML(fmtTime(m.createdAt) || '');
      const div = document.createElement('div');
      div.className = 'msg';
      div.innerHTML = `<span class="user">${u}:</span> <span class="text">${t}</span>${time ? ` <span class="time">${time}</span>` : ''}`;
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
      // Expecting fields: name or id
      div.textContent = u.name || u.id || 'Unknown';
      membersEl.appendChild(div);
    }
  }

  async function refreshAll() {
    try {
      const [msgs, members] = await Promise.all([
        fetchMessages(roomId),
        fetchMembers(roomId),
      ]);
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
      // Send to server (server will attach the real user based on JWT)
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
