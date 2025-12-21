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
const pets = [
  { name: "Buddy", type: "dog", age: "adult", gender: "male", years: "2 Years", img: "https://images.unsplash.com/photo-1517849845537-4d257902454a" },
  { name: "Luna", type: "cat", age: "young", gender: "female", years: "1 Year", img: "https://images.unsplash.com/photo-1595433562696-19b23c8e0c8f" },
  { name: "Max", type: "dog", age: "adult", gender: "male", years: "3 Years", img: "https://images.unsplash.com/photo-1558788353-f76d92427f16" },
  { name: "Milo", type: "cat", age: "adult", gender: "male", years: "4 Years", img: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131" },
  { name: "Snowy", type: "other", age: "young", gender: "female", years: "1 Year", img: "https://images.unsplash.com/photo-1546182990-dffeafbe841d" },
  { name: "Rocky", type: "dog", age: "senior", gender: "male", years: "5 Years", img: "https://images.unsplash.com/photo-1601758064130-09f7e88a1c7c" },
  { name: "Bella", type: "cat", age: "young", gender: "female", years: "2 Years", img: "https://images.unsplash.com/photo-1529778873920-4da4926a72c2" },
  { name: "Kiwi", type: "other", age: "young", gender: "male", years: "1 Year", img: "https://images.unsplash.com/photo-1507149833265-60c372daea22" },
  { name: "Charlie", type: "dog", age: "senior", gender: "male", years: "6 Years", img: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e" },
  { name: "Nala", type: "cat", age: "adult", gender: "female", years: "3 Years", img: "https://images.unsplash.com/photo-1608848461950-0fe51dfc41cb" }
];

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
      <img class="pet-img" src="${pet.img}" alt="${pet.name}">
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
searchInput.addEventListener("input", applyFilters);


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
});

/* ================= ADOPT BUTTON (EVENT DELEGATION) ================= */
petsContainer.addEventListener("click", e => {
  if (e.target.classList.contains("adopt-btn")) {
    const petName = e.target.getAttribute("data-name");
    alert(`🐾 Thank you for choosing to adopt ${petName}! Our team will contact you soon.`);
  }
});

/* ================= MOBILE MENU ================= */
mobileMenuBtn.addEventListener("click", () => {
  navLinks.classList.toggle("show");
});

/* ================= INIT ================= */
document.addEventListener("DOMContentLoaded", () => {
  renderPets(pets);
});
