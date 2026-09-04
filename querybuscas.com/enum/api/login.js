// login.js — POST /api/auth/login → redireciona por tipo

document.addEventListener('DOMContentLoaded', async () => {
  // Se já estiver logado, redireciona direto
  try {
    const v = await fetchJSON('/api/auth/verify');
    if (v.ok && v.data?.user?.tipo) {
      location.href = v.data.user.tipo === 'admin' ? '/pages/admin' : '/pages/cliente';
      return;
    }
  } catch (_) {}

  const form = document.getElementById('login-form');
  const errEl = document.getElementById('login-error');
  const btn  = document.getElementById('login-submit');

  const inputUsuario = document.getElementById('input-usuario');
  if (inputUsuario) {
    inputUsuario.addEventListener('input', () => {
      // Aceita username ou email: mantém @ . _ % + - além de letras/números.
      inputUsuario.value = inputUsuario.value.toLowerCase().replace(/[^a-z0-9._%+@-]/g, '');
    });
  }

  function showErr(msg) {
    if (!errEl) return;
    errEl.textContent = msg;
    errEl.style.display = 'block';
  }
  function clearErr() {
    if (!errEl) return;
    errEl.textContent = '';
    errEl.style.display = 'none';
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErr();
    const username = (document.getElementById('input-usuario').value || '').trim().toLowerCase();
    const password = document.getElementById('input-senha').value;
    if (!username || !password) return showErr('Preencha usuário e senha.');

    btn.disabled = true;
    const original = btn.innerHTML;
    btn.innerHTML = '<span>Entrando...</span>';

    try {
      const r = await fetchJSON('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });
      if (!r.ok || !r.data?.ok) {
        showErr(r.data?.message || 'Falha no login.');
        return;
      }
      const tipo = r.data.user?.tipo;
      location.href = tipo === 'admin' ? '/pages/admin' : '/pages/cliente';
    } catch (err) {
      showErr('Erro de conexão.');
    } finally {
      btn.disabled = false;
      btn.innerHTML = original;
    }
  });
});
