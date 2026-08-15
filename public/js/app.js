// public/js/app.js

const API = '/api';
let token = localStorage.getItem('token') || null;
let currentUser = JSON.parse(localStorage.getItem('user') || 'null');
let currentCafeId = null;

// ---------- API helper ----------
async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API}${path}`, { ...options, headers });
  const data = res.status === 204 ? null : await res.json();

  if (!res.ok) throw new Error(data?.error || 'Request failed');
  return data;
}

// ---------- Auth UI ----------
function renderAuthArea() {
  const el = document.getElementById('authArea');
  if (currentUser) {
    el.innerHTML = `
      <div class="user-chip">
        <span>${currentUser.name}${currentUser.license_key ? ' ⭐' : ''}</span>
        <button id="logoutBtn">Logout</button>
      </div>`;
    document.getElementById('logoutBtn').onclick = logout;
  } else {
    el.innerHTML = `<button id="openAuth">Login / Register</button>`;
    document.getElementById('openAuth').onclick = () => toggleModal('authModal', true);
  }
}

function logout() {
  token = null;
  currentUser = null;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  renderAuthArea();
  loadCafes();
}

document.getElementById('tabLogin').onclick = () => switchAuthTab('login');
document.getElementById('tabRegister').onclick = () => switchAuthTab('register');

function switchAuthTab(which) {
  document.getElementById('tabLogin').classList.toggle('active', which === 'login');
  document.getElementById('tabRegister').classList.toggle('active', which === 'register');
  document.getElementById('loginForm').classList.toggle('hidden', which !== 'login');
  document.getElementById('registerForm').classList.toggle('hidden', which !== 'register');
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  try {
    const data = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
    onAuthSuccess(data);
  } catch (err) {
    document.getElementById('loginError').textContent = err.message;
  }
});

document.getElementById('registerForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  try {
    const data = await apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    onAuthSuccess(data);
  } catch (err) {
    document.getElementById('registerError').textContent = err.message;
  }
});

function onAuthSuccess(data) {
  token = data.token;
  currentUser = data.user;
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(currentUser));
  toggleModal('authModal', false);
  renderAuthArea();
  loadCafes();
}

document.getElementById('closeAuthModal').onclick = () => toggleModal('authModal', false);

// ---------- Modal helper ----------
function toggleModal(id, show) {
  document.getElementById(id).classList.toggle('hidden', !show);
}

// ---------- Cafe list ----------
async function loadCafes() {
  const wifi = document.getElementById('filterWifi').value;
  const outlets = document.getElementById('filterOutlets').value;
  const noise = document.getElementById('filterNoise').value;
  const seating = document.getElementById('filterSeating').value;

  const params = new URLSearchParams();
  if (wifi) params.set('wifi', wifi);
  if (outlets) params.set('outlets', outlets);
  if (noise) params.set('noise', noise);
  if (seating) params.set('seating', seating);

  try {
    const { cafes, demoMode } = await apiFetch(`/cafes?${params.toString()}`);
    document.getElementById('demoBanner').classList.toggle('hidden', !demoMode);
    renderCafeList(cafes);
  } catch (err) {
    console.error(err);
  }
}

function renderCafeList(cafes) {
  const list = document.getElementById('cafeList');
  if (!cafes.length) {
    list.innerHTML = `<p style="color:var(--text-muted)">No cafes match those filters.</p>`;
    return;
  }

  list.innerHTML = cafes.map(cafe => `
    <div class="cafe-card" data-id="${cafe.id}">
      <h3>${cafe.name}</h3>
      <p class="address">${cafe.address}</p>
      <div class="badges">
        <span class="badge">📶 Wi-Fi ${cafe.wifi_rating ?? '–'}/5</span>
        <span class="badge">🔌 Outlets ${cafe.outlet_rating ?? '–'}/5</span>
        <span class="badge noise-${cafe.noise_level || ''}">🔊 ${cafe.noise_level || 'unknown'}</span>
        <span class="badge">🪑 Seating ${cafe.seating_rating ?? '–'}/5</span>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('.cafe-card').forEach(card => {
    card.addEventListener('click', () => openCafeDetail(card.dataset.id));
  });
}

document.getElementById('applyFilters').onclick = loadCafes;
document.getElementById('clearFilters').onclick = () => {
  ['filterWifi', 'filterOutlets', 'filterNoise', 'filterSeating'].forEach(id => {
    document.getElementById(id).value = '';
  });
  loadCafes();
};

// ---------- Cafe detail + reviews ----------
async function openCafeDetail(id) {
  currentCafeId = id;
  try {
    const [cafe, reviews] = await Promise.all([
      apiFetch(`/cafes/${id}`),
      apiFetch(`/cafes/${id}/reviews`)
    ]);

    let favorited = false;
    if (currentUser) {
      try {
        const favs = await apiFetch('/favorites');
        favorited = favs.some(f => f.id === Number(id));
      } catch { /* not logged in or failed — leave false */ }
    }

    renderCafeDetail(cafe, reviews, favorited);
    toggleModal('cafeModal', true);
  } catch (err) {
    alert(err.message);
  }
}

function renderCafeDetail(cafe, reviews, favorited) {
  const body = document.getElementById('modalBody');
  body.innerHTML = `
    <h2>${cafe.name}</h2>
    <p style="color:var(--text-muted)">${cafe.address}</p>
    <div class="badges" style="margin-bottom:12px">
      <span class="badge">📶 Wi-Fi ${cafe.wifi_rating ?? '–'}/5</span>
      <span class="badge">🔌 Outlets ${cafe.outlet_rating ?? '–'}/5</span>
      <span class="badge noise-${cafe.noise_level || ''}">🔊 ${cafe.noise_level || 'unknown'}</span>
      <span class="badge">🪑 Seating ${cafe.seating_rating ?? '–'}/5</span>
    </div>
    <button id="favToggle" class="favorite-btn ${favorited ? 'active' : ''}">
      ${favorited ? '★ Favorited' : '☆ Add to favorites'}
    </button>

    <h3 style="margin-top:20px">Reviews</h3>
    <div id="reviewsList">
      ${reviews.length ? reviews.map(r => `
        <div class="review">
          <div class="reviewer">${r.reviewer_name} <span class="stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span></div>
          ${r.comment ? `<p>${r.comment}</p>` : ''}
        </div>
      `).join('') : '<p style="color:var(--text-muted)">No reviews yet.</p>'}
    </div>

    ${currentUser ? `
      <form id="reviewForm" class="review-form">
        <select id="reviewRating">
          <option value="5">★★★★★</option>
          <option value="4">★★★★☆</option>
          <option value="3">★★★☆☆</option>
          <option value="2">★★☆☆</option>
          <option value="1">★☆☆☆☆</option>
        </select>
        <textarea id="reviewComment" placeholder="Share your experience..."></textarea>
        <button type="submit">Post Review</button>
        <p class="form-error" id="reviewError"></p>
      </form>
    ` : `<p style="color:var(--text-muted); margin-top:10px">Log in to leave a review.</p>`}
  `;

  document.getElementById('favToggle').onclick = () => toggleFavorite(cafe.id, favorited);

  const reviewForm = document.getElementById('reviewForm');
  if (reviewForm) {
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const rating = document.getElementById('reviewRating').value;
      const comment = document.getElementById('reviewComment').value;
      try {
        await apiFetch(`/cafes/${cafe.id}/reviews`, {
          method: 'POST',
          body: JSON.stringify({ rating: Number(rating), comment })
        });
        openCafeDetail(cafe.id); // refresh
      } catch (err) {
        document.getElementById('reviewError').textContent = err.message;
      }
    });
  }
}

async function toggleFavorite(cafeId, currentlyFavorited) {
  if (!currentUser) return toggleModal('authModal', true);
  try {
    if (currentlyFavorited) {
      await apiFetch(`/favorites/${cafeId}`, { method: 'DELETE' });
    } else {
      await apiFetch(`/favorites/${cafeId}`, { method: 'POST' });
    }
    openCafeDetail(cafeId); // refresh state
  } catch (err) {
    alert(err.message);
  }
}

document.getElementById('closeModal').onclick = () => toggleModal('cafeModal', false);
document.getElementById('upgradeLink').onclick = (e) => {
  e.preventDefault();
  window.open('https://your-store-link.example.com', '_blank');
};

// ---------- Init ----------
renderAuthArea();
loadCafes();