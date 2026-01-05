/* =====================================================
   PAWS HAVEN – MAIN JAVASCRIPT (Organized & Clean)
===================================================== */

// ============= DOM ELEMENTS =============
const petsContainer = document.getElementById("petsContainer");
const searchInput = document.getElementById("searchInput");
const typeFilter = document.getElementById("typeFilter");
const ageFilter = document.getElementById("ageFilter");
const genderFilter = document.getElementById("genderFilter");

// Modal elements
const donationModal = document.getElementById("donationModal");
const favoritesModal = document.getElementById("favoritesModal");

const openDonateModalBtn = document.getElementById("openDonateModal");
const closeDonationModalBtn = document.getElementById("closeDonationModal");
const closeFavoritesModalBtn = document.getElementById("closeFavoritesModal");

const favoritesBtn = document.getElementById("favoritesBtn");
const favoritesCount = document.getElementById("favoritesCount");
const favoritesList = document.getElementById("favoritesList");
const favoritesEmpty = document.getElementById("favoritesEmpty");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

// ============= STATE =============
let pets = [];

// ============= API CALLS =============
async function loadPetsFromServer() {
  try {
    const res = await fetch('/api/pets');
    if (!res.ok) throw new Error('Failed to load pets');
    pets = await res.json();
    applyFilters();
    updateFavoritesUI();
  } catch (err) {
    console.error('Could not fetch pets from server:', err);
    showError('Failed to load pets. Please refresh the page.');
    pets = [];
  }
}

async function createPetOnServer(payload, apiKey) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (apiKey) headers['x-api-key'] = apiKey;

    const res = await fetch('/api/pets', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Create failed');
    }

    const pet = await res.json();
    await loadPetsFromServer();
    return pet;
  } catch (err) {
    console.error('Error creating pet:', err);
    throw err;
  }
}

// ============= FAVORITES (LocalStorage) =============
function getFavorites() {
  try {
    return JSON.parse(localStorage.getItem('favorites') || '[]');
  } catch (e) {
    return [];
  }
}

function saveFavorites(list) {
  localStorage.setItem('favorites', JSON.stringify(list));
}

function isFavorite(name) {
  return getFavorites().includes(name);
}

function addFavorite(name) {
  const list = getFavorites();
  if (!list.includes(name)) {
    list.push(name);
    saveFavorites(list);
  }
  updateFavoritesUI();
}

function removeFavorite(name) {
  const list = getFavorites().filter(n => n !== name);
  saveFavorites(list);
  updateFavoritesUI();
}

function toggleFavorite(name) {
  if (isFavorite(name)) {
    removeFavorite(name);
  } else {
    addFavorite(name);
  }
}

function updateFavoritesUI() {
  const favList = getFavorites();
  favoritesCount.textContent = favList.length;
  favoritesCount.style.display = favList.length > 0 ? 'inline-block' : 'none';

  // Update favorites modal
  favoritesList.innerHTML = '';
  if (favList.length === 0) {
    favoritesEmpty.style.display = 'block';
  } else {
    favoritesEmpty.style.display = 'none';
    favList.forEach(name => {
      const pet = pets.find(p => p.name === name);
      if (pet) {
        const item = document.createElement('div');
        item.className = 'favorite-item';
        item.innerHTML = `
          <div class="favorite-info">
            <h4>${pet.name}</h4>
            <p>${pet.type} • ${pet.years || 'Age unknown'}</p>
          </div>
          <button class="remove-favorite-btn" data-name="${pet.name}">Remove</button>
        `;
        favoritesList.appendChild(item);
      }
    });

    // Attach remove event listeners
    document.querySelectorAll('.remove-favorite-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        removeFavorite(e.target.dataset.name);
      });
    });
  }
}

// ============= RENDERING =============
function renderPets(list) {
  petsContainer.innerHTML = '';

  if (list.length === 0) {
    petsContainer.innerHTML = "<p style='grid-column:1/-1;text-align:center;padding:40px;'>No pets found 🐾</p>";
    return;
  }

  list.forEach(pet => {
    const card = document.createElement('div');
    card.className = 'pet-card';
    const isFav = isFavorite(pet.name);

    card.innerHTML = `
      <img class="pet-img" src="${pet.img || './luna.png'}" alt="${pet.name}">
      <div class="pet-overlay">
        <a href="pet.html?id=${pet.id}" class="view-btn">View Details</a>
        <button class="favorite-btn ${isFav ? 'active' : ''}" data-name="${pet.name}" title="Add to favorites">
          ${isFav ? '♥' : '♡'}
        </button>
      </div>
      <div class="pet-info">
        <h3>${pet.name}</h3>
        <span class="pet-badge">${pet.type.toUpperCase()}</span>
        <div class="pet-meta">
          <span><i class="fas fa-birthday-cake"></i> ${pet.years || 'Age TBD'}</span>
          <span><i class="fas fa-venus-mars"></i> ${pet.gender || 'Gender TBD'}</span>
        </div>
      </div>
    `;

    petsContainer.appendChild(card);

    // Favorite button listener
    const favBtn = card.querySelector('.favorite-btn');
    favBtn.addEventListener('click', () => {
      toggleFavorite(pet.name);
      favBtn.textContent = isFavorite(pet.name) ? '♥' : '♡';
      favBtn.classList.toggle('active');
    });
  });
}

// ============= FILTERING =============
function applyFilters() {
  let filtered = pets;

  // Search filter
  if (searchInput.value.trim()) {
    const query = searchInput.value.toLowerCase();
    filtered = filtered.filter(p => p.name.toLowerCase().includes(query));
  }

  // Type filter
  if (typeFilter.value !== 'all') {
    filtered = filtered.filter(p => p.type.toLowerCase() === typeFilter.value);
  }

  // Age filter
  if (ageFilter.value !== 'all') {
    filtered = filtered.filter(p => {
      const age = parseInt(p.years) || 0;
      if (ageFilter.value === 'young') return age < 3;
      if (ageFilter.value === 'adult') return age >= 3 && age < 8;
      if (ageFilter.value === 'senior') return age >= 8;
      return true;
    });
  }

  // Gender filter
  if (genderFilter.value !== 'all') {
    filtered = filtered.filter(p => p.gender?.toLowerCase() === genderFilter.value);
  }

  renderPets(filtered);
}

// ============= MODALS =============
function openModal(modal) {
  modal.style.display = 'flex';
  modal.setAttribute('aria-hidden', 'false');
}

function closeModal(modal) {
  modal.style.display = 'none';
  modal.setAttribute('aria-hidden', 'true');
}

// Close modal when clicking outside
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal(modal);
  });
});

// ============= NOTIFICATIONS =============
function showSuccess(message) {
  const toast = document.getElementById('successMessage');
  toast.textContent = message;
  toast.className = 'toast success';
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

function showError(message) {
  const toast = document.getElementById('successMessage');
  toast.textContent = message;
  toast.className = 'toast error';
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3000);
}

// ============= EVENT LISTENERS =============
function setupEventListeners() {
  // Modals
  openDonateModalBtn.addEventListener('click', () => openModal(donationModal));
  closeDonationModalBtn.addEventListener('click', () => closeModal(donationModal));
  favoritesBtn.addEventListener('click', () => openModal(favoritesModal));
  closeFavoritesModalBtn.addEventListener('click', () => closeModal(favoritesModal));

  // Filters
  searchInput.addEventListener('input', applyFilters);
  typeFilter.addEventListener('change', applyFilters);
  ageFilter.addEventListener('change', applyFilters);
  genderFilter.addEventListener('change', applyFilters);

  // Mobile menu
  mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
  });

  // Close mobile menu on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('active');
    });
  });
}

// ============= INITIALIZATION =============
async function init() {
  setupEventListeners();
  await loadPetsFromServer();
}

// Start the app
document.addEventListener('DOMContentLoaded', init);
