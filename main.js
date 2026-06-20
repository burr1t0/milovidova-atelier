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

function renderGallery(works) {
  const gallery = document.getElementById('gallery');
  gallery.innerHTML = works.map(work => `
    <div class="gallery-item" data-cat="${work.category}">
      ${work.url
        ? `<img src="${work.url}" alt="${work.caption}" loading="lazy" />`
        : `<div class="gallery-placeholder">${PLACEHOLDER_SVG}<span>${work.caption}</span></div>`
      }
      <div class="gallery-overlay">
        <span class="gallery-caption">${work.caption}</span>
      </div>
    </div>
  `).join('');
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
