// ====== Config ======
const BASE_URL = 'http://localhost:3000';
const USE_COOKIES = false; // true if you use cookie-based sessions
const TOKEN_KEY = 'auth_token';
const ROLE_KEY  = 'user_role';  // 'admin' | 'user'

// ====== Auth / Role helpers ======
function getAuthHeaders() {
  if (USE_COOKIES) return {};
  const token = localStorage.getItem(TOKEN_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}
function getUserRole() {
  return localStorage.getItem(ROLE_KEY) || 'user';
}

// ====== Fetch helpers ======
async function req(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, options);
  const text = await res.text();
  let data; try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}
function makeOpts(method, bodyObj) {
  const base = {
    method,
    headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
    ...(USE_COOKIES ? { credentials: 'include' } : {}),
  };
  return bodyObj ? { ...base, body: JSON.stringify(bodyObj) } : base;
}
async function getRooms()     { return req('/rooms',      makeOpts('GET')); }
async function addRoom(name)  { return req('/rooms/add',  makeOpts('POST', { name })); }
async function deleteRoom(id) { return req('/rooms/delete', makeOpts('POST', { id })); }

// ====== UI wiring ======
document.addEventListener('DOMContentLoaded', () => {
  const roleText    = document.getElementById('role-text');
  const createSect  = document.getElementById('create-room-section');
  const newRoomName = document.getElementById('new-room-name');
  const createBtn   = document.getElementById('create-room-btn');

  const roomsSelect = document.getElementById('rooms-select');
  const refreshBtn  = document.getElementById('refresh-btn');
  const joinBtn     = document.getElementById('join-room-btn');
  const deleteBtn   = document.getElementById('delete-room-btn');
  const statusEl    = document.getElementById('status');

  // Role-gated UI
  const role = getUserRole();
  roleText.textContent = role;
  if (role === 'admin') {
    createSect.style.display = '';
  } else {
    createSect.style.display = 'none';
    deleteBtn.style.display = 'none';
  }

  // Helpers
  function setStatus(msg) { statusEl.textContent = msg || ''; }
  function setBusy(b) {
    [createBtn, refreshBtn, joinBtn, deleteBtn].forEach(btn => { if (btn) btn.disabled = !!b; });
    roomsSelect.disabled = !!b;
    if (b) setStatus('Working…');
  }
  function populateRooms(rooms) {
    roomsSelect.innerHTML = '';
    if (!rooms || !rooms.length) {
      roomsSelect.innerHTML = '<option value="" disabled selected>No rooms found</option>';
      joinBtn.disabled = true;
      if (role === 'admin') deleteBtn.disabled = true;
      return;
    }
    for (const r of rooms) {
      const opt = document.createElement('option');
      opt.value = r.id;
      opt.textContent = r.name;
      roomsSelect.appendChild(opt);
    }
    joinBtn.disabled = false;
    if (role === 'admin') deleteBtn.disabled = false;
  }

  async function refreshRooms() {
    setBusy(true);
    try {
      const rooms = await getRooms();
      populateRooms(rooms);
      setStatus('Rooms loaded.');
    } catch (e) {
      populateRooms([]);
      setStatus(`Failed to load rooms: ${e.message}`);
    } finally {
      setBusy(false);
    }
  }

  // Events
  refreshBtn.addEventListener('click', refreshRooms);
  roomsSelect.addEventListener('change', () => {
    const selected = roomsSelect.value;
    joinBtn.disabled = !selected;
    if (role === 'admin') deleteBtn.disabled = !selected;
  });

  if (createBtn) {
    createBtn.addEventListener('click', async () => {
      const name = newRoomName.value.trim();
      if (!name) { setStatus('Please enter a room name.'); return; }
      setBusy(true);
      try {
        await addRoom(name);
        newRoomName.value = '';
        await refreshRooms();
        setStatus('Room created.');
      } catch (e) {
        setStatus(`Create failed: ${e.message}`);
      } finally {
        setBusy(false);
      }
    });
  }

  // >>> NAVIGATE: Rooms → Chat <<<
  joinBtn.addEventListener('click', () => {
    const id   = roomsSelect.value;
    if (!id) { setStatus('Please select a room.'); return; }
    const name = roomsSelect.options[roomsSelect.selectedIndex]?.textContent || 'Room';
    window.location.href = `chat.html?id=${encodeURIComponent(id)}&name=${encodeURIComponent(name)}`;
  });

  if (role === 'admin') {
    deleteBtn.addEventListener('click', async () => {
      const id = roomsSelect.value;
      const name = roomsSelect.options[roomsSelect.selectedIndex]?.textContent || '';
      if (!id) { setStatus('Please select a room.'); return; }
      if (!confirm(`Delete room "${name}"?`)) return;
      setBusy(true);
      try {
        await deleteRoom(id);
        await refreshRooms();
        setStatus('Room deleted.');
      } catch (e) {
        setStatus(`Delete failed: ${e.message}`);
      } finally {
        setBusy(false);
      }
    });
  }

  // Initial load
  refreshRooms();
});
