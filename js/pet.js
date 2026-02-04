/* =====================================================
   PAWS HAVEN – PET DETAILS JAVASCRIPT
===================================================== */

(async function () {
  // Elements in the page
  const petImage = document.getElementById('petImage');
  const petNameEl = document.getElementById('petName');
  const petTypeEl = document.getElementById('petType');
  const petAgeEl = document.getElementById('petAge');
  const petGenderEl = document.getElementById('petGender');
  const petDescriptionEl = document.getElementById('petDescription');
  const petDetailsSection = document.querySelector('.pet-details');
  const favoriteBtn = document.getElementById('favoriteBtn');
  const headerFavoritesCount = document.getElementById('favoritesCount');

  // Adoption form elements
  const adoptBtn = document.getElementById('adoptBtn');
  const adoptionModal = document.getElementById('adoptionModal');
  const adoptionForm = document.getElementById('adoptionForm');
  const closeModalBtn = document.querySelector('.close');
  const cancelBtn = document.getElementById('cancelBtn');

  const params = new URLSearchParams(window.location.search);
  const petNameParam = params.get('name');
  const petIdParam = params.get('id');

  const FALLBACK_IMG = './luna.png';

  // helper favorites
  function getFavorites() { try { return JSON.parse(localStorage.getItem('favorites') || '[]'); } catch (e) { return []; } }
  function saveFavorites(list) { localStorage.setItem('favorites', JSON.stringify(list)); }
  function isFavorite(name) { return getFavorites().includes(name); }
  function addFavorite(name) { const list = getFavorites(); if (!list.includes(name)) { list.push(name); saveFavorites(list); } updateFavoriteUI(); }
  function removeFavorite(name) { const list = getFavorites().filter(n => n !== name); saveFavorites(list); updateFavoriteUI(); }
  function toggleFavorite(name) { if (isFavorite(name)) removeFavorite(name); else addFavorite(name); }

  function updateFavoriteUI(petName) {
    if (!favoriteBtn || !petName) return;
    const fav = isFavorite(petName);
    favoriteBtn.textContent = fav ? '♥ Favorited' : '♡ Favorite';
    favoriteBtn.setAttribute('aria-pressed', fav ? 'true' : 'false');
    if (headerFavoritesCount) {
      const cnt = getFavorites().length;
      headerFavoritesCount.textContent = cnt;
      headerFavoritesCount.style.display = cnt ? 'inline-block' : 'none';
    }
  }

  // Adoption form functions
  function openAdoptionModal() {
    adoptionModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeAdoptionModal() {
    adoptionModal.classList.remove('open');
    document.body.style.overflow = 'auto';
    adoptionForm.reset();
  }

  function handleAdoptionSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(adoptionForm);
    const data = Object.fromEntries(formData);
    
    // Get pet name from the page
    const petName = petNameEl.textContent;
    
    // Add pet name to the data
    const applicationData = {
      ...data,
      petName: petName
    };

    // Show loading state
    const submitBtn = adoptionForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    // Send to API
    fetch('/api/adoptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(applicationData)
    })
    .then(res => res.json())
    .then(result => {
      if (result.success) {
        alert('Adoption application submitted successfully! We will review your application and contact you soon.');
        closeAdoptionModal();
      } else {
        alert('Error: ' + (result.error || 'Failed to submit application'));
      }
    })
    .catch(err => {
      console.error('Error submitting adoption application:', err);
      alert('Error submitting application. Please try again.');
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    });
  }

  // Event listeners for adoption modal
  if (adoptBtn) {
    adoptBtn.addEventListener('click', openAdoptionModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeAdoptionModal);
  }

  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeAdoptionModal);
  }

  if (adoptionForm) {
    adoptionForm.addEventListener('submit', handleAdoptionSubmit);
  }

  // Close modal when clicking outside of it
  if (adoptionModal) {
    adoptionModal.addEventListener('click', (e) => {
      if (e.target === adoptionModal) {
        closeAdoptionModal();
      }
    });
  }

  try {
    const res = await fetch('/api/pets');
    if (!res.ok) throw new Error('Failed to fetch');
    const list = await res.json();
    let pet;
    if (petIdParam) pet = list.find(p => String(p.id) === String(petIdParam));
    else if (petNameParam) pet = list.find(p => p.name.toLowerCase() === petNameParam.toLowerCase());

    if (!pet) {
      if (petDetailsSection) {
        petDetailsSection.innerHTML = '<p style="text-align:center;">Pet not found. <a href="index.html#pets">Back to pets</a></p>';
      }
      return;
    }

    petNameEl.textContent = pet.name;
    petTypeEl.textContent = pet.type || 'Type';
    petImage.onerror = () => { petImage.src = FALLBACK_IMG; };
    petImage.src = pet.img || FALLBACK_IMG;
    petAgeEl.textContent = pet.years || pet.age || '';
    petGenderEl.textContent = pet.gender || '';
    petDescriptionEl.textContent = pet.description || `Meet ${pet.name} — a lovely ${pet.type || 'pet'}!`;

    updateFavoriteUI(pet.name);
    if (favoriteBtn) {
      favoriteBtn.addEventListener('click', () => {
        toggleFavorite(pet.name);
        updateFavoriteUI(pet.name);
      });
    }

  } catch (err) {
    console.error('Error loading pet details', err);
    if (petDetailsSection) petDetailsSection.innerHTML = '<p style="text-align:center;">Error loading pet details. Try again later.</p>';
  }
})();
