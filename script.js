const API_KEY = "756fa0bbf4e144be9b0e4676f7c2765a"; 

const searchBtn = document.getElementById("searchBtn");
const ingredientsInput = document.getElementById("ingredientsInput");
const recipesContainer = document.getElementById("recipesContainer");
const loading = document.getElementById("loading");
const listView = document.getElementById("recipeListView");
const detailView = document.getElementById("recipeDetailView");
const recipeTitle = document.getElementById("recipeTitle");
const recipeImage = document.getElementById("recipeImage");
const recipeServings = document.getElementById("recipeServings");
const recipeTime = document.getElementById("recipeTime");
const recipeIngredients = document.getElementById("recipeIngredients");
const recipeInstructions = document.getElementById("recipeInstructions");
const backBtn = document.getElementById("backBtn");

// Filters 
const cuisineFilter = document.getElementById("cuisineFilter");
const dietFilter = document.getElementById("dietFilter");
const mealFilter = document.getElementById("mealFilter");
let currentRecipes = [];

// Navbar hamburger 
document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("navLinks").classList.toggle("show");
});

// Smooth scroll 
document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const targetId = link.getAttribute("href").substring(1);
    document.getElementById(targetId).scrollIntoView({ behavior: "smooth" });
    document.getElementById("navLinks").classList.remove("show");
  });
});
document.getElementById("startBtn").addEventListener("click", () => {
  document.getElementById("recipeListView").scrollIntoView({ behavior: "smooth" });
});

// Back button 
backBtn.addEventListener("click", () => {
  detailView.style.display = "none";
  listView.style.display = "block";
});

// Search button 
searchBtn.addEventListener("click", () => {
  const ingredients = ingredientsInput.value.trim();
  if (!ingredients) { alert("Please enter some ingredients!"); return; }
  fetchRecipes(ingredients);
});
// Cooking Tips Button 
const tipsBtn = document.getElementById("tipsBtn");

tipsBtn.addEventListener("click", () => {
  document.getElementById("funFactsSection").scrollIntoView({ behavior: "smooth" });
});

// Fetch recipes 
async function fetchRecipes(ingredients) {
  recipesContainer.innerHTML = "";
  loading.classList.remove("hidden");
  try {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=8&apiKey=${API_KEY}`;
    const response = await fetch(url);

    // Check HTTP status
    if (!response.ok) {
      console.error("HTTP error:", response.status, response.statusText);
      recipesContainer.innerHTML = `<p>Error fetching recipes: ${response.status} ${response.statusText}</p>`;
      return;
    }
    const recipes = await response.json();

    if (!recipes || recipes.length === 0) {
      recipesContainer.innerHTML = "<p>No recipes found for your ingredients.</p>";
      return;
    }
    currentRecipes = recipes;
    displayRecipes(recipes);
    populateFilters(recipes);

  } catch (err) {
    console.error("Fetch failed:", err);
    recipesContainer.innerHTML = "<p>Network error or invalid API key.</p>";
  } finally {
    loading.classList.add("hidden");
  }
}
// Display recipes 
async function displayRecipes(recipes) {
  recipesContainer.innerHTML = "";
  const detailedRecipes = [];

  for (const recipe of recipes) {
    let details;
    try {
      const res = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/information?apiKey=${API_KEY}`);
      details = await res.json();
    } catch (err) {
      console.error("Error fetching recipe details:", err);
      continue;
    }

    detailedRecipes.push(details); // store detailed info

    const card = document.createElement("div");
    card.classList.add("recipe");

    const cuisine = (details.cuisines && details.cuisines[0]) || "General";
    const meal = (details.dishTypes && details.dishTypes[0]) || "General";
    const diet = (details.diets || []).join(",");
    const time = details.readyInMinutes || "N/A";

    card.dataset.cuisine = cuisine;
    card.dataset.meal = meal;
    card.dataset.diet = diet;

    const used = (recipe.usedIngredients || []).map(i => i.name).join(", ") || "None";
    const missed = (recipe.missedIngredients || []).map(i => i.name).join(", ") || "None";

    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p><strong>Cuisine:</strong> ${cuisine}</p>
      <p><strong>Meal Type:</strong> ${meal}</p>
      <p><strong>Ingredients you have:</strong> ${used}</p>
      <p><strong>Ingredients missing:</strong> ${missed}</p>
      <p><strong>Time:</strong> ${time} mins</p>
      <button class="viewBtn">View Recipe</button>
    `;

    card.querySelector(".viewBtn").addEventListener("click", () => showDetail(details));

    recipesContainer.appendChild(card);
  }

  currentRecipes = detailedRecipes;
  populateFilters(currentRecipes);
}

function showDetail(recipe) {
  listView.style.display = "none";
  detailView.style.display = "block";
  recipeTitle.textContent = recipe.title;
  recipeImage.src = recipe.image;
  recipeServings.textContent = recipe.servings || "N/A";
  recipeTime.textContent = recipe.readyInMinutes || "N/A";
  recipeIngredients.innerHTML = (recipe.extendedIngredients || []).map(i => `<li>${i.original}</li>`).join("");
  recipeInstructions.innerHTML = recipe.instructions || "Instructions not available.";
}

// Filters 
function populateFilters(recipes) {
  populate(cuisineFilter, recipes.flatMap(r => r.cuisines || []));
  populate(dietFilter, recipes.flatMap(r => r.diets || []));
  populate(mealFilter, recipes.flatMap(r => r.dishTypes || []));
}

function populate(select, values) {
  const unique = [...new Set(values.filter(Boolean))].sort();
  select.innerHTML = `<option value="">All</option>` + unique.map(v => `<option value="${v}">${v}</option>`).join("");
}

[cuisineFilter, dietFilter, mealFilter].forEach(filter => {
  filter.addEventListener("change", () => {
    let filtered = currentRecipes;
    if (cuisineFilter.value) filtered = filtered.filter(r => (r.cuisines || []).includes(cuisineFilter.value));
    if (dietFilter.value) filtered = filtered.filter(r => (r.diets || []).includes(dietFilter.value));
    if (mealFilter.value) filtered = filtered.filter(r => (r.dishTypes || []).includes(mealFilter.value));
    displayRecipes(filtered);
  });
});

// Chef- tips 
const tips = [
    "Add lemon to veggies to keep vitamin C 🍋",
  "Honey soothes cough naturally 🍯",
  "Freeze leftovers to reduce food waste ❄️",
  "Soak rice before cooking for fluffier grains 🍚",
  "Use garlic and ginger to boost immunity 🧄",
  "Add a pinch of salt when boiling pasta 🍝",
  "Stir-fry on high heat to keep veggies crisp 🥦",
  "Use yogurt to tenderize meats 🥛",
  "Store spices in airtight jars to keep them fresh 🌶️",
  "Always taste as you cook 👨‍🍳",
  "Preheat your pan before adding ingredients 🔥",
  "Rest meat after cooking for juicier results 🥩",
  "Zest citrus before juicing for extra flavor 🍊",
  "Use a sharp knife — it's safer and faster 🔪",
  "Save vegetable scraps for homemade stock 🥕",
  "Rinse quinoa before cooking to remove bitterness 🌾",
  "Toast nuts lightly to enhance flavor 🥜",
  "Use salt at different stages for better seasoning 🧂",
  "Chill dough before baking for flakier pastry 🥐",
  "Use a thermometer for perfect meat doneness 🌡️",
  "Add acidity (vinegar/lemon) to brighten dishes 🥗",
  "Caramelize onions slowly for sweeter flavor 🧅",
  "Use fresh herbs at the end for brightness 🌿",
  "Dry herbs last longer than fresh — use accordingly 🌿",
  "Marinate shorter with acidic marinades to avoid mushy meat 🥩",
  "Use a cast iron skillet for excellent searing 🍳",
  "Deglaze the pan to capture all flavors after searing 🍷",
  "Pat meat dry before searing for a better crust ✋",
  "Use room temperature eggs for better baking 🥚",
  "Let batter rest for crispier pancakes 🥞",
  "Use the right oil: smoke point matters for frying 🛢️",
  "Add butter at the end for richer sauces 🧈",
  "Use parchment for easy baking and cleanup 📜",
  "Don’t overcrowd the pan — it steams instead of browns 🍳",
  "Use a microplane for fine zest and garlic grating 🧄",
  "Toast spices to release more aroma 🌶️",
  "Cut ingredients uniformly for even cooking 🔪",
  "Brine poultry for moister results 🐔",
  "Use baking soda sparingly in recipes with acidity ⚗️",
  "Make a roux for thick, velvety sauces 🍲",
  "Use pressure cooker for fast beans and stews ⏱️",
  "Sharp cheddar melts better if grated fresh 🧀",
  "Sear fish skin-side down first for crispy skin 🐟",
  "Add a splash of water when reheating rice to revive it 💧",
  "Use citrus to balance sweet desserts 🍋",
  "Chill gelatin mixtures to set properly ❄️",
  "Sprinkle salt on tomatoes to enhance sweetness 🍅",
  "For fluffier omelettes, add a splash of milk 🥛",
  "Use a thermometer for candy stages (soft, hard) 🍬",
  "Rest bread dough for better gluten development 🍞",
  "Use a metal bowl for cold-whipping cream ❄️",
  "Warm spices release more flavor in hot liquids ☕",
  "Use a mandoline carefully for thin slices 🥒",
  "Rinse mushrooms briefly, don't soak them 🍄",
  "Finish risotto off heat with butter and cheese 🧀",
  "Use residual heat to finish cooking delicate dishes 🔥",
  "Keep oil between 180–190°C for perfect fries 🍟",
  "Use parchment to separate stacked pancakes 🥞",
  "Use a sieve to remove lumps from sauces 🧂",
  "Rest pizza dough for better crust 🍕",
  "Use quality salt — it makes a difference 🧂",
  "Use whole grains for more fiber and texture 🌾",
  "Add umami: soy, miso, anchovy for depth 🧂",
  "Use an ice bath to stop cooking vegetables immediately 🧊",
  "Use neutral oil for dressings and strong oil for flavor 🛢️",
  "Add a touch of sweetness to savory tomato sauces 🍯",
  "Use room temp butter for creaming in cakes 🧁",
  "Use an instant-read thermometer for quick checks 🌡️",
  "Add a bay leaf to stews for subtle aroma 🍃",
  "Use chicken stock instead of water for deeper flavor 🍗",
  "Use a microplane for chocolate shavings 🍫",
  "Parboil root vegetables before roasting for even texture 🥔",
  "Fold gently to keep air in batters like soufflé 🥧",
  "Use citrus zest, not just juice, for bright flavor 🍋",
  "Use corn starch slurry to thicken rather than flour 🌽",
  "Roast garlic for mellow, sweet flavor 🧄",
  "Use cold butter in pastry for pockets of flakiness 🧈",
  "Use a heavy-bottomed pot for even heating 🍲",
  "Blanch and shock greens to keep vibrant color 🥬",
  "Use sugar to balance overly acidic sauces 🍯",
  "Add fresh herbs at the end; dried earlier 🌿",
  "Use salt on eggplant slices to remove bitterness 🍆",
  "Always let meat rest before slicing for juices 🍖",
  "Use a mortar & pestle to release essential oils in herbs 🌿",
  "Add finishing oil (olive) to drizzle for richness 🫒",
  "Use acid to balance fat in dishes (lemon, vinegar) 🍋",
  "Use a scale for consistent baking results ⚖️",
  "Chill cookie dough to control spread 🍪",
  "Use fresh lemon over bottled for brighter flavor 🍋",
  "Use a splatter screen to reduce mess while frying 🍳",
  "Toast breadcrumbs for crunchy toppings 🍞",
  "Use low-and-slow for tenderizing tough cuts 🐄",
  "Replace half the butter with applesauce for lighter cakes 🍎",
  "Use fish sauce sparingly for savory depth 🐟",
  "Finish soups with a swirl of cream for richness 🥣",
  "Use ancho or smoked paprika for smoky depth 🌶️",
  "Use a steeped tea infusion for aromatic liquids ☕",
  "Use a slow cooker for hands-off meals 🍲",
  "Keep knives sharp and store safely for longevity 🔪",
  "Use seasonal produce for best flavor and price 🥕",
  "Label and date leftovers to avoid waste 🗓️"
];

let tipIndex = 0;
const TIP_INTERVAL_MS = 60 * 60 * 1000;
const tipTextEl = document.getElementById("tipText");
const speechBubbleEl = document.getElementById("speechBubble");

// Show tip
function showTip(index) {
  tipTextEl.textContent = tips[index];
  speechBubbleEl.classList.remove("speech-pop");
  void speechBubbleEl.offsetWidth;
  speechBubbleEl.classList.add("speech-pop");
}

// Start rotation
function startTipRotation() {
  showTip(tipIndex);
  setInterval(() => {
    tipIndex = (tipIndex + 1) % tips.length;
    showTip(tipIndex);
  }, TIP_INTERVAL_MS);
}

startTipRotation();
