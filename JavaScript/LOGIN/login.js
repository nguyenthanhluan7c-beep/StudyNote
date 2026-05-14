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
//  LOGIN
// ──────────────────────────────────────
function handleLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  if (!email) {
    showAlert("Vui lòng nhập email.");
    return;
  }
  if (!isValidEmail(email)) {
    showAlert("Email không hợp lệ.");
    return;
  }
  if (!password) {
    showAlert("Vui lòng nhập mật khẩu.");
    return;
  }
  if (password.length < 3) {
    showAlert("Mật khẩu quá ngắn.");
    return;
  }

  setLoading("loginBtn", true);
  hideAlert();

  // Simulate async login
  setTimeout(() => {
    const users = JSON.parse(localStorage.getItem("studyNoteUsers") || "[]");
    const found = users.find((u) => u.email === email && u.password === password);

    if (found) {
      // Registered user
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          email: found.email,
          name: found.name,
          role: found.role || "user",
        })
      );
      showAlert("Đăng nhập thành công! Đang chuyển trang...", "success");
      setTimeout(() => {
        window.location.href =
          found.role === "admin" ? "admin.html" : "index.html";
      }, 800);
    } else if (currentRole === "admin") {
      // Admin demo
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({ email, name: "Admin", role: "admin" })
      );
      showAlert("Đăng nhập admin thành công!", "success");
      setTimeout(() => {
        window.location.href = "admin.html";
      }, 800);
    } else {
      // User demo — any email/password works
      localStorage.setItem(
        "loggedInUser",
        JSON.stringify({
          email,
          name: email.split("@")[0],
          role: "user",
        })
      );
      showAlert("Đăng nhập thành công!", "success");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 800);
    }
  }, 900);
}

// ──────────────────────────────────────
//  REGISTER
// ──────────────────────────────────────
function handleRegister() {
  const name = document.getElementById("regName").value.trim();
  const email = document.getElementById("regEmail").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;

  if (!name) {
    showAlert("Vui lòng nhập họ và tên.");
    return;
  }
  if (!email) {
    showAlert("Vui lòng nhập email.");
    return;
  }
  if (!isValidEmail(email)) {
    showAlert("Email không hợp lệ.");
    return;
  }
  if (password.length < 6) {
    showAlert("Mật khẩu phải ít nhất 6 ký tự.");
    return;
  }
  if (password !== confirm) {
    showAlert("Mật khẩu xác nhận không khớp.");
    return;
  }

  const users = JSON.parse(localStorage.getItem("studyNoteUsers") || "[]");
  if (users.find((u) => u.email === email)) {
    showAlert("Email này đã được đăng ký.");
    return;
  }

  setLoading("registerBtn", true);
  hideAlert();

  setTimeout(() => {
    users.push({
      name,
      email,
      password,
      role: "user",
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("studyNoteUsers", JSON.stringify(users));
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify({ email, name, role: "user" })
    );
    showAlert("Tạo tài khoản thành công! Đang chuyển trang...", "success");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 800);
  }, 900);
}

// ──────────────────────────────────────
//  UTILS
// ──────────────────────────────────────
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Enter key support
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter") return;
  const loginActive = document.getElementById("loginForm").classList.contains("active");
  if (loginActive) handleLogin();
  else handleRegister();
});

// Auto-redirect if already logged in
const existing = JSON.parse(localStorage.getItem("loggedInUser") || "null");
if (existing) {
  window.location.href =
    existing.role === "admin" ? "admin.html" : "index.html";
}
