const BASE_URL = 'http://localhost:3000';
const USE_COOKIES = false; // set to true if your server uses cookie-based sessions

function opts(body) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    ...(USE_COOKIES ? { credentials: 'include' } : {}),
  };
}

async function postJson(path, payload) {
  const res = await fetch(`${BASE_URL}${path}`, opts(payload));
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : {}; } catch { data = { message: text }; }
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  return data;
}

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-button');
  const idEl = document.getElementById('login-id');
  const pwEl = document.getElementById('login-password');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = idEl.value.trim();
    const password = pwEl.value.trim();
    if (!id || !password) { alert('Please enter both ID and Password.'); return; }

    btn.disabled = true;
    try {
        const result = await postJson('/auth/login', { id, password });
      
        // Store JWT if returned
        if (result?.token && !USE_COOKIES) {
          localStorage.setItem('auth_token', result.token);
        }
      
        // Store role if returned
        if (result?.role) {
          localStorage.setItem('user_role', result.role);
        }
      
        alert('Login successful! Redirecting to the rooms...');
        window.location.href = 'rooms.html';
      } catch (err) {
        alert(`Login failed: ${err.message}`);
      } finally {
        btn.disabled = false;
      }
  });
});
