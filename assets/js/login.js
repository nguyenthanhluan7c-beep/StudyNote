// ===============================
// LOGIN.JS
// Đăng nhập / đăng ký giả lập bằng MockAPI
// ===============================

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  setupLoginEvents();
});

// ===============================
// 1. GẮN SỰ KIỆN
// ===============================
function setupLoginEvents() {
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (backToTop) {
    backToTop.addEventListener("click", scrollToTop);
  }

  window.addEventListener("scroll", handleBackToTopButton);

  document.getElementById("loginTab").addEventListener("click", showLoginForm);
  document
    .getElementById("registerTab")
    .addEventListener("click", showRegisterForm);
  document
    .getElementById("goRegisterBtn")
    .addEventListener("click", showRegisterForm);
  document
    .getElementById("goLoginBtn")
    .addEventListener("click", showLoginForm);

  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document
    .getElementById("registerForm")
    .addEventListener("submit", handleRegister);

  $(".password-toggle").on("click", function () {
    const inputId = $(this).data("target");
    togglePassword(inputId, this);
  });
}

// ===============================
// 2. CHUYỂN TAB
// ===============================
function showLoginForm() {
  document.getElementById("loginTab").classList.add("active");
  document.getElementById("registerTab").classList.remove("active");

  document.getElementById("loginForm").classList.remove("d-none");
  document.getElementById("registerForm").classList.add("d-none");

  clearAllErrors();
}

function showRegisterForm() {
  document.getElementById("registerTab").classList.add("active");
  document.getElementById("loginTab").classList.remove("active");

  document.getElementById("registerForm").classList.remove("d-none");
  document.getElementById("loginForm").classList.add("d-none");

  clearAllErrors();
}

// ===============================
// 3. ĐĂNG NHẬP
// ===============================
async function handleLogin(event) {
  event.preventDefault();

  if (!validateLoginForm()) {
    showToast("Vui lòng kiểm tra lại thông tin đăng nhập.", "error");
    return;
  }

  const email = getInputValue("loginEmail");
  const password = getInputValue("loginPassword");

  try {
    setButtonLoading("loginBtn", true, "Đang đăng nhập...");

    const allUsers = await apiGet(CONFIG.api.users);

    const users = allUsers.filter(function (user) {
      return String(user.email || "").toLowerCase() === email.toLowerCase();
    });

    if (users.length === 0) {
      showInputError("loginEmail", "Email chưa được đăng ký.");
      showToast("Không tìm thấy tài khoản.", "error");
      return;
    }

    const user = users[0];

    if (user.password !== password) {
      showInputError("loginPassword", "Mật khẩu không đúng.");
      showToast("Mật khẩu không chính xác.", "error");
      return;
    }

    saveCurrentUser(user);

    showToast("Đăng nhập thành công!", "success");

    setTimeout(function () {
      window.location.href = "./index.html";
    }, 800);
  } catch (error) {
    console.error(error);
    showToast("Không thể đăng nhập. Kiểm tra MockAPI nhé.", "error");
  } finally {
    setButtonLoading("loginBtn", false, "Đăng nhập", "bi-box-arrow-in-right");
  }
}

// ===============================
// 4. ĐĂNG KÝ
// ===============================
async function handleRegister(event) {
  event.preventDefault();

  if (!validateRegisterForm()) {
    showToast("Vui lòng kiểm tra lại thông tin đăng ký.", "error");
    return;
  }

  const fullName = getInputValue("registerFullName");
  const displayName = getInputValue("registerDisplayName");
  const email = getInputValue("registerEmail");
  const password = getInputValue("registerPassword");
  const avatarInput = getInputValue("registerAvatar");

  try {
    setButtonLoading("registerBtn", true, "Đang tạo tài khoản...");

    const allUsers = await apiGet(CONFIG.api.users);

    const existedUsers = allUsers.filter(function (user) {
      return String(user.email || "").toLowerCase() === email.toLowerCase();
    });

    if (existedUsers.length > 0) {
      showInputError("registerEmail", "Email này đã được đăng ký.");
      showToast("Email đã tồn tại.", "error");
      return;
    }

    const newUser = {
      fullName: fullName,
      displayName: displayName,
      email: email,
      password: password,
      avatar:
        avatarInput ||
        `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(displayName)}`,
      role: "student",
      createdAt: new Date().toISOString(),
    };

    const createdUser = await apiPost(CONFIG.api.users, newUser);

    saveCurrentUser(createdUser);

    showToast("Đăng ký thành công!", "success");

    setTimeout(function () {
      window.location.href = "./index.html";
    }, 900);
  } catch (error) {
    console.error(error);
    showToast("Không thể đăng ký. Kiểm tra MockAPI nhé.", "error");
  } finally {
    setButtonLoading("registerBtn", false, "Tạo tài khoản", "bi-person-plus");
  }
}

// ===============================
// 5. VALIDATE LOGIN
// ===============================
function validateLoginForm() {
  let isValid = true;

  clearAllErrors();

  const email = getInputValue("loginEmail");
  const password = getInputValue("loginPassword");

  if (!isValidEmail(email)) {
    showInputError("loginEmail", "Email không hợp lệ.");
    isValid = false;
  } else {
    showInputSuccess("loginEmail");
  }

  if (password.length < 6) {
    showInputError("loginPassword", "Mật khẩu phải có ít nhất 6 ký tự.");
    isValid = false;
  } else {
    showInputSuccess("loginPassword");
  }

  return isValid;
}

// ===============================
// 6. VALIDATE REGISTER
// ===============================
function validateRegisterForm() {
  let isValid = true;

  clearAllErrors();

  const fullName = getInputValue("registerFullName");
  const displayName = getInputValue("registerDisplayName");
  const email = getInputValue("registerEmail");
  const avatar = getInputValue("registerAvatar");
  const password = getInputValue("registerPassword");
  const confirmPassword = getInputValue("registerConfirmPassword");

  if (fullName.length < 2) {
    showInputError("registerFullName", "Họ tên phải có ít nhất 2 ký tự.");
    isValid = false;
  } else {
    showInputSuccess("registerFullName");
  }

  if (displayName.length < 2) {
    showInputError(
      "registerDisplayName",
      "Tên hiển thị phải có ít nhất 2 ký tự.",
    );
    isValid = false;
  } else {
    showInputSuccess("registerDisplayName");
  }

  if (!isValidEmail(email)) {
    showInputError("registerEmail", "Email không hợp lệ.");
    isValid = false;
  } else {
    showInputSuccess("registerEmail");
  }

  if (avatar !== "" && !isValidUrl(avatar)) {
    showInputError(
      "registerAvatar",
      "Link avatar phải bắt đầu bằng http hoặc https.",
    );
    isValid = false;
  } else {
    showInputSuccess("registerAvatar");
  }

  if (password.length < 6) {
    showInputError("registerPassword", "Mật khẩu phải có ít nhất 6 ký tự.");
    isValid = false;
  } else {
    showInputSuccess("registerPassword");
  }

  if (confirmPassword !== password) {
    showInputError("registerConfirmPassword", "Mật khẩu nhập lại không khớp.");
    isValid = false;
  } else {
    showInputSuccess("registerConfirmPassword");
  }

  return isValid;
}

// ===============================
// 7. LƯU USER VÀO LOCALSTORAGE
// ===============================
function saveCurrentUser(user) {
  const currentUser = {
    id: user.id,
    fullName: user.fullName,
    displayName: user.displayName || user.fullName,
    email: user.email,
    avatar: user.avatar,
    role: user.role || "student",
  };

  localStorage.setItem("studyhub-current-user", JSON.stringify(currentUser));
}
// ===============================
// 8. TOAST
// ===============================
function showToast(message, type = "info") {
  const toastElement = document.getElementById("appToast");
  const toastMessage = document.getElementById("toastMessage");
  const toastIcon = document.getElementById("toastIcon");

  toastMessage.textContent = message;

  if (type === "success") {
    toastIcon.className = "bi bi-check-circle-fill me-2 text-success";
  } else if (type === "error") {
    toastIcon.className = "bi bi-x-circle-fill me-2 text-danger";
  } else {
    toastIcon.className = "bi bi-bell-fill me-2 text-primary";
  }

  const toast = new bootstrap.Toast(toastElement);
  toast.show();
}

// ===============================
// 9. HÀM PHỤ TRỢ
// ===============================
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidUrl(url) {
  return url.startsWith("http://") || url.startsWith("https://");
}

function showInputError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  input.classList.add("input-error");
  input.classList.remove("input-success");
  error.textContent = message;
}

function showInputSuccess(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  input.classList.remove("input-error");
  input.classList.add("input-success");
  error.textContent = "";
}

function clearAllErrors() {
  const inputs = document.querySelectorAll(".auth-control");
  const errors = document.querySelectorAll(".error-message");

  inputs.forEach(function (input) {
    input.classList.remove("input-error");
    input.classList.remove("input-success");
  });

  errors.forEach(function (error) {
    error.textContent = "";
  });
}

function togglePassword(inputId, button) {
  const input = document.getElementById(inputId);
  const icon = button.querySelector("i");

  if (input.type === "password") {
    input.type = "text";
    icon.className = "bi bi-eye-slash";
  } else {
    input.type = "password";
    icon.className = "bi bi-eye";
  }
}

function setButtonLoading(buttonId, isLoading, loadingText, iconClass) {
  const button = document.getElementById(buttonId);

  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      ${loadingText}
    `;
  } else {
    button.disabled = false;
    button.innerHTML = `
      <i class="bi ${iconClass}"></i>
      ${loadingText}
    `;
  }
}
