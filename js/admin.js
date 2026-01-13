/* =====================================================
   PAWS HAVEN – ADMIN PANEL JAVASCRIPT
===================================================== */

// ============= DOM ELEMENTS =============
const authForm = document.getElementById('authForm');
const adminKey = document.getElementById('adminKey');
const authSection = document.getElementById('adminAuthSection');
const dashboard = document.getElementById('adminDashboard');
const addPetForm = document.getElementById('addPetForm');
const logoutBtn = document.getElementById('logoutBtn');
const petsList = document.getElementById('petsList');
const searchPets = document.getElementById('searchPets');
const toastMessage = document.getElementById('toastMessage');

// ============= STATE =============
let allPets = [];
let isAuthenticated = false;
let adminKeyStored = null;

// ============= API CALLS =============
async function loadPets() {
  try {
    const res = await fetch('/api/pets');
    if (!res.ok) throw new Error('Failed to load pets');
    allPets = await res.json();
    renderPets(allPets);
  } catch (err) {
    console.error('Error loading pets:', err);
    showToast('Failed to load pets', 'error');
  }
}

async function addPet(payload) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (adminKeyStored) headers['x-api-key'] = adminKeyStored;

    const res = await fetch('/api/pets', {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to add pet');
    }

    const pet = await res.json();
    await loadPets();
    return pet;
  } catch (err) {
    console.error('Error adding pet:', err);
    throw err;
  }
}

async function deletePet(id) {
  try {
    const headers = {};
    if (adminKeyStored) headers['x-api-key'] = adminKeyStored;

    const res = await fetch(`/api/pets/${id}`, {
      method: 'DELETE',
      headers
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to delete pet');
    }

    await loadPets();
    return true;
  } catch (err) {
    console.error('Error deleting pet:', err);
    throw err;
  }
}

// ============= AUTHENTICATION =============
function authenticate(key) {
  // Store the key for API requests
  adminKeyStored = key;
  isAuthenticated = true;
  sessionStorage.setItem('adminKey', key);

  // Show dashboard, hide auth
  authSection.style.display = 'none';
  dashboard.style.display = 'block';

  showToast('Admin access granted! Welcome back.', 'success');
  loadPets();
}

function logout() {
  isAuthenticated = false;
  adminKeyStored = null;
  sessionStorage.removeItem('adminKey');

  // Show auth, hide dashboard
  authSection.style.display = 'flex';
  dashboard.style.display = 'none';
  adminKey.value = '';

  showToast('Logged out successfully', 'success');
}

// Check if already authenticated on page load
function checkAuthentication() {
  const storedKey = sessionStorage.getItem('adminKey');
  if (storedKey) {
    authenticate(storedKey);
  }
}

// ============= RENDERING =============
function renderPets(pets) {
  petsList.innerHTML = '';

  if (pets.length === 0) {
    petsList.innerHTML = '<p class="loading">No pets in the shelter yet. Add one to get started!</p>';
    return;
  }

  pets.forEach(pet => {
    const petCard = document.createElement('div');
    petCard.className = 'pet-item';

    petCard.innerHTML = `
      <img src="${pet.img || './luna.png'}" alt="${pet.name}" onerror="this.src='./luna.png'">
      <div class="pet-item-info">
        <div class="pet-item-name">${pet.name}</div>
        <div class="pet-item-meta">
          <span class="pet-badge">${pet.type.toUpperCase()}</span>
          <span>🎂 ${pet.years || 'Age TBD'}</span>
          <span>⚧ ${pet.gender || 'Gender TBD'}</span>
        </div>
        <div class="pet-item-desc">${pet.description || 'No description provided'}</div>
        <div class="pet-item-actions">
          <button class="btn btn-outline btn-sm delete-btn" data-id="${pet.id}">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
    `;

    petsList.appendChild(petCard);
  });

  // Attach delete listeners
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const petId = e.currentTarget.dataset.id;
      const petName = e.currentTarget.closest('.pet-item').querySelector('.pet-item-name').textContent;
      if (confirm(`Are you sure you want to delete ${petName}?`)) {
        try {
          e.currentTarget.disabled = true;
          e.currentTarget.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
          await deletePet(petId);
          showToast(`${petName} deleted successfully`, 'success');
        } catch (err) {
          showToast(`Error: ${err.message}`, 'error');
          e.currentTarget.disabled = false;
          e.currentTarget.innerHTML = '<i class="fas fa-trash"></i> Delete';
        }
      }
    });
  });
}

// ============= FILTERING =============
function filterPets() {
  const query = searchPets.value.toLowerCase();
  const filtered = allPets.filter(pet =>
    pet.name.toLowerCase().includes(query) ||
    pet.type.toLowerCase().includes(query)
  );
  renderPets(filtered);
}

// ============= FORM HANDLING =============
authForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const key = adminKey.value.trim();

  if (!key) {
    showToast('Please enter an admin key', 'error');
    return;
  }

  authenticate(key);
});

addPetForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payload = {
    name: document.getElementById('petName').value.trim(),
    type: document.getElementById('petType').value,
    years: document.getElementById('petYears').value.trim(),
    gender: document.getElementById('petGender').value,
    img: document.getElementById('petImg').value.trim(),
    description: document.getElementById('petDesc').value.trim()
  };

  if (!payload.name || !payload.type) {
    showToast('Pet name and type are required!', 'error');
    return;
  }

  try {
    const submitBtn = addPetForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Adding...';

    await addPet(payload);

    showToast(`${payload.name} added to the shelter! 🎉`, 'success');
    addPetForm.reset();
  } catch (err) {
    showToast(`Error: ${err.message}`, 'error');
  } finally {
    const submitBtn = addPetForm.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add Pet to Shelter';
  }
});

logoutBtn.addEventListener('click', logout);
searchPets.addEventListener('input', filterPets);

// ============= NOTIFICATIONS =============
function showToast(message, type = 'success') {
  toastMessage.textContent = message;
  toastMessage.className = `show ${type}`;

  setTimeout(() => {
    toastMessage.classList.remove('show');
  }, 3000);
}

// ============= INITIALIZATION =============
document.addEventListener('DOMContentLoaded', () => {
  checkAuthentication();
});
