const BASE_URL = 'http://localhost:3000';

function opts(body) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
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
  const btn  = document.getElementById('login-button');
  const idEl = document.getElementById('login-id');
  const pwEl = document.getElementById('login-password');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = idEl.value.trim();
    const password = pwEl.value.trim();
    if (!id || !password) { alert('Please enter both ID and Password.'); return; }

    btn.disabled = true;
    try {
      // Expecting server to return: { token, user }
      const result = await postJson('/auth/login', { id, password });

      if (result?.token)  Auth.setToken(result.token);
      if (result?.user)   Auth.setUser(result.user);   // <-- saved for all pages

      alert('Login successful! Redirecting to the rooms...');
      window.location.href = 'rooms.html';
    } catch (err) {
      alert(`Login failed: ${err.message}`);
    } finally {
      btn.disabled = false;
    }
  });
});
