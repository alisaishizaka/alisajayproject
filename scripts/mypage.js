/* -------------------------------------------------------------
   GLOBAL STATE
------------------------------------------------------------- */

let loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
let myPostsVisible = 6;
let favVisible = 6;
const LOAD_STEP = 6;

/* -------------------------------------------------------------
   SIDEBAR PAGE SWITCHING
------------------------------------------------------------- */

const tabs = document.querySelectorAll(".tab");
const sections = document.querySelectorAll(".page-section");

tabs.forEach(tab => {
  tab.addEventListener("click", () => {

    tabs.forEach(t => t.classList.remove("active"));
    tab.classList.add("active");

    const target = tab.dataset.page;

    sections.forEach(sec => {
      sec.classList.toggle("active", sec.id === target);
    });

    if (target === "myposts") {
      myPostsVisible = 6;
      initMyPage();
    }

    if (target === "favorite") {
      favVisible = 6;
      loadFavorites();
    }
  });
});

/* -------------------------------------------------------------
   LOGIN POPUP
------------------------------------------------------------- */

const loginModal = document.getElementById("loginModal");
const closeLogin = document.querySelector(".close-login");
const loginBtn = document.getElementById("loginBtn");

if (!loggedInUser) loginModal.style.display = "flex";

closeLogin.addEventListener("click", () => loginModal.style.display = "none");

loginBtn.addEventListener("click", () => {
  const email = loginEmail.value.trim();
  const password = loginPassword.value.trim();

  const users = JSON.parse(localStorage.getItem("users")) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) return alert("Incorrect email or password.");

  localStorage.setItem("loggedInUser", JSON.stringify(user));
  loggedInUser = user;
  loginModal.style.display = "none";

  initMyPage();
});

/* -------------------------------------------------------------
   RENDER MY POSTS
------------------------------------------------------------- */

function renderMyPosts(list) {
  const container = document.getElementById("myposts-container");
  container.innerHTML = "";

  const limited = list.slice(0, myPostsVisible);

  limited.forEach(post => {
    const card = document.createElement("div");
    card.classList.add("post-card");
    card.dataset.id = post.id;

    card.style.backgroundImage = `url(${post.image})`;
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";

    const preview = post.description.slice(0, 80) + "...";
    const isFav = post.likedBy.includes(loggedInUser.email);

    card.innerHTML = `
      <div class="card-overlay">
        <h3>${post.title}</h3>
        <p class="category">${post.category}</p>
        <p class="preview">${preview}</p>

        <span class="fav-icon">${isFav ? "❤️" : "♡"}</span>
        <button class="delete-post-btn" data-id="${post.id}">Delete</button>
      </div>
    `;

    /* FAVORITE TOGGLE */
    card.querySelector(".fav-icon").addEventListener("click", (e) => {
      e.stopPropagation();

      const posts = JSON.parse(localStorage.getItem("posts")) || [];
      const current = posts.find(p => p.id === post.id);

      if (!current.likedBy.includes(loggedInUser.email)) {
        current.likedBy.push(loggedInUser.email);
      } else {
        current.likedBy = current.likedBy.filter(u => u !== loggedInUser.email);
      }

      localStorage.setItem("posts", JSON.stringify(posts));
      renderMyPosts(posts.filter(p => p.user === loggedInUser.email));
    });

    container.appendChild(card);
  });
}

/* -------------------------------------------------------------
   LOAD MORE (MY POSTS)
------------------------------------------------------------- */

document.getElementById("loadMorePosts").addEventListener("click", () => {
  myPostsVisible += LOAD_STEP;
  initMyPage();
});

/* -------------------------------------------------------------
   LOAD FAVORITES
------------------------------------------------------------- */

function loadFavorites() {
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const favs = posts.filter(p => p.likedBy.includes(loggedInUser.email));

  const container = document.getElementById("favorite-container");
  container.innerHTML = "";

  const limited = favs.slice(0, favVisible);

  limited.forEach(post => {
    const card = document.createElement("div");
    card.classList.add("post-card");
    card.dataset.id = post.id;

    card.style.backgroundImage = `url(${post.image})`;
    card.style.backgroundSize = "cover";
    card.style.backgroundPosition = "center";

    const preview = post.description.slice(0, 80) + "...";

    card.innerHTML = `
      <div class="card-overlay">
        <h3>${post.title}</h3>
        <p class="category">${post.category}</p>
        <p class="preview">${preview}</p>
      </div>
    `;

    container.appendChild(card);
  });
}

/* -------------------------------------------------------------
   LOAD MORE (FAVORITES)
------------------------------------------------------------- */

document.getElementById("loadMoreFavorite").addEventListener("click", () => {
  favVisible += LOAD_STEP;
  loadFavorites();
});

/* -------------------------------------------------------------
   INIT — LOAD ONLY USER'S POSTS
------------------------------------------------------------- */

function initMyPage() {
  const storedPosts = JSON.parse(localStorage.getItem("posts")) || [];
  const userPosts = storedPosts.filter(p => p.user === loggedInUser.email);

  renderMyPosts(userPosts);
}

if (loggedInUser) {
  initMyPage();
}

/* -------------------------------------------------------------
   NEW POST POPUP
------------------------------------------------------------- */

const newPostModal = document.getElementById("newPostModal");
const closeNewPost = document.querySelector(".close-newpost");

document.querySelector(".new-post-btn").addEventListener("click", () => {
  newPostModal.style.display = "flex";
});

closeNewPost.addEventListener("click", () => {
  newPostModal.style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target === newPostModal) newPostModal.style.display = "none";
});

/* -------------------------------------------------------------
   SAVE NEW POST
------------------------------------------------------------- */

document.getElementById("savePostBtn").addEventListener("click", () => {
  const titleInput = document.getElementById("postTitle");
  let title = titleInput.value.trim();

  const category = document.getElementById("postCategory").value;
  const description = document.getElementById("postDescription").value.trim();
  const youtube = document.getElementById("postYoutube").value.trim();
  const imageFile = document.getElementById("postImage").files[0];

  if (title.startsWith("<WebsiteContent_")) {
    alert("Please enter a real title.");
    titleInput.value = "";
    return;
  }

  if (!title || !category || !description || !imageFile) {
    alert("Please fill out all required fields.");
    return;
  }

  const reader = new FileReader();

  reader.onload = function () {
    const newPost = {
      id: Date.now(),
      title,
      category,
      description,
      youtube,
      image: reader.result,
      user: loggedInUser.email,
      likedBy: []
    };

    const posts = JSON.parse(localStorage.getItem("posts")) || [];
    posts.push(newPost);
    localStorage.setItem("posts", JSON.stringify(posts));

    alert("Post created!");
    newPostModal.style.display = "none";

    initMyPage();
  };

  reader.readAsDataURL(imageFile);
});

/* -------------------------------------------------------------
   DELETE POST
------------------------------------------------------------- */

document.addEventListener("click", function(e) {
  if (e.target.classList.contains("delete-post-btn")) {
    const postId = Number(e.target.dataset.id);

    const confirmDelete = confirm("Are you sure you want to delete this post?");
    if (confirmDelete) {
      deletePost(postId);
    }
  }
});

function deletePost(id) {
  let posts = JSON.parse(localStorage.getItem("posts")) || [];
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem("posts", JSON.stringify(posts));
  initMyPage();
}

const params = new URLSearchParams(window.location.search);
const pageId = params.get("id");

if (pageId) {
  console.log("Current page ID:", pageId);
}

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

setupMenuToggle();





