// ──────────────────────────────────────
//  STATE
// ──────────────────────────────────────
let currentRole = "user"; // 'user' | 'admin'

// ──────────────────────────────────────
//  TAB SWITCH
// ──────────────────────────────────────
function switchTab(tab) {
  document
    .getElementById("loginForm")
    .classList.toggle("active", tab === "login");
  document
    .getElementById("registerForm")
    .classList.toggle("active", tab === "register");
  document
    .getElementById("tabLogin")
    .classList.toggle("active", tab === "login");
  document
    .getElementById("tabRegister")
    .classList.toggle("active", tab === "register");
  hideAlert();
}

// ──────────────────────────────────────
//  ROLE TOGGLE
// ──────────────────────────────────────
function selectRole(role) {
  currentRole = role;
  document
    .getElementById("roleUser")
    .classList.toggle("active", role === "user");
  document
    .getElementById("roleAdmin")
    .classList.toggle("active", role === "admin");
  hideAlert();
}

// ──────────────────────────────────────
//  PASSWORD VISIBILITY
// ──────────────────────────────────────
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  const icon = btn.querySelector("i");
  if (input.type === "password") {
    input.type = "text";
    icon.className = "fas fa-eye-slash";
  } else {
    input.type = "password";
    icon.className = "fas fa-eye";
  }
}

// ──────────────────────────────────────
//  ALERT HELPERS
// ──────────────────────────────────────
function showAlert(msg, type = "error") {
  const box = document.getElementById("alertBox");
  const msgEl = document.getElementById("alertMsg");
  box.className = `alert alert-${type} show`;
  const icon = box.querySelector("i");
  icon.className =
    type === "error" ? "fas fa-circle-exclamation" : "fas fa-circle-check";
  msgEl.textContent = msg;
}
function hideAlert() {
  document.getElementById("alertBox").classList.remove("show");
}

// ──────────────────────────────────────
//  LOADING STATE
// ──────────────────────────────────────
function setLoading(btnId, loading) {
  const btn = document.getElementById(btnId);
  btn.classList.toggle("loading", loading);
  if (loading) {
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  }
}
function resetBtn(btnId, html) {
  const btn = document.getElementById(btnId);
  btn.classList.remove("loading");
  btn.innerHTML = html;
}
// ──────────────────────────────────────
//  API
// ──────────────────────────────────────
var data
document.addEventListener("DOMContentLoaded", async () => {
    const api_url = getApiUrl();
    data = await get(api_url.LOGIN_API_URL);
});
// ──────────────────────────────────────
//  LOGIN
// ──────────────────────────────────────


// ──────────────────────────────────────
//  REGISTER
// ──────────────────────────────────────
