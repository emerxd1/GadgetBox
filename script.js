// ---------- Header con sombra al hacer scroll ----------
const siteHeader = document.querySelector('header');
if (siteHeader) {
  const toggleHeaderShadow = () => {
    siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  toggleHeaderShadow();
  window.addEventListener('scroll', toggleHeaderShadow, { passive: true });
}

// ---------- Revelado suave al hacer scroll ----------
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const revealTargets = document.querySelectorAll(
  '.section-head, .custom-order-note, .catalog .card, .about-visual, .about > div, .social'
);

revealTargets.forEach(el => el.classList.add('reveal'));

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealTargets.forEach(el => revealObserver.observe(el));
} else {
  revealTargets.forEach(el => el.classList.add('is-visible'));
}

// ---------- Menú móvil ----------
const menuBtn = document.getElementById('menuBtn');
const navLinks = document.getElementById('navLinks');

if (menuBtn && navLinks) {
  menuBtn.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('is-open');
    menuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      menuBtn.setAttribute('aria-expanded', 'false');
    });
  });
}

// ---------- Galería de fotos por producto ----------
// Lee data-images (JSON con las rutas) y arma flechas + puntos.
// Si solo hay una foto, las flechas y puntos se ocultan.
function buildGallery({ container, images, imgEl, prevBtn, nextBtn, dotsWrap }) {
  if (dotsWrap) dotsWrap.innerHTML = '';
  let current = 0;

  if (images.length < 2) {
    if (prevBtn) prevBtn.classList.add('is-hidden');
    if (nextBtn) nextBtn.classList.add('is-hidden');
    if (images.length === 1) imgEl.src = images[0];
    return { show: () => {} };
  }

  if (prevBtn) prevBtn.classList.remove('is-hidden');
  if (nextBtn) nextBtn.classList.remove('is-hidden');

  if (dotsWrap) {
    images.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', `Ver foto ${i + 1}`);
      dot.addEventListener('click', (e) => {
        e.stopPropagation();
        show(i);
      });
      dotsWrap.appendChild(dot);
    });
  }

  function show(index) {
    current = (index + images.length) % images.length;
    imgEl.src = images[current];
    if (dotsWrap) {
      dotsWrap.querySelectorAll('.gallery-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === current);
      });
    }
  }

  if (prevBtn) prevBtn.onclick = (e) => { e.stopPropagation(); show(current - 1); };
  if (nextBtn) nextBtn.onclick = (e) => { e.stopPropagation(); show(current + 1); };

  show(0);

  let touchStartX = null;
  container.ontouchstart = (e) => { touchStartX = e.touches[0].clientX; };
  container.ontouchend = (e) => {
    if (touchStartX === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(diff) > 40) show(current + (diff < 0 ? 1 : -1));
    touchStartX = null;
  };

  return { show };
}

document.querySelectorAll('.gallery').forEach((el) => {
  let images = [];
  try {
    images = JSON.parse(el.dataset.images || '[]');
  } catch (e) {
    images = [];
  }
  if (images.length === 0) return;
  try {
    buildGallery({
      container: el,
      images,
      imgEl: el.querySelector('.gallery-img'),
      prevBtn: el.querySelector('.gallery-arrow.prev'),
      nextBtn: el.querySelector('.gallery-arrow.next'),
      dotsWrap: el.querySelector('.gallery-dots'),
    });
  } catch (e) {
    console.error('No se pudo construir la galería de un producto:', e);
  }
});

// ---------- Filtro simple de categorías ----------
const filterBtns = document.querySelectorAll('.filter-btn');
const cards = document.querySelectorAll('.catalog .card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.textContent.trim();
    cards.forEach(card => {
      const cardCat = card.querySelector('.card-cat').textContent.trim();
      const show = cat === 'Todo' || cardCat === cat;
      card.style.display = show ? '' : 'none';
    });
  });
});

// ---------- Vista de producto ----------
const WHATSAPP_NUMBER = '50500000000'; // mismo número usado en la sección de contacto

const modal = document.getElementById('productModal');
const pmImg = document.getElementById('pmImg');
const pmDots = document.getElementById('pmDots');
const pmMedia = document.getElementById('pmMedia');
const pmCat = document.getElementById('pmCat');
const pmName = document.getElementById('pmName');
const pmCode = document.getElementById('pmCode');
const pmBrand = document.getElementById('pmBrand');
const pmPrice = document.getElementById('pmPrice');
const pmQty = document.getElementById('pmQty');
const pmOrder = document.getElementById('pmOrder');
const pmDesc = document.getElementById('pmDesc');

function buildWhatsAppLink(name, qty) {
  const msg = `Hola, quiero pedir: ${name} (cantidad: ${qty})`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;
}

function openProductModal(card) {
  const name = card.querySelector('.card-name').textContent.trim();
  const cat = card.querySelector('.card-cat').textContent.trim();
  const price = card.querySelector('.price').textContent.trim();
  const mediaEl = card.querySelector('.card-media');

  let images = [];
  if (mediaEl && mediaEl.classList.contains('gallery')) {
    try { images = JSON.parse(mediaEl.dataset.images || '[]').map(s => s.trim()); }
    catch (e) { images = []; }
  } else {
    const existingImg = mediaEl ? mediaEl.querySelector('img') : null;
    if (existingImg) images = [existingImg.src];
  }

  pmName.textContent = name;
  pmCat.textContent = cat;
  pmPrice.textContent = price;
  pmQty.value = '1';

  pmCode.textContent = (card.dataset.code || '').trim() || '—';
  pmBrand.textContent = (card.dataset.brand || '').trim() || '—';
  pmDesc.textContent = (card.dataset.desc || '').trim() || 'Aún no hay descripción para este producto.';

  if (images.length > 0) {
    buildGallery({
      container: pmMedia,
      images,
      imgEl: pmImg,
      prevBtn: pmMedia.querySelector('.gallery-arrow.prev'),
      nextBtn: pmMedia.querySelector('.gallery-arrow.next'),
      dotsWrap: pmDots,
    });
    pmMedia.style.display = '';
  } else {
    pmMedia.style.display = 'none';
  }

  pmOrder.href = buildWhatsAppLink(name, pmQty.value);

  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
}

function closeProductModal() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

cards.forEach(card => {
  card.addEventListener('click', (e) => {
    if (e.target.closest('.add-btn') || e.target.closest('.gallery-arrow') || e.target.closest('.gallery-dot')) {
      return;
    }
    openProductModal(card);
  });
});

modal.querySelectorAll('[data-close]').forEach(el => {
  el.addEventListener('click', closeProductModal);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('is-open')) closeProductModal();
});

pmQty.addEventListener('change', () => {
  pmOrder.href = buildWhatsAppLink(pmName.textContent.trim(), pmQty.value);
});
