(() => {
  const image = document.getElementById('image');
  const form = document.getElementById('edit-form');
  if (!image || !form) return;
  image.required = false;
  image.closest('label').style.display = 'none';
  const upload = document.createElement('label');
  upload.innerHTML = 'Product image from your device<input id="upload" type="file" accept="image/png,image/jpeg,image/webp" required><small>PNG, JPG or WebP</small>';
  image.closest('label').after(upload);
  const originalOpen = window.openEdit;
  window.openEdit = id => { originalOpen(id); document.getElementById('upload').required = false; };
  document.getElementById('add-new').addEventListener('click', () => document.getElementById('upload').required = true);
  form.onsubmit = async e => {
    e.preventDefault();
    const file = document.getElementById('upload').files[0];
    let photo = image.value;
    if (file) photo = await new Promise((resolve, reject) => { const r = new FileReader(); r.onload = () => resolve(r.result); r.onerror = reject; r.readAsDataURL(file); });
    if (!photo) return;
    const p = {id:editing||Date.now(),name:document.getElementById('name').value,category:document.getElementById('category').value,price:document.getElementById('price').value,description:document.getElementById('description').value,image:photo,tag:''};
    products = editing ? products.map(x => x.id === editing ? Object.assign({}, x, p) : x) : products.concat(p);
    save(); render(); document.getElementById('editor').classList.remove('open');
  };
})();
