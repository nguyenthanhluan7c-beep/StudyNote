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
$("#loginBtn").click(function (){
    setLoading("loginBtn", "loading");
    const inputUsername = $("#loginUsername").val();
    const inputPassword = $("#loginPassword").val();
    let hasUsename = false;
    let userId ;
    if (inputUsername === "") {
        showAlert("Bạn chưa nhập tên đăng nhập kìa", 'error');
        resetBtn("loginBtn", "<i class=fas fa-right-to-bracket></i>Đăng nhập");
        return;
    }
    if (inputPassword.length < 6){
        showAlert("Mật khẩu có vấn đề kìa", "error");
        resetBtn("loginBtn", "<i class=fas fa-right-to-bracket></i>Đăng nhập");
        return;
    }
    for (let i = 1; i < data.length; i++) {
      if (inputUsername === data[i].username) {
        hasUsename = true;
        userId = i;
        break;
      }
    }
    if(!hasUsename){
        showAlert("Tài khoản không tồn tại, xin mời đăng ký!", "error");
        resetBtn("loginBtn", "<i class=fas fa-right-to-bracket></i>Đăng nhập");
        return;
    }
    if(inputPassword !== data[userId].password){
        showAlert("Sai mật khẩu mất rồi !!", "error");
        resetBtn("loginBtn", "<i class=fas fa-right-to-bracket></i>Đăng nhập");
        return;
    }
    if(currentRole !== data[userId].role){
       showAlert(`Bạn đâu phải ${currentRole} đâu`, "error");
       resetBtn("loginBtn", "<i class=fas fa-right-to-bracket></i>Đăng nhập");
       return; 
    }
    hideAlert()
    localStorage.setItem("isLoggedIn", "true")
    localStorage.setItem("userId", userId)
})

// ──────────────────────────────────────
//  REGISTER
// ──────────────────────────────────────
$("#registerBtn").click(async function () {
    
})