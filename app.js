const API_BASE = "https://metalstats.beucismis.org";

document.addEventListener("DOMContentLoaded", () => {
  checkLoginStatus();
  const topForm = document.getElementById("topForm");
  if (topForm) {
    topForm.addEventListener("submit", (e) => {
      e.preventDefault();
      fetchTopOrGrid();
    });
  }
});

function login() {
  window.location.href = `${API_BASE}/login`;
}

function logout() {
  fetch(`${API_BASE}/logout`, { credentials: "include" })
    .then((res) => res.json())
    .then(() => {
      setMessage("Logged out successfully.");
      checkLoginStatus();
      location.reload();
    })
    .catch(() => setMessage("Logout failed.", true));
}

function setMessage(text, isError = false, targetId = "topResults") {
  const target = document.getElementById(targetId);
  if (!target) return;
  target.innerHTML = `<p style="color:${isError ? "red" : "black"};">${text}</p>`;
}

function showLoader(targetId) {
  setMessage("Loading...", false, targetId);
}

function fetchTopOrGrid() {
  const type = document.getElementById("type").value;
  const time_range = document.getElementById("time_range").value;
  const limit = document.getElementById("limit").value;
  const url = `${API_BASE}/top-grid?type=${type}&time_range=${time_range}&limit=${limit}`;

  showLoader("topResults");
  fetchImage(url);
}

function fetchImage(url) {
  fetch(url, { credentials: "include" })
    .then((res) => {
      if (!res.ok) throw new Error("Image could not be retrieved. Please login.");
      return res.blob();
    })
    .then((blob) => displayImage(blob))
    .catch(() => setMessage("Image could not be retrieved.", true));
}

function displayImage(blob) {
  const imgUrl = URL.createObjectURL(blob);

  const container = document.createElement("div");
  const img = document.createElement("img");
  img.src = imgUrl;
  img.style.maxWidth = "100%";
  img.style.marginBottom = "1rem";

  const btnGroup = document.createElement("div");
  btnGroup.appendChild(createButton("Download", () => downloadImage(imgUrl)));
  btnGroup.appendChild(createButton("Copy", () => copyImage(imgUrl)));

  container.appendChild(img);
  container.appendChild(btnGroup);

  const target = document.getElementById("topResults");
  target.innerHTML = "";
  target.appendChild(container);
}

function createButton(text, onClick) {
  const btn = document.createElement("button");
  btn.textContent = text;
  btn.style.marginRight = "5px";
  btn.onclick = onClick;
  return btn;
}

function downloadImage(imgUrl) {
  const link = document.createElement("a");
  link.href = imgUrl;
  link.download = "metalstats.png";
  link.click();
}

async function copyImage(imgUrl) {
  try {
    const response = await fetch(imgUrl);
    const blob = await response.blob();
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob,
      }),
    ]);
    alert("Image copied to clipboard.");
  } catch {
    alert("Failed to copy image.");
  }
}

function checkLoginStatus() {
  fetch(`${API_BASE}/healthcheck`, { credentials: "include" })
    .then((res) => res.json())
    .then(() => setLoginButtons(true))
    .catch(() => setLoginButtons(false));
}

function setLoginButtons(isLoggedIn) {
  const loginBtn = document.getElementById("loginBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  if (!loginBtn || !logoutBtn) return;

  loginBtn.style.display = isLoggedIn ? "none" : "inline-block";
  logoutBtn.style.display = isLoggedIn ? "inline-block" : "none";
}
