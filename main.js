// Nav scroll effect
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// Fade-up on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 80);
    }
  });
}, { threshold: 0.1 });

function observeFadeUps() {
  document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));
}

// Gallery filter
function initFilter() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const filter = tab.dataset.filter;
      document.querySelectorAll('.gallery-item').forEach(item => {
        item.style.display = (filter === 'all' || item.dataset.cat === filter) ? '' : 'none';
      });
    });
  });
}

// Render gallery from works.json
const PLACEHOLDER_SVG = `
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <circle cx="8.5" cy="8.5" r="1.5"/>
    <polyline points="21,15 16,10 5,21"/>
  </svg>`;

// Lightbox
const lightbox = document.getElementById('lightbox');
const lbImg    = document.getElementById('lb-img');
const lbDots   = document.getElementById('lb-dots');
const lbPrev   = document.getElementById('lb-prev');
const lbNext   = document.getElementById('lb-next');

let lbPhotos = [], lbIndex = 0;

function lbShow(photos, index) {
  lbPhotos = photos;
  lbIndex  = index;
  lbImg.src = photos[index];
  lbPrev.hidden = photos.length < 2;
  lbNext.hidden = photos.length < 2;
  lbDots.innerHTML = photos.length > 1
    ? photos.map((_, i) => `<div class="lb-dot${i === index ? ' active' : ''}"></div>`).join('')
    : '';
  lbDots.querySelectorAll('.lb-dot').forEach((d, i) => d.addEventListener('click', () => lbGo(i)));
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function lbGo(index) {
  lbIndex = (index + lbPhotos.length) % lbPhotos.length;
  lbImg.src = lbPhotos[lbIndex];
  lbDots.querySelectorAll('.lb-dot').forEach((d, i) => d.classList.toggle('active', i === lbIndex));
}

function lbClose() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
  lbImg.src = '';
}

document.getElementById('lb-close').addEventListener('click', lbClose);
lbPrev.addEventListener('click', () => lbGo(lbIndex - 1));
lbNext.addEventListener('click', () => lbGo(lbIndex + 1));
lightbox.addEventListener('click', e => { if (e.target === lightbox) lbClose(); });
document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') lbClose();
  if (e.key === 'ArrowLeft')  lbGo(lbIndex - 1);
  if (e.key === 'ArrowRight') lbGo(lbIndex + 1);
});

// Swipe support
let touchX = null;
lightbox.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) lbGo(lbIndex + (dx < 0 ? 1 : -1));
  touchX = null;
}, { passive: true });

function renderGallery(works) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = works.map((work, wi) => `
    <div class="gallery-item" data-cat="${work.category}" data-wi="${wi}">
      ${work.url
        ? `<img src="${work.url}" alt="${work.caption}" loading="lazy" />`
        : `<div class="gallery-placeholder">${PLACEHOLDER_SVG}<span>${work.caption}</span></div>`
      }
      <div class="gallery-overlay">
        <span class="gallery-caption">${work.caption}</span>
      </div>
    </div>
  `).join('');

  gallery.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      const work = works[+item.dataset.wi];
      const photos = work.photos && work.photos.length ? work.photos : (work.url ? [work.url] : []);
      if (photos.length) lbShow(photos, 0);
    });
  });
}

fetch('works.json')
  .then(r => r.json())
  .then(works => {
    renderGallery(works);
    initFilter();
    observeFadeUps();
  })
  .catch(() => {
    // fallback if works.json not found
    renderGallery([]);
    initFilter();
    observeFadeUps();
  });
