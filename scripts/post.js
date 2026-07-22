import { loadCrafts } from "./crafts.js";

async function initPostPage() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  const fetched = await loadCrafts();
  const stored = JSON.parse(localStorage.getItem("posts")) || [];

  const all = [...fetched, ...stored];
  const post = all.find(p => p.id === id);

  if (!post) {
    document.body.innerHTML = "<h2>Post not found.</h2>";
    return;
  }

  document.getElementById("postImage").src = post.image;
  document.getElementById("postTitle").textContent = post.title;
  document.getElementById("postCategory").textContent = post.category;
  document.getElementById("postDescription").textContent = post.description;

  const yt = document.getElementById("postYoutube");
  if (post.youtube) {
    yt.textContent = "Watch Tutorial";
    yt.href = post.youtube;
  } else {
    yt.style.display = "none";
  }
}

initPostPage();
