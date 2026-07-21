(() => {
  const style = document.createElement('style');
  style.textContent = `
    .hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;background:#080808;z-index:0;filter:brightness(.47)}
    .hero-copy,.hero .scroll-cue{position:relative;z-index:2}.hero>.reel-footer{position:absolute;bottom:30px;right:10vw;left:auto;z-index:3}.showreel{display:none!important}
    .upload-label small{font-size:9px;font-weight:400;color:#777}.upload-label input{padding:8px}
    @media(max-width:850px){.nav-wrap{position:sticky}.nav-wrap nav.nav-open{display:flex!important;position:absolute;top:82px;right:0;left:0;background:#fff;flex-direction:column;gap:0;padding:9px 5vw 18px;border-bottom:1px solid #e5dfd7;box-shadow:0 12px 20px #0002}.nav-wrap nav.nav-open a{padding:13px 0;border-bottom:1px solid #f0f0f0;font-size:12px}.nav-wrap nav.nav-open a:last-child{border:0}}
  `;
  document.head.append(style);
  /* Hero video */
  const reel = document.querySelector('.showreel');
  const hero = document.querySelector('.hero');
  if (reel && hero) {
    const video = document.createElement('video');
    video.className = 'hero-video';
    video.src = 'assets/hero-video.mp4';
    video.autoplay = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.setAttribute('aria-label', 'S Center phone video');
    hero.prepend(video);
    const footer = reel.querySelector('.reel-footer');
    if (footer) hero.append(footer);
    const reelButton = document.querySelector('#switchReel');
    const reelText = reelButton && reelButton.querySelector('b');
    let showingGalaxy = false;
    if (reelButton) reelButton.onclick = () => {
      showingGalaxy = !showingGalaxy;
      video.src = showingGalaxy ? 'assets/galaxy-reel.mp4' : 'assets/hero-video.mp4';
      video.load();
      video.play().catch(() => {});
      if (reelText) reelText.textContent = showingGalaxy ? 'iPhone reel' : 'Galaxy reel';
    };
  }

  /* Mobile navigation */
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-wrap nav');
  if (menu && nav) {
    menu.setAttribute('aria-expanded', 'false');
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('nav-open');
      menu.setAttribute('aria-expanded', String(open));
      menu.textContent = open ? '×' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('nav-open'); menu.setAttribute('aria-expanded', 'false'); menu.textContent = '☰';
    }));
  }

  /* Upload a product photo from the user's device. The base64 data is saved locally with the product. */
  const productForm = document.querySelector('#productForm');
  const hiddenImage = document.querySelector('#pImage');
  if (productForm && hiddenImage) {
    hiddenImage.required = false;
    hiddenImage.closest('label').style.display = 'none';
    const label = document.createElement('label');
    label.className = 'upload-label';
    label.innerHTML = 'Product image from your device<input type="file" id="pUpload" accept="image/png,image/jpeg,image/webp" required><small>PNG, JPG or WebP</small>';
    hiddenImage.closest('label').after(label);
    productForm.onsubmit = async event => {
      event.preventDefault();
      const file = document.querySelector('#pUpload').files[0];
      let image = hiddenImage.value;
      if (file) image = await new Promise((resolve, reject) => {
        const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file);
      });
      if (!image) return;
      const id = editingId || Date.now();
      const product = { id, name: pName.value, category: pCategory.value, price: pPrice.value, description: pDescription.value, image, tag: '' };
      products = editingId ? products.map(item => item.id === editingId ? { ...item, ...product } : item) : [...products, product];
      save(); modal(editorModal, false);
    };
    document.querySelector('#addProduct').addEventListener('click', () => document.querySelector('#pUpload').required = true);
    window.editProduct = (id => {
      const original = window.editProduct;
      return function (productId) { original(productId); document.querySelector('#pUpload').required = false; };
    })(window.editProduct);
  }
})();
