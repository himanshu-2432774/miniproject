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

