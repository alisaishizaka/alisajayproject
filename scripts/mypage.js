// scripts/mypage.js

/* -------------------------------------------------------------
   GLOBAL STATE
------------------------------------------------------------- */

let loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
let myPostsVisible = 6;
let favVisible = 6;
const LOAD_STEP = 6;

/* -------------------------------------------------------------
   SIDEBAR PAGE SWITCHING
------------------------------------------------------------- */

const tabs = document.querySelectorAll('.tab');
const sections = document.querySelectorAll('.page-section');

tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');

    const target = tab.dataset.page;

    sections.forEach(sec => {
      sec.classList.toggle('active', sec.id === target);
    });

    if (target === 'myposts') {
      myPostsVisible = 6;
      if (loggedInUser) initMyPage();
    }

    if (target === 'favorite') {
      favVisible = 6;
      if (loggedInUser) loadFavorites();
    }
  });
});

/* -------------------------------------------------------------
   LOGIN POPUP
------------------------------------------------------------- */

const loginModal = document.getElementById('loginModal');
const closeLogin = document.querySelector('.close-login');
const loginBtn = document.getElementById('loginBtn');
const loginEmail = document.getElementById('loginEmail');
const loginPassword = document.getElementById('loginPassword');

if (!loggedInUser && loginModal) {
  loginModal.style.display = 'flex';
}

if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    const email = loginEmail.value.trim();
    const password = loginPassword.value.trim();

    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      alert('Incorrect email or password.');
      return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    loggedInUser = user;
    loginModal.style.display = 'none';

    initMyPage();
    loadFavorites();
  });
}

/* -------------------------------------------------------------
   RENDER MY POSTS
------------------------------------------------------------- */

function renderMyPosts(list) {
  const container = document.getElementById('myposts-container');
  if (!container) return;

  container.innerHTML = '';

  const limited = list.slice(0, myPostsVisible);

  limited.forEach(post => {
    const card = document.createElement('div');
    card.classList.add('post-card');
    card.dataset.id = post.id;

    card.style.backgroundImage = `url(${post.image})`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';

    const preview = post.description.slice(0, 80) + '...';
    const isFav = post.likedBy.includes(loggedInUser.email);

    card.innerHTML = `
      <div class="card-overlay">
        <h3>${post.title}</h3>
        <p class="category">${post.category}</p>
        <p class="preview">${preview}</p>

        <span class="fav-icon">${isFav ? '❤️' : '♡'}</span>
        <button class="delete-post-btn" data-id="${post.id}">Delete</button>
      </div>
    `;

    const favIcon = card.querySelector('.fav-icon');

    favIcon.addEventListener('click', e => {
      e.stopPropagation();

      const posts = JSON.parse(localStorage.getItem('posts')) || [];
      const current = posts.find(p => p.id === post.id);

      if (!current) return;

      if (!current.likedBy.includes(loggedInUser.email)) {
        current.likedBy.push(loggedInUser.email);
      } else {
        current.likedBy = current.likedBy.filter(u => u !== loggedInUser.email);
      }

      localStorage.setItem('posts', JSON.stringify(posts));
      renderMyPosts(posts.filter(p => p.user === loggedInUser.email));
    });

    container.appendChild(card);
  });
}

/* -------------------------------------------------------------
   LOAD MORE (MY POSTS)
------------------------------------------------------------- */

const loadMorePostsBtn = document.getElementById('loadMorePosts');

if (loadMorePostsBtn) {
  loadMorePostsBtn.addEventListener('click', () => {
    myPostsVisible += LOAD_STEP;
    if (loggedInUser) initMyPage();
  });
}

/* -------------------------------------------------------------
   LOAD FAVORITES
------------------------------------------------------------- */

function loadFavorites() {
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const favs = posts.filter(p => p.likedBy.includes(loggedInUser.email));

  const container = document.getElementById('favorite-container');
  if (!container) return;

  container.innerHTML = '';

  const limited = favs.slice(0, favVisible);

  limited.forEach(post => {
    const card = document.createElement('div');
    card.classList.add('post-card');
    card.dataset.id = post.id;

    card.style.backgroundImage = `url(${post.image})`;
    card.style.backgroundSize = 'cover';
    card.style.backgroundPosition = 'center';

    const preview = post.description.slice(0, 80) + '...';

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

const loadMoreFavoriteBtn = document.getElementById('loadMoreFavorite');

if (loadMoreFavoriteBtn) {
  loadMoreFavoriteBtn.addEventListener('click', () => {
    favVisible += LOAD_STEP;
    if (loggedInUser) loadFavorites();
  });
}

/* -------------------------------------------------------------
   INIT — LOAD ONLY USER'S POSTS
------------------------------------------------------------- */

function initMyPage() {
  const storedPosts = JSON.parse(localStorage.getItem('posts')) || [];
  const userPosts = storedPosts.filter(p => p.user === loggedInUser.email);

  renderMyPosts(userPosts);
}

if (loggedInUser) {
  initMyPage();
  loadFavorites();
}

/* -------------------------------------------------------------
   NEW POST POPUP
------------------------------------------------------------- */

const newPostModal = document.getElementById('newPostModal');
const closeNewPost = document.querySelector('.close-newpost');
const newPostBtn = document.querySelector('.new-post-btn');

if (newPostBtn && newPostModal) {
  newPostBtn.addEventListener('click', () => {
    newPostModal.style.display = 'flex';
  });
}

if (closeNewPost && newPostModal) {
  closeNewPost.addEventListener('click', () => {
    newPostModal.style.display = 'none';
  });
}

window.addEventListener('click', e => {
  if (e.target === newPostModal) newPostModal.style.display = 'none';
});

/* -------------------------------------------------------------
   SAVE NEW POST
------------------------------------------------------------- */

const savePostBtn = document.getElementById('savePostBtn');

if (savePostBtn) {
  savePostBtn.addEventListener('click', () => {
    const titleInput = document.getElementById('postTitle');
    let title = titleInput.value.trim();

    const category = document.getElementById('postCategory').value;
    const description = document.getElementById('postDescription').value.trim();
    const youtube = document.getElementById('postYoutube').value.trim();
    const imageFile = document.getElementById('postImage').files[0];

    if (title.startsWith('<WebsiteContent_')) {
      alert('Please enter a real title.');
      titleInput.value = '';
      return;
    }

    if (!title || !category || !description || !imageFile) {
      alert('Please fill out all required fields.');
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

      const posts = JSON.parse(localStorage.getItem('posts')) || [];
      posts.push(newPost);
      localStorage.setItem('posts', JSON.stringify(posts));

      alert('Post created!');
      newPostModal.style.display = 'none';

      initMyPage();
      loadFavorites();
    };

    reader.readAsDataURL(imageFile);
  });
}

/* -------------------------------------------------------------
   DELETE POST
------------------------------------------------------------- */

document.addEventListener('click', e => {
  if (e.target.classList.contains('delete-post-btn')) {
    const postId = Number(e.target.dataset.id);

    const confirmDelete = confirm('Are you sure you want to delete this post?');
    if (confirmDelete) {
      deletePost(postId);
    }
  }
});

function deletePost(id) {
  let posts = JSON.parse(localStorage.getItem('posts')) || [];
  posts = posts.filter(p => p.id !== id);
  localStorage.setItem('posts', JSON.stringify(posts));
  if (loggedInUser) {
    initMyPage();
    loadFavorites();
  }
}

/* -------------------------------------------------------------
   SETTINGS — CHANGE PASSWORD + LOGOUT
------------------------------------------------------------- */

const changePasswordBtn = document.getElementById("changePasswordBtn");
const logoutBtn = document.getElementById("logoutBtn");

// CHANGE PASSWORD
if (changePasswordBtn) {
  changePasswordBtn.addEventListener("click", () => {
    const newPass = prompt("Enter your new password:");

    if (!newPass || newPass.trim() === "") {
      alert("Password cannot be empty.");
      return;
    }

    const users = JSON.parse(localStorage.getItem("users")) || [];
    const user = users.find(u => u.email === loggedInUser.email);

    if (user) {
      user.password = newPass.trim();
      localStorage.setItem("users", JSON.stringify(users));
      alert("Password updated!");
    }
  });
}

// LOGOUT
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    const confirmLogout = confirm("Are you sure you want to log out?");
    if (!confirmLogout) return;

    localStorage.removeItem("loggedInUser");
    alert("Logged out successfully.");
    window.location.href = "index.html";
  });
}

/* -------------------------------------------------------------
   VIEW POST POPUP
------------------------------------------------------------- */

const viewPostModal = document.getElementById('viewPostModal');
const closeViewPost = document.querySelector('.close-viewpost');

const viewImg = document.getElementById('viewPostImage');
const viewTitle = document.getElementById('viewPostTitle');
const viewCategory = document.getElementById('viewPostCategory');
const viewDesc = document.getElementById('viewPostDescription');
const viewYoutube = document.getElementById('viewPostYoutube');
const viewFav = document.getElementById('viewPostFav');

document.addEventListener('click', e => {
  const card = e.target.closest('.post-card');
  if (!card) return;

  const postId = Number(card.dataset.id);
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  // Fill modal
  viewImg.src = post.image;
  viewTitle.textContent = post.title;
  viewCategory.textContent = `Category: ${post.category}`;
  viewDesc.textContent = post.description;

  if (post.youtube) {
    viewYoutube.href = post.youtube;
    viewYoutube.textContent = 'Watch tutorial on YouTube';
    viewYoutube.style.display = 'block';
  } else {
    viewYoutube.style.display = 'none';
  }

  const isFav = post.likedBy.includes(loggedInUser.email);
  viewFav.textContent = isFav ? '❤️' : '♡';

  // Show modal
  viewPostModal.style.display = 'flex';

  // Favorite toggle inside modal
  viewFav.onclick = () => {
    if (!post.likedBy.includes(loggedInUser.email)) {
      post.likedBy.push(loggedInUser.email);
    } else {
      post.likedBy = post.likedBy.filter(u => u !== loggedInUser.email);
    }

    localStorage.setItem('posts', JSON.stringify(posts));
    viewFav.textContent = post.likedBy.includes(loggedInUser.email) ? '❤️' : '♡';

    initMyPage();
    loadFavorites();
  };
});

// Close modal
if (closeViewPost) {
  closeViewPost.addEventListener('click', () => {
    viewPostModal.style.display = 'none';
  });
}

window.addEventListener('click', e => {
  if (e.target === viewPostModal) {
    viewPostModal.style.display = 'none';
  }
});


/* -------------------------------------------------------------
   MOBILE MENU TOGGLE
------------------------------------------------------------- */

function setupMenuToggle() {
  const menuButton = document.querySelector('.menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!menuButton || !navLinks) return;

  menuButton.addEventListener('click', () => {
    navLinks.classList.toggle('show');

    const expanded = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', (!expanded).toString());
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      navLinks.classList.remove('show');
      menuButton.setAttribute('aria-expanded', 'false');
    }
  });
}

setupMenuToggle();
