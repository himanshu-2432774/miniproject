/* =====================================================
   PAWS HAVEN – MAIN JAVASCRIPT FILE
   Author: Frontend Professional Mode 😎
===================================================== */
const searchInput = document.getElementById("searchInput");

/* ================= DOM ELEMENTS ================= */
const petsContainer = document.getElementById("petsContainer");
const typeFilter = document.getElementById("typeFilter");
const ageFilter = document.getElementById("ageFilter");
const genderFilter = document.getElementById("genderFilter");

const donationModal = document.getElementById("donationModal");
const openDonateModalBtn = document.getElementById("openDonateModal");
const closeDonationModalBtn = document.getElementById("closeDonationModal");

const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const navLinks = document.getElementById("navLinks");

/* ================= PET DATA ================= */
let pets = []; // will be loaded from backend

async function loadPetsFromServer() {
  try {
    const res = await fetch('/api/pets');
    if (!res.ok) throw new Error('Failed to load pets');
    pets = await res.json();
    // map server fields to expected UI fields
    pets = pets.map(p => ({
      name: p.name,
      type: p.type || 'other',
      age: p.age || 'adult',
      gender: p.gender || 'unknown',
      years: p.years || '',
      img: p.img || ''
    }));
    applyFilters();
    updateFavoritesUI();
  } catch (err) {
    console.error('Could not fetch pets from server:', err);
    // fallback to existing static list display logic
    pets = [];
    applyFilters();
  }
}

// Create pet helper — sends POST to server and reloads list
async function createPet(payload, apiKey) {
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
    console.error(err);
    throw err;
  }
}

/* ================= RENDER PETS ================= */
function renderPets(list) {
  petsContainer.innerHTML = "";

  if (list.length === 0) {
    petsContainer.innerHTML = "<p style='grid-column:1/-1;text-align:center;'>No pets found 🐾</p>";
    return;
  }

  list.forEach(pet => {
    const card = document.createElement("div");
    card.className = "pet-card";

    card.innerHTML = `
      <img class="pet-img" src="${pet.img}" alt="${pet.name}" onerror="this.onerror=null;this.src='./luna.png'">
      <div class="pet-actions">
        <a href="pet.html?name=${encodeURIComponent(pet.name)}" class="view-btn">View Details</a>
        <button class="favorite-btn" data-name="${pet.name}" aria-pressed="false" title="Add to favorites">♡</button>
      </div>
      <div class="pet-info">
        <h3>${pet.name}</h3>
        <span class="pet-type">${pet.type.toUpperCase()}</span>
        <div class="pet-details">
          <span>Age: ${pet.years}</span>
          <span>${pet.gender}</span>
        </div>
        <button class="adopt-btn" data-name="${pet.name}">Adopt Now</button>
      </div>
    `;

    petsContainer.appendChild(card);
  });
}

/* ================= FILTER LOGIC ================= */
function applyFilters() {
  const typeValue = typeFilter.value;
  const ageValue = ageFilter.value;
  const genderValue = genderFilter.value;
  const searchValue = searchInput.value.toLowerCase();

  const filteredPets = pets.filter(pet => {
    return (
      (typeValue === "all" || pet.type === typeValue) &&
      (ageValue === "all" || pet.age === ageValue) &&
      (genderValue === "all" || pet.gender === genderValue) &&
      pet.name.toLowerCase().includes(searchValue)
    );
  });

  renderPets(filteredPets);
}


/* ================= EVENT LISTENERS ================= */
typeFilter.addEventListener("change", applyFilters);
ageFilter.addEventListener("change", applyFilters);
genderFilter.addEventListener("change", applyFilters);

// Debounce helper for smoother input
function debounce(fn, delay = 250) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), delay);
  };
}

const debouncedApplyFilters = debounce(applyFilters, 240);
searchInput.addEventListener("input", debouncedApplyFilters);

// Clear button handling and visibility
const clearSearchBtn = document.getElementById('clearSearch');
function updateClearButton() {
  if (!clearSearchBtn) return;
  clearSearchBtn.style.display = searchInput.value ? 'inline-flex' : 'none';
}

// Keep clear button visibility in sync (immediate, not debounced)
searchInput.addEventListener('input', updateClearButton);
updateClearButton();

if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    updateClearButton();
    applyFilters();
    searchInput.focus();
  });
}

// Press Escape to clear search
searchInput.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    searchInput.value = '';
    updateClearButton();
    applyFilters();
  }
});


/* ================= MODAL HANDLING ================= */
openDonateModalBtn.addEventListener("click", () => {
  donationModal.style.display = "flex";
});

closeDonationModalBtn.addEventListener("click", () => {
  donationModal.style.display = "none";
});

window.addEventListener("click", e => {
  if (e.target === donationModal) {
    donationModal.style.display = "none";
  }
  if (favoritesModal && e.target === favoritesModal) {
    favoritesModal.style.display = 'none';
  }
});

/* ================= ADOPT / FAVORITES HANDLING (EVENT DELEGATION) ================= */
petsContainer.addEventListener("click", e => {
  // Adopt
  if (e.target.classList.contains("adopt-btn")) {
    const petName = e.target.getAttribute("data-name");
    alert(`🐾 Thank you for choosing to adopt ${petName}! Our team will contact you soon.`);
    return;
  }

  // Favorite toggle (heart)
  if (e.target.classList.contains('favorite-btn')) {
    const name = e.target.getAttribute('data-name');
    toggleFavorite(name);
    return;
  }
});

// Close favorites modal when clicking outside is handled above. Handle remove in modal and view actions via document delegation
document.addEventListener('click', e => {
  if (e.target.classList && e.target.classList.contains('remove-fav')) {
    const name = e.target.getAttribute('data-name');
    removeFavorite(name);
    renderFavoritesList();
  }
});

/* ================= FAVORITES (CART) ================= */
const favoritesBtn = document.getElementById('favoritesBtn');
const favoritesModal = document.getElementById('favoritesModal');
const closeFavoritesModalBtn = document.getElementById('closeFavoritesModal');
const favoritesListEl = document.getElementById('favoritesList');
const favoritesEmpty = document.getElementById('favoritesEmpty');

function getFavorites() {
  try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch (err) { return []; }
}
function saveFavorites(arr) { localStorage.setItem('favorites', JSON.stringify(arr)); }
function isFavorite(name) { return getFavorites().includes(name); }
function addFavorite(name) { const arr = getFavorites(); if (!arr.includes(name)) { arr.push(name); saveFavorites(arr); } updateFavoritesUI(); }
function removeFavorite(name) { const arr = getFavorites().filter(n => n !== name); saveFavorites(arr); updateFavoritesUI(); }
function toggleFavorite(name) { if (isFavorite(name)) removeFavorite(name); else addFavorite(name); renderFavoritesList(); }

function updateFavoritesUI() {
  const count = getFavorites().length;
  const badge = document.getElementById('favoritesCount');
  if (badge) { badge.textContent = count; badge.style.display = count ? 'inline-block' : 'none'; }

  document.querySelectorAll('.favorite-btn').forEach(btn => {
    const nm = btn.dataset.name;
    if (isFavorite(nm)) {
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = '♥';
    } else {
      btn.classList.remove('active');
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = '♡';
    }
  });
}

function renderFavoritesList() {
  if (!favoritesListEl) return;
  const favs = getFavorites();
  favoritesListEl.innerHTML = '';
  if (favs.length === 0) {
    if (favoritesEmpty) favoritesEmpty.style.display = 'block';
    return;
  }
  if (favoritesEmpty) favoritesEmpty.style.display = 'none';

  favs.forEach(name => {
    const pet = pets.find(p => p.name === name);
    if (!pet) return;
    const div = document.createElement('div');
    div.className = 'favorite-item';
    div.innerHTML = `
      <img src="${pet.img}" alt="${pet.name}" onerror="this.onerror=null;this.src='./luna.png'">
      <div class="fav-meta">
        <h4>${pet.name}</h4>
        <p>${pet.type}</p>
      </div>
      <div class="fav-actions">
        <a href="pet.html?name=${encodeURIComponent(pet.name)}" class="btn small view">View</a>
        <button class="btn small remove-fav" data-name="${pet.name}">Remove</button>
      </div>
    `;
    favoritesListEl.appendChild(div);
  });
}

if (favoritesBtn) {
  favoritesBtn.addEventListener('click', () => {
    if (favoritesModal) { renderFavoritesList(); favoritesModal.style.display = 'flex'; }
  });
}
if (closeFavoritesModalBtn) closeFavoritesModalBtn.addEventListener('click', () => { if (favoritesModal) favoritesModal.style.display = 'none'; });

// Update UI on page load
updateFavoritesUI();

/* ================= MOBILE MENU ================= */
mobileMenuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  // Load pets from backend and render
  loadPetsFromServer();

  // Hook up create-pet form (admin)
  const createPetForm = document.getElementById('createPetForm');
  if (createPetForm) {
    const adminKeyInput = document.getElementById('adminKeyInput');
    const saveAdminKey = document.getElementById('saveAdminKey');
    const clearAdminKey = document.getElementById('clearAdminKey');
    const createPetMessage = document.getElementById('createPetMessage');

    // load saved key
    if (adminKeyInput && localStorage.getItem('adminKey')) {
      adminKeyInput.value = localStorage.getItem('adminKey');
    }

    if (saveAdminKey && adminKeyInput) {
      saveAdminKey.addEventListener('click', () => {
        localStorage.setItem('adminKey', adminKeyInput.value.trim());
        createPetMessage.textContent = 'Admin key saved (stored locally)';
      });
    }
    if (clearAdminKey && adminKeyInput) {
      clearAdminKey.addEventListener('click', () => {
        localStorage.removeItem('adminKey');
        adminKeyInput.value = '';
        createPetMessage.textContent = 'Admin key cleared';
      });
    }

    createPetForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      createPetMessage.textContent = '';
      const name = document.getElementById('petNameInput').value.trim();
      const type = document.getElementById('petTypeInput').value.trim();
      const years = document.getElementById('petAgeInput').value.trim();
      const gender = document.getElementById('petGenderInput').value.trim();
      const img = document.getElementById('petImgInput').value.trim();
      if (!name || !type) {
        createPetMessage.textContent = 'Name and type are required';
        createPetMessage.style.color = 'crimson';
        return;
      }
      const payload = { name, type, years, gender, img };
      const apiKey = localStorage.getItem('adminKey') || '';
      try {
        await createPet(payload, apiKey);
        createPetForm.reset();
        createPetMessage.textContent = 'Pet added successfully';
        createPetMessage.style.color = 'green';
      } catch (err) {
        createPetMessage.textContent = err.message || 'Error adding pet';
        createPetMessage.style.color = 'crimson';
      }
    });
  }

  updateFavoritesUI();
});
