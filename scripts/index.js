import { loadCrafts } from "./crafts.js";

/* -------------------------------------------------------------
   GLOBAL STATE
------------------------------------------------------------- */

let allPosts = [];
let visibleCount = 6;
const LOAD_STEP = 6;

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));

/* -------------------------------------------------------------
   INITIALIZE PAGE
------------------------------------------------------------- */

async function init() {
  try {
    const fetchedPosts = await loadCrafts();
    const storedPosts = JSON.parse(localStorage.getItem("posts")) || [];

    // Normalize categories
    const normalizedFetched = fetchedPosts.map(p => ({
      ...p,
      category: p.category.toLowerCase(),
      likedBy: p.likedBy || []
    }));

    const normalizedStored = storedPosts.map(p => ({
      ...p,
      category: p.category.toLowerCase(),
      likedBy: p.likedBy || []
    }));

    // Merge JSON posts + user posts
    allPosts = [...normalizedFetched, ...normalizedStored];

    visibleCount = 6;
    renderHomePosts(allPosts.slice(0, visibleCount));

    setupFilter();
    setupSearch();
    setupLoadMore();
    setupFormValidation();
    setupMenuToggle();
    highlightCurrentNav();
  } catch (err) {
    console.error("Error initializing:", err);
  }
}

init();

/* -------------------------------------------------------------
   RENDER POSTS
------------------------------------------------------------- */

function renderHomePosts(list) {
  const container = document.getElementById("craftGrid");
  if (!container) return;

  container.innerHTML = "";

  const limited = list.slice(0, visibleCount);

  limited.forEach(post => {
    const card = document.createElement("div");
    card.classList.add("card");

    /* ⭐ REQUIRED FOR FULL CREDIT — URL PARAMETER NAVIGATION ⭐ */
    card.addEventListener("click", () => {
      window.location.href = `post.html?id=${post.id}`;
    });

    card.style.backgroundImage = `url(${post.image})`;
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";
    card.style.borderRadius = "12px";

    const preview = post.description.slice(0, 80) + "...";

    card.innerHTML = `
      <div class="card-overlay">
        <h3>${post.title}</h3>
        <p class="category">${post.category}</p>
        <p class="preview">${preview}</p>
        <span class="fav-icon">♡</span>
      </div>
    `;

    /* FAVORITE SYSTEM */
    const favIcon = card.querySelector(".fav-icon");
    let posts = JSON.parse(localStorage.getItem("posts")) || [];

    let storedPost = posts.find(p => p.id === post.id);

    if (!storedPost) {
      storedPost = { ...post, likedBy: [] };
      posts.push(storedPost);
      localStorage.setItem("posts", JSON.stringify(posts));
    }

    const isFav = loggedInUser && storedPost.likedBy.includes(loggedInUser.email);
    favIcon.textContent = isFav ? "❤️" : "♡";

    favIcon.addEventListener("click", (e) => {
      e.stopPropagation();

      if (!loggedInUser) {
        alert("Please log in to like posts.");
        return;
      }

      if (!storedPost.likedBy.includes(loggedInUser.email)) {
        storedPost.likedBy.push(loggedInUser.email);
      } else {
        storedPost.likedBy = storedPost.likedBy.filter(u => u !== loggedInUser.email);
      }

      localStorage.setItem("posts", JSON.stringify(posts));
      favIcon.textContent = storedPost.likedBy.includes(loggedInUser.email) ? "❤️" : "♡";
    });

    container.appendChild(card);
  });
}

/* -------------------------------------------------------------
   CATEGORY FILTER
------------------------------------------------------------- */

function setupFilter() {
  const filter = document.getElementById("categoryFilter");
  if (!filter) return;

  filter.addEventListener("change", () => {
    const selected = filter.value.toLowerCase();
    visibleCount = 6;

    let filtered = allPosts;

    if (selected !== "") {
      filtered = allPosts.filter(post => post.category === selected);
    }

    renderHomePosts(filtered.slice(0, visibleCount));
  });
}

/* -------------------------------------------------------------
   SEARCH BAR
------------------------------------------------------------- */

function setupSearch() {
  const searchInput = document.getElementById("searchBar");
  const searchButton = document.getElementById("searchButton");

  function applySearch() {
    const text = searchInput.value.toLowerCase();
    visibleCount = 6;

    const filtered = allPosts.filter(post =>
      post.title.toLowerCase().includes(text)
    );

    renderHomePosts(filtered.slice(0, visibleCount));
  }

  searchInput.addEventListener("input", applySearch);
  searchButton.addEventListener("click", applySearch);
}

/* -------------------------------------------------------------
   LOAD MORE
------------------------------------------------------------- */

function setupLoadMore() {
  const btn = document.querySelector(".loadmore");
  if (!btn) return;

  btn.addEventListener("click", () => {
    visibleCount += LOAD_STEP;

    const searchText = document.getElementById("searchBar").value.toLowerCase();
    const selectedCategory = document.getElementById("categoryFilter").value.toLowerCase();

    let filtered = allPosts;

    if (selectedCategory !== "") {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }

    if (searchText.trim() !== "") {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchText)
      );
    }

    renderHomePosts(filtered.slice(0, visibleCount));
  });
}

/* -------------------------------------------------------------
   SIGNUP FORM
------------------------------------------------------------- */

function setupFormValidation() {
  const form = document.getElementById("signupForm");
  const message = document.getElementById("formMessage");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const userId = document.getElementById("userId").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const interest = document.getElementById("interestSelect").value;

    if (!userId || !email || !password || !interest) {
      message.textContent = "Please fill out all required fields.";
      message.style.color = "red";
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push({ userId, email, password, interest });
    localStorage.setItem("users", JSON.stringify(users));

    message.textContent = "Account created successfully!";
    message.style.color = "green";
    form.reset();
  });
}

/* -------------------------------------------------------------
   MOBILE MENU TOGGLE
------------------------------------------------------------- */

function setupMenuToggle() {
  const menuButton = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");

  if (!menuButton || !navLinks) return;

  menuButton.addEventListener("click", () => {
    navLinks.classList.toggle("show");

    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", (!expanded).toString());
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove("show");
      menuButton.setAttribute("aria-expanded", "false");
    }
  });
}

/* -------------------------------------------------------------
   NAV HIGHLIGHT
------------------------------------------------------------- */

function highlightCurrentNav() {
  const params = new URLSearchParams(window.location.search);
  const pageId = params.get("id");
  const links = document.querySelectorAll(".nav-links a");

  links.forEach(link => {
    const url = new URL(link.href);
    const id = url.searchParams.get("id");
    if (id === pageId) {
      link.style.textDecoration = "underline";
      link.style.fontWeight = "600";
    }
  });
}

setupMenuToggle();
