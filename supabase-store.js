(() => {
  const config = window.S_CENTER_SUPABASE;
  const ready = config && config.url && config.anonKey &&
    !config.url.startsWith('PASTE_') && !config.anonKey.startsWith('PASTE_');
  if (!ready) return;

  const root = config.url.replace(/\/$/, '');
  const key = config.anonKey;
  const sessionKey = 's-center-supabase-session';
  const session = () => JSON.parse(sessionStorage.getItem(sessionKey) || 'null');
  const headers = (json = true) => ({
    apikey: key,
    ...(session() ? { Authorization: `Bearer ${session().access_token}` } : {}),
    ...(json ? { 'Content-Type': 'application/json' } : {})
  });
const api = async (path, options = {}) => {
  const response = await fetch(
    `${root}${path}`,
    {
      ...options,
      headers: {
        ...headers(options.json !== false),
        ...(options.headers || {})
      }
    }
  );

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const text = await response.text();

  if (!text) return null;

  return JSON.parse(text);
};
  const mapProduct = row => ({ id: row.id, name: row.name, category: row.category, price: row.price, description: row.description, image: row.image_url, tag: row.tag || '' });
  async function refreshProducts() {
    const rows = await api('/rest/v1/products?select=*&order=created_at.desc');
    products = rows.map(mapProduct);
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof renderAdmin === 'function' && !document.querySelector('#dashboard')?.hidden) renderAdmin();
    if (typeof render === 'function' && !document.querySelector('#portal')?.hidden) render();
  }
  async function signIn(email, password) {
    const response = await fetch(`${root}/auth/v1/token?grant_type=password`, { method: 'POST', headers: { apikey: key, 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
    if (!response.ok) throw new Error('Incorrect email or password.');
    const data = await response.json();
    sessionStorage.setItem(sessionKey, JSON.stringify(data));
  }
  async function uploadImage(file) {
    if (!file) return null;
    const extension = (file.name.split('.').pop() || 'jpg').replace(/[^a-z0-9]/gi, '').toLowerCase();
    const name = `${crypto.randomUUID()}.${extension}`;
    const response = await fetch(`${root}/storage/v1/object/${config.storageBucket}/${name}`, { method: 'POST', headers: { ...headers(false), 'Content-Type': file.type || 'image/jpeg', 'x-upsert': 'false' }, body: file });
    if (!response.ok) throw new Error('Image upload failed.');
    return `${root}/storage/v1/object/public/${config.storageBucket}/${name}`;
  }
  async function saveProduct(data, id) {
    const payload = { name: data.name, category: data.category, price: data.price, description: data.description, image_url: data.image, tag: data.tag || '' };
    if (id) await api(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'PATCH', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) });
    else await api('/rest/v1/products', { method: 'POST', headers: { Prefer: 'return=minimal' }, body: JSON.stringify(payload) });
    await refreshProducts();
  }
  async function removeProduct(id) {
    if (!confirm('Delete this product?')) return;
    await api(`/rest/v1/products?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' });
    await refreshProducts();
  }

  const siteLogin = document.querySelector('#loginForm');
  if (siteLogin) {
    siteLogin.onsubmit = async event => {
      event.preventDefault();
      try { await signIn(document.querySelector('#email').value, document.querySelector('#password').value); document.querySelector('#loginPanel').hidden = true; document.querySelector('#dashboard').hidden = false; await refreshProducts(); }
      catch (error) { document.querySelector('#loginError').textContent = error.message; }
    };
    window.deleteProduct = id => removeProduct(id).catch(error => alert(error.message));
    const form = document.querySelector('#productForm');
    if (form) form.onsubmit = async event => {
      event.preventDefault();
      try {
        const file = document.querySelector('#pUpload')?.files[0];
        const old = document.querySelector('#pImage').value;
        const image = file ? await uploadImage(file) : old;
        if (!image) throw new Error('Choose an image.');
        await saveProduct({ name: pName.value, category: pCategory.value, price: pPrice.value, description: pDescription.value, image }, editingId);
        modal(editorModal, false);
      } catch (error) { alert(error.message); }
    };
  }

  const separateLogin = document.querySelector('#signin');
  if (separateLogin) {
    separateLogin.onsubmit = async event => {
      event.preventDefault();
      try { await signIn(document.querySelector('#email').value, document.querySelector('#password').value); document.querySelector('#login').hidden = true; document.querySelector('#portal').hidden = false; await refreshProducts(); }
      catch (error) { document.querySelector('#error').textContent = error.message; }
    };
    const form = document.querySelector('#edit-form');
    if (form) form.onsubmit = async event => {
      event.preventDefault();
      try {
        const file = document.querySelector('#upload')?.files[0];
        const old = document.querySelector('#image').value;
        const image = file ? await uploadImage(file) : old;
        if (!image) throw new Error('Choose an image.');
        await saveProduct({ name: document.querySelector('#name').value, category: document.querySelector('#category').value, price: document.querySelector('#price').value, description: document.querySelector('#description').value, image }, editing);
        document.querySelector('#editor').classList.remove('open');
      } catch (error) { alert(error.message); }
    };
    window.removeProduct = id => removeProduct(id).catch(error => alert(error.message));
  }
  refreshProducts().catch(error => console.warn('Could not load cloud products:', error.message));
})();
