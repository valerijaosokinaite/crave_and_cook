document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("main > section");
  const navLinks = document.querySelectorAll("[data-target]");
  const recipeList = document.getElementById("recipe-list");
  const loadMoreBtn = document.getElementById("load-more");
  const clearFiltersBtn = document.getElementById("clear-filters");
  const searchInput = document.getElementById("search-input");
  const logo = document.querySelector(".logo");
  const testSection = document.getElementById("naujienlaiskis");
console.log("Ar egzistuoja naujienlaiskis sekcija?", !!testSection);


let recipes = [];
let filteredRecipes = [];
let currentIndex = 0;
const recipesPerPage = 6;

async function fetchRecipesFromDB() {
  try {
    const res = await fetch("get_recipes.php");
    const text = await res.text();

    console.log("📦 Gauta iš get_recipes.php:", text);

    let data;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("❌ Klaida parsiduodant JSON:", err);
      alert("Serverio atsakymas nėra teisingas JSON. Patikrink get_recipes.php!");
      return;
    }

    if (data.success && data.recipes) {
      recipes = data.recipes;
      filteredRecipes = [...recipes];
      renderRecipes(filteredRecipes, 0, recipesPerPage);
      currentIndex = recipesPerPage;
    } else {
      alert("⚠️ Nepavyko gauti receptų iš serverio. Pranešimas: " + data.message);
    }
  } catch (err) {
    console.error("💥 Klaida gaunant receptus:", err);
  }
}


  document.querySelectorAll(".category-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const meal = btn.getAttribute("data-meal");
  
      showSection(targetId);
  
      setTimeout(() => {
        const mealSection = document.getElementById("meal-" + meal.toLowerCase());
        if (mealSection) {
          mealSection.scrollIntoView({ behavior: "smooth" });
        }
      }, 200);
    });
  });
  
  function renderRecipes(list, from = 0, count = recipesPerPage) {
    const sliced = list.slice(from, from + count);
    sliced.forEach(r => {
      const card = document.createElement("div");
      card.className = "recipe-card";
      const imgSrc = r.img.startsWith("http") ? r.img : "https://itech024.vaidila.vdu.lt/" + r.img;
      card.innerHTML = `
      <img src="${imgSrc}" alt="${r.title}">
      <p><strong>${r.title}</strong><br><small>${r.description}</small></p>
      <button class="view-recipe-btn" data-title="${r.title.replaceAll('"', '&quot;')}">Peržiūrėti receptą</button>


    `;         

      recipeList.appendChild(card);
    });
  }

  function applyFilters() {
    const checkboxes = document.querySelectorAll(".filter");
    const selected = { meal: [], type: [], diet: [], cuisine: [] };

    checkboxes.forEach(c => {
      if (c.checked) selected[c.dataset.type].push(c.value);
    });

    filteredRecipes = recipes.filter(r => {
      return (!selected.meal.length || selected.meal.includes(r.meal)) &&
             (!selected.type.length || selected.type.includes(r.type)) &&
             (!selected.diet.length || selected.diet.includes(r.diet)) &&
             (!selected.cuisine.length || selected.cuisine.includes(r.cuisine));
    });

    currentIndex = 0;
    recipeList.innerHTML = "";
    applySearch();
  }

  function applySearch() {
    const query = searchInput?.value.toLowerCase() || "";
    const result = filteredRecipes.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.description.toLowerCase().includes(query)
    );
  
    const noResultsEl = document.getElementById("no-results-msg");
    recipeList.innerHTML = "";
    currentIndex = 0;
  
    if (result.length === 0) {
      noResultsEl.style.display = "block";
      loadMoreBtn.style.display = "none";
    } else {
      noResultsEl.style.display = "none";
      renderRecipes(result, currentIndex, recipesPerPage);
      currentIndex += recipesPerPage;
      loadMoreBtn.style.display = result.length > currentIndex ? "inline-block" : "none";
    }
  }  

// Kiek receptų jau parodyta kiekvienai kategorijai
const mealRenderCount = {};

async function renderMealRecipes(meal, count = 4) {
  const container = document.getElementById("meal-" + meal.toLowerCase());
  if (!container) return;

  try {
    const res = await fetch("get_recipes.php");
    const data = await res.json();

    if (data.success && data.recipes) {
      const filtered = data.recipes.filter(r => r.meal === meal);

      // Inicializuojam skaitiklį, jei pirmą kartą
      if (!mealRenderCount[meal]) mealRenderCount[meal] = 0;

      const start = mealRenderCount[meal];
      const end = start + count;
      const toRender = filtered.slice(start, end);

      toRender.forEach(r => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
          <img src="${r.img}" alt="${r.title}">
          <p><strong>${r.title}</strong><br><small>${r.description}</small></p>
          <button class="view-recipe-btn" data-title="${r.title.replaceAll('"', '&quot;')}">Peržiūrėti receptą</button>

        `;
        container.appendChild(card);
      });

      // Atnaujinti kiekis
      mealRenderCount[meal] += toRender.length;

      // Jei daugiau nėra – paslėpti mygtuką
      const btn = document.querySelector(`.load-more-btn[data-meal="${meal}"]`);
      if (mealRenderCount[meal] >= filtered.length && btn) {
        btn.style.display = "none";
      }
    }
  } catch (err) {
    console.error("Klaida gaunant receptus pagal meal:", err);
  }
}

// Visų receptų krovimas
loadMoreBtn?.addEventListener("click", () => {
  renderRecipes(filteredRecipes, currentIndex, recipesPerPage);
  currentIndex += recipesPerPage;
  if (currentIndex >= filteredRecipes.length) {
    loadMoreBtn.style.display = "none";
  }
});

// Navigacija tarp sekcijų
navLinks.forEach(link => {
  link.addEventListener("click", e => {
    if (e.target.classList.contains("toggle-password") || e.target.closest(".toggle-password")) {
      return;
    }

    e.preventDefault();
    const targetId = link.getAttribute("data-target");
    console.log("Paspausta ant nuorodos:", targetId);

    const allSections = document.querySelectorAll("section");
    allSections.forEach(sec => {
      console.log("Sekcija:", sec.id, "→", sec.id === targetId ? "RODYTI" : "SLEPTI");
      sec.style.display = sec.id === targetId ? "block" : "none";
    });

    if (targetId === "visi-receptai") {
      recipeList.innerHTML = "";
      currentIndex = 0;
      fetchRecipesFromDB();
    }

    if (targetId === "valgymo-metas") {
      document.querySelectorAll("[id^='meal-']").forEach(el => el.innerHTML = "");
      const mealTypes = ["Pusryčiai", "Pietūs", "Vakarienė", "Užkandžiai", "Desertai"];
      mealTypes.forEach(meal => renderMealRecipes(meal, 4));
      document.querySelectorAll(".load-more-btn[data-meal]").forEach(btn => {
        btn.style.display = "block"; // parodyti mygtuką
        mealRenderCount[btn.dataset.meal] = 0; // atstatyti skaitiklį
        btn.onclick = () => renderMealRecipes(btn.dataset.meal, 4);
      });
    }

    window.scrollTo(0, 0);
  });
});

// Spausdinant logotipą – grįžti į home
logo?.addEventListener("click", () => {
  sections.forEach(sec => {
    sec.style.display = (sec.id === "home" || sec.id === "home-kategorijos") ? "block" : "none";
  });
  window.scrollTo(0, 0);
});

  document.querySelectorAll(".filter").forEach(cb =>
    cb.addEventListener("change", applyFilters)
  );

  clearFiltersBtn?.addEventListener("click", () => {
    document.getElementById("no-results-msg").style.display = "none";
    document.querySelectorAll(".filter").forEach(cb => cb.checked = false);
    filteredRecipes = [...recipes];
    currentIndex = 0;
    recipeList.innerHTML = "";
    renderRecipes(filteredRecipes, currentIndex, recipesPerPage);
    currentIndex += recipesPerPage;
    loadMoreBtn.style.display = "inline-block";
  });

  searchInput?.addEventListener("input", applySearch);

// Ingredientų pridėjimas
function addIngredientRow() {
const container = document.getElementById("ingredients-list");
const row = document.createElement("div");
row.className = "ingredient-row";
row.innerHTML = `
  <input type="text" name="ingredient_name[]" placeholder="Ingrediento pavadinimas" required>
  <input type="text" name="ingredient_amount[]" placeholder="Kiekis" required>
  <input type="text" name="ingredient_unit[]" placeholder="Matavimo vnt." required>
  <button type="button" class="remove">✖</button>
`;
container.appendChild(row);
}

// Rodyti peržiūrą įkeltos nuotraukos
document.getElementById("image-upload")?.addEventListener("change", (e) => {
const previewContainer = document.getElementById("photo-preview");
previewContainer.innerHTML = "";

[...e.target.files].forEach(file => {
  const reader = new FileReader();
  reader.onload = event => {
    const img = document.createElement("img");
    img.src = event.target.result;
    previewContainer.appendChild(img);
  };
  reader.readAsDataURL(file);
});
});

// Pirmi 3 ingredientai automatiškai
for (let i = 0; i < 3; i++) addIngredientRow();

// Pridėti naują ingredientą
document.querySelector(".add-ingredient")?.addEventListener("click", () => {
addIngredientRow();
});

// Šalinti ingredientą
document.getElementById("ingredients-list")?.addEventListener("click", (e) => {
if (e.target.classList.contains("remove")) {
  e.target.parentElement.remove();
}
});

// Validacija prieš įkėlimą
document.getElementById("recipe-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);

  try {
    const response = await fetch("upload_recipe.php", {
      method: "POST",
      body: formData
    });

    const result = await response.json();

    if (result.success) {
      alert("✅ " + result.message);

      // Atnaujinti bendrą receptų sąrašą
      await fetchRecipesFromDB();

      // Išvalyti formą ir ingredientus
      form.reset();
      document.getElementById("photo-preview").innerHTML = "";
      document.getElementById("ingredients-list").innerHTML = "";
      for (let i = 0; i < 3; i++) addIngredientRow();

      // ✅ Visada iš naujo užkrauti profilio duomenis (vardą, skaičius, receptus)
      loadProfileData();

    } else {
      alert("❌ " + result.message);
    }
  } catch (error) {
    console.error("❌ Klaida siunčiant duomenis:", error);
    alert("Įvyko klaida siunčiant duomenis į serverį.");
  }
});

// Kontaktų forma
document.getElementById("contact-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  const subject = document.getElementById("subject").value.trim();
  const message = document.getElementById("message").value.trim();

  const formData = new FormData();
  formData.append("name", name);
  formData.append("email", email);
  formData.append("subject", subject);
  formData.append("message", message);

  try {
    const res = await fetch("contact.php", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      document.getElementById("contact-success").style.display = "block";
      this.reset();
      setTimeout(() => {
        document.getElementById("contact-success").style.display = "none";
      }, 5000);
    } else {
      alert("❗ " + data.message);
    }
  } catch (err) {
    alert("❌ Klaida siunčiant žinutę: " + err.message);
  }
});


let isLoggedIn = false;

// Sekcijų valdymas
function showSection(id) {
  console.log(">> showSection(", id, ")");

  // Jei paspausta ant akutės, nesukelia netyčinio hide
  if (!id || typeof id !== "string") {
    console.warn("⚠️ Netinkamas sekcijos ID:", id);
    return;
  }

  const sections = document.querySelectorAll("section");
  sections.forEach(sec => {
    if (sec.id === id) {
      sec.style.display = "block";
      console.log(`Sekcija: ${sec.id} → RODOMA ✅`);
    } else {
      sec.style.display = "none";
      console.log(`Sekcija: ${sec.id} → SLEPTI`);
    }
  });

  // Jei atidaromas profilio puslapis – užkrauti jo duomenis
  if (id === "profilis") {
    console.log("🔄 Kraunami profilio duomenys...");
    loadProfileData();
  }
}


const saveBtn = document.getElementById("save-recipe-btn");
if (saveBtn) {
  saveBtn.addEventListener("click", async function () {
    if (!isLoggedIn) {
      alert("Norint išsaugoti receptą, reikia prisijungti.");
      return;
    }

    const title = document.getElementById("receptas-pavadinimas").innerText;
    const recipeObj = recipes.find(r => r.title === title);

    if (!recipeObj || !recipeObj.id) {
      alert("Nepavyko rasti recepto ID.");
      return;
    }

    const formData = new FormData();
    formData.append("recipe_id", recipeObj.id);

    try {
      const res = await fetch("save_favorite.php", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      alert(data.message || "Nepavyko įtraukti recepto.");

      if (data.success) {
        // Atnaujinti mėgstamiausių sąrašą
        updateFavorites();

        // Parsisiųsti atnaujintą receptų sąrašą iš DB
        try {
          const response = await fetch("get_recipes.php");
          const result = await response.json();
          if (result.success && result.recipes) {
            recipes = result.recipes;
            const updatedRecipe = recipes.find(r => r.title === title);
            if (updatedRecipe) {
              document.getElementById("receptas-likes").innerText = updatedRecipe.likes;
            }
          }
        } catch (err) {
          console.error("❌ Klaida gaunant atnaujintus receptus:", err);
        }

        // Jei profilio sekcija matoma – atnaujinti mėgstamiausių skaičių
        const profileSection = document.getElementById("profilis");
        if (profileSection?.style.display === "block") {
          const favoritesEl = document.getElementById("profile-favorites");
          if (favoritesEl) {
            favoritesEl.textContent = (parseInt(favoritesEl.textContent) || 0) + 1;
          }
        }
      }
    } catch (err) {
      console.error("❌ Klaida išsaugant mėgstamiausią:", err);
      alert("Įvyko klaida jungiantis prie serverio.");
    }
  });
}


// Po puslapio užkrovimo – patikrinam ar naudotojas jau prisijungęs
(async function checkSession() {
  try {
    const res = await fetch("session_check.php");
    if (!res.ok) {
      throw new Error("Nepavyko gauti sesijos (klaida: " + res.status + ")");
    }
    const data = await res.json();

    if (data.loggedIn) {
      isLoggedIn = true; // ✅ Pridedam – naudotojas prisijungęs

      document.querySelector(".top-heart")?.classList.remove("d-none");
      document.querySelector(".top-profile")?.classList.remove("d-none");
      document.querySelector(".login-btn")?.classList.add("d-none");

      const profileNameEl = document.querySelector("#profilis p strong");
      if (profileNameEl) {
        profileNameEl.innerText = data.username;
      }

      loadProfileData();
    } else {
      isLoggedIn = false; // ❗ Taip pat – jei ne
      document.querySelector(".top-heart")?.classList.add("d-none");
      document.querySelector(".top-profile")?.classList.add("d-none");
      document.querySelector(".login-btn")?.classList.remove("d-none");
    }
  } catch (err) {
    console.error("Klaida tikrinant sesiją:", err);
  }
})();


// Formų perjungimas be peradresavimo
document.getElementById("switch-to-register")?.addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("login-form")?.classList.remove("active");
  document.getElementById("register-form")?.classList.add("active");
});

document.getElementById("switch-to-login")?.addEventListener("click", function (e) {
  e.preventDefault();
  document.getElementById("register-form")?.classList.remove("active");
  document.getElementById("login-form")?.classList.add("active");
});

// Prisijungimo parodymas paspaudus mygtuką viršuje
document.querySelector(".login-btn")?.addEventListener("click", () => {
  showSection("prisijungti");
  document.getElementById("login-form")?.classList.add("active");
  document.getElementById("register-form")?.classList.remove("active");
});

// Registracijos slaptažodžio validacija
document.getElementById("register-form")?.addEventListener("submit", function (e) {
  const pass = document.getElementById("register-password").value;
  const confirm = document.getElementById("register-confirm").value;

  const regex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;

  if (!regex.test(pass)) {
    alert("❗ Slaptažodyje turi būti bent 8 simboliai, viena didžioji, viena mažoji raidė ir skaičius.");
    e.preventDefault();
    return;
  }

  if (pass !== confirm) {
    alert("❗ Slaptažodžiai nesutampa.");
    e.preventDefault();
  }
});


// Slaptažodžio parodymas/paslėpimas
document.querySelectorAll(".toggle-password").forEach(span => {
  span.addEventListener("click", (e) => {
    e.preventDefault();
    const targetId = span.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (input) {
      input.type = input.type === "password" ? "text" : "password";
    }
  });
});

document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value.trim();

  if (!email || !password) {
    alert("Prašome užpildyti el. paštą ir slaptažodį.");
    return;
  }

  const formData = new FormData();
  formData.append("email", email);
  formData.append("password", password);

  try {
    const res = await fetch("login.php", {
      method: "POST",
      body: formData
    });

    const responseText = await res.text(); // paimame tekstinį atsakymą
    console.log("✅ Atsakymas iš serverio (tekstas):", responseText);

    let data;
    try {
      data = JSON.parse(responseText); // bandome konvertuoti į JSON
    } catch (err) {
      console.error("❌ Klaida skaitant JSON:", err);
      alert("Serverio atsakymas nėra tinkamas JSON. Patikrink login.php.");
      return;
    }

    if (data.success) {
      console.log("✅ Prisijungimas pavyko:", data);

      document.querySelector(".top-heart")?.classList.remove("d-none");
      document.querySelector(".top-profile")?.classList.remove("d-none");
      document.querySelector(".login-btn")?.classList.add("d-none");

      const profileNameEl = document.getElementById("profile-name");
      if (profileNameEl) {
        profileNameEl.innerText = data.username;
      }

      showSection("home");
      const homeKategorijos = document.getElementById("home-kategorijos");
      if (homeKategorijos) {
      homeKategorijos.style.display = "block";
}


    } else {
      console.warn("⚠️ Serverio atsakymas:", data);
      alert(data.message || "Prisijungimo klaida");
    }

  } catch (err) {
    console.error("❌ Klaida prisijungimo metu:", err);
    alert("Įvyko klaida jungiantis prie serverio.");
  }
});



// Atsijungimo funkcija
document.getElementById("logout")?.addEventListener("click", async () => {
  await fetch("logout.php");

  document.querySelector(".top-heart")?.classList.add("d-none");
  document.querySelector(".top-profile")?.classList.add("d-none");
  document.querySelector(".login-btn")?.classList.remove("d-none");

  showSection("home");
  const homeKategorijos = document.getElementById("home-kategorijos");
  if (homeKategorijos) {
  homeKategorijos.style.display = "block";
}


});


document.querySelector(".top-heart")?.addEventListener("click", () => {
  showSection("megstamiausi");

  console.log("Paspaudėte širdelę, atvaizduojame mėgstamiausius:");

  // Atvaizduojame mėgstamiausius
  updateFavorites();  // Iškviečiame funkciją, kuri atnaujina mėgstamiausių sąrašą
});

document.querySelector(".top-profile")?.addEventListener("click", () => {
  showSection("profilis"); // atidaro profilio sekciją
  loadProfileData();       // iš naujo užkrauna duomenis iš serverio
});


async function updateFavorites() {
  const favoritesList = document.getElementById("favorites-list");
  const noMsg = document.getElementById("no-favorites-msg");

  favoritesList.innerHTML = "";

  try {
    const res = await fetch("get_favorites.php");
    const data = await res.json();

    if (data.success && data.recipes.length > 0) {
      data.recipes.forEach(recipe => {
        const imgSrc = recipe.img.startsWith("http") ? recipe.img : "https://itech024.vaidila.vdu.lt/" + recipe.img;

        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
          <img src="${imgSrc}" alt="${recipe.title}">
          <p><strong>${recipe.title}</strong><br><small>${recipe.description}</small></p>
          <button class="view-recipe-btn" data-title="${recipe.title}">Peržiūrėti receptą</button>
        `;
        favoritesList.appendChild(card);
      });
      noMsg.style.display = "none";
    } else {
      noMsg.style.display = "block";
    }
  } catch (err) {
    console.error("❌ Klaida gaunant mėgstamiausius:", err);
    noMsg.style.display = "block";
  }
}


// Dinaminis recepto atvaizdavimas
document.addEventListener("click", async function (e) {
  if (e.target.classList.contains("view-recipe-btn")) {
    const title = e.target.getAttribute("data-title");
    //console.log(" Paspaustas recepto mygtukas su title:", title);

    if (recipes.length === 0) {
      try {
        const res = await fetch("get_recipes.php");
        const data = await res.json();
        if (data.success) {
          recipes = data.recipes;
          //console.log(" Gauti receptai iš serverio:", recipes);
        }
      } catch (err) {
        alert("Nepavyko gauti receptų.");
        return;
      }
    }

    const recipe = recipes.find(r => r.title.trim().toLowerCase() === title.trim().toLowerCase());
    //console.log(" Rastas receptas:", recipe);

    if (!recipe) {
      alert(" Receptas nerastas!");
      return;
    }

    loadComments(recipe.id);

    // UŽPILDOM DUOMENIS
    document.getElementById("receptas-pavadinimas").innerText = recipe.title;
    document.getElementById("receptas-aprasymas").innerText = recipe.description;
    document.getElementById("receptas-porcijos").innerText = recipe.portions || "-";
    document.getElementById("receptas-laikas").innerText = recipe.time || "-";
    document.getElementById("receptas-author").innerText = `Publikavo: ${recipe.author || "Greta"}`;
    document.getElementById("receptas-date").innerText = `Data: ${recipe.date || "2025-04-11"}`;
    document.getElementById("receptas-likes").innerText = recipe.likes || "0";
    document.getElementById("receptas-comments").innerText = recipe.comments || "0";

    const ingredientList = document.getElementById("receptas-ingredientai");
    ingredientList.innerHTML = "";
    (recipe.ingredients || []).forEach(i => {
      const li = document.createElement("li");
      li.textContent = i;
      ingredientList.appendChild(li);
    });

document.getElementById("receptas-instrukcijos").innerText = recipe.instructions?.join('\n') || "";

    
    
    document.getElementById("receptas-patarimai").innerText = (recipe.tips && recipe.tips.trim()) ? recipe.tips : "-";

    // Karuselė
    const carousel = document.querySelector(".carousel-track");
    carousel.innerHTML = "";
    const images = recipe.photos || [recipe.img];
    images.forEach(src => {
      const img = document.createElement("img");
      img.src = src;
      carousel.appendChild(img);
    });

    let index = 0;
    const updateCarousel = () => {
      const width = carousel.offsetWidth;
      carousel.style.transform = `translateX(-${index * width}px)`;
    };

    document.querySelector(".carousel-btn.prev").onclick = () => {
      if (index > 0) {
        index--;
        updateCarousel();
      }
    };

    document.querySelector(".carousel-btn.next").onclick = () => {
      if (index < images.length - 1) {
        index++;
        updateCarousel();
      }
    };

    // Rodyti puslapį
    showSection("receptas");
    window.scrollTo(0, 0);
  }
});

document.getElementById("newsletter-form")?.addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("newsletter-email").value.trim();

  const formData = new FormData();
  formData.append("email", email);

  try {
    const res = await fetch("subscribe.php", {
      method: "POST",
      body: formData
    });

    const data = await res.json();

    if (data.success) {
      const successMessage = document.getElementById("success-message");
      successMessage.style.display = "block";
      this.reset();

      setTimeout(() => {
        successMessage.style.display = "none";
      }, 6000);
    } else {
      alert("⚠️ " + data.message);
    }
  } catch (err) {
    alert("❌ Klaida jungiantis prie serverio: " + err.message);
  }
});


function loadProfileData() {
  fetch("profile.php")
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("profile-name").textContent = data.username;
      document.getElementById("profile-email").textContent = data.email;
      document.getElementById("profile-favorites").textContent = data.favorites;
      document.getElementById("profile-uploads").textContent = data.uploads;

      const container = document.getElementById("profile-recipes");
      container.innerHTML = "";

      if (data.recipes.length === 0) {
        container.innerHTML = "<p>Jūs dar nepateikėte receptų.</p>";
        return; // sustabdyti tolimesnį vykdymą
      }

      data.recipes.forEach((recipe) => {
        const imgSrc = recipe.img.startsWith("http") ? recipe.img : "https://itech024.vaidila.vdu.lt/" + recipe.img;
      
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
          <img src="${imgSrc}" alt="${recipe.title}">
          <p><strong>${recipe.title}</strong><br><small>${recipe.description}</small></p>
          <button class="view-recipe-btn" data-title="${recipe.title}">Peržiūrėti receptą</button>
        `;
        container.appendChild(card);
      });      
    })
    .catch((err) => console.error("❗ Klaida įkeliant profilį:", err));
}

// Komentarų įkėlimas pagal recepto ID
async function loadComments(recipe_id) {
  const list = document.getElementById("comments-list");
  if (!list) return;
  list.innerHTML = "⏳ Įkeliama...";

  try {
    const sessionRes = await fetch("session_check.php");
    const sessionData = await sessionRes.json();
    const currentUserId = sessionData.loggedIn ? sessionData.user_id : null;

    const res = await fetch(`get_comments.php?recipe_id=${recipe_id}`);
    const data = await res.json();

    if (data.success && data.comments.length > 0) {
      list.innerHTML = "";
      data.comments.forEach(c => {
        const div = document.createElement("div");
        div.className = "single-comment";
        div.innerHTML = `
          <strong>${c.username}</strong> <small>(${c.created_at})</small>
          ${currentUserId && currentUserId === c.user_id ? 
            `<button class="delete-comment" data-id="${c.id}">🗑️</button>` : ""}
          <br><p>${c.content}</p><hr>
        `;
        list.appendChild(div);
      });

      // Pridedam įvykį trynimui
      document.querySelectorAll(".delete-comment").forEach(btn => {
        btn.addEventListener("click", async () => {
          const id = btn.getAttribute("data-id");
          if (confirm("Ar tikrai norite ištrinti šį komentarą?")) {
            await deleteComment(id, recipe_id);
          }
        });
      });

    } else {
      list.innerHTML = "<p>Komentarų kol kas nėra.</p>";
    }
  } catch (err) {
    console.error("❌ Klaida kraunant komentarus:", err);
    list.innerHTML = "<p>⚠️ Klaida kraunant komentarus.</p>";
  }
}

// Komentaro siuntimo funkcija
async function submitComment(recipe_id) {
  const content = document.getElementById("comment-content")?.value.trim();
  const msg = document.getElementById("comment-message");

  if (!content) {
    alert("❗ Prašome įvesti komentarą.");
    return;
  }

  const formData = new FormData();
  formData.append("recipe_id", recipe_id);
  formData.append("content", content);

  try {
    const res = await fetch("submit_comment.php", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.success) {
      msg.textContent = "✅ Komentaras išsiųstas!";
      msg.style.display = "block";
      document.getElementById("comment-content").value = "";

      // 1. Atnaujinti komentarų sąrašą
      await loadComments(recipe_id);

      // 2. Parsisiųsti atnaujintą receptų sąrašą
      await fetchRecipesFromDB();

      // 3. Atnaujinti DOM'e komentarų skaičių
      const updated = recipes.find(r => r.id === recipe_id);
      const komentaraiElem = document.getElementById("receptas-comments");
      if (updated && komentaraiElem) {
        komentaraiElem.innerText = updated.comments;
      }

      // 4. Pranešimas išnyksta po kelių sekundžių
      setTimeout(() => {
        msg.style.display = "none";
      }, 4000);
    } else {
      alert(data.message || "⚠️ Nepavyko įrašyti komentaro.");
    }
  } catch (err) {
    console.error("❌ Klaida siunčiant komentarą:", err);
    alert("Įvyko klaida jungiantis prie serverio.");
  }
}

// Mygtuko paspaudimo įvykis
document.getElementById("submit-comment")?.addEventListener("click", () => {
  const title = document.getElementById("receptas-pavadinimas")?.innerText.trim();
  const recipe = recipes.find(r => r.title.trim().toLowerCase() === title.toLowerCase());
  if (recipe && recipe.id) {
    submitComment(recipe.id);
  } else {
    alert("⚠️ Nepavyko rasti recepto ID.");
  }
});

async function deleteComment(commentId, recipeId) {
  const formData = new FormData();
  formData.append("comment_id", commentId);

  try {
    const res = await fetch("delete_comment.php", {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.success) {
      alert("✅ Komentaras ištrintas.");
      await loadComments(recipeId);
      await fetchRecipesFromDB();

      const recipe = recipes.find(r => r.id === recipeId);
      if (recipe) {
        document.getElementById("receptas-comments").innerText = recipe.comments;
      }
    } else {
      alert(data.message || "❗ Klaida trinant komentarą.");
    }
  } catch (err) {
    console.error("❌ Klaida trinant komentarą:", err);
    alert("Nepavyko prisijungti prie serverio.");
  }
}

fetch('social_links.json')
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("social-links");
    if (!container) return;

    data.links.forEach(link => {
      const a = document.createElement("a");
      a.href = link.url;
      a.target = "_blank";
      a.innerHTML = `<img src="${link.icon}" alt="${link.name}">`;
      container.appendChild(a);
    });
  })
  .catch(err => console.error("❌ Klaida įkeliant socialinius linkus:", err));

})
