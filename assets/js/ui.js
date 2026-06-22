// ===============================
// UI.JS
// Chứa các hàm liên quan đến giao diện dùng chung
// ===============================

// Load theme từ localStorage
function loadTheme() {
  const savedTheme = localStorage.getItem(CONFIG.themeKey) || "light";

  document.body.setAttribute("data-theme", savedTheme);
  updateThemeButton(savedTheme);
}

// Đổi sáng / tối
function toggleTheme() {
  const currentTheme = document.body.getAttribute("data-theme");

  const newTheme = currentTheme === "dark" ? "light" : "dark";

  document.body.setAttribute("data-theme", newTheme);
  localStorage.setItem(CONFIG.themeKey, newTheme);

  updateThemeButton(newTheme);
}

// Cập nhật chữ và icon của nút theme
function updateThemeButton(theme) {
  const themeIcon = document.getElementById("themeIcon");
  const themeText = document.getElementById("themeText");

  if (!themeIcon || !themeText) {
    return;
  }

  if (theme === "dark") {
    themeIcon.className = "bi bi-moon-stars-fill";
    themeText.textContent = "Tối";
  } else {
    themeIcon.className = "bi bi-sun-fill";
    themeText.textContent = "Sáng";
  }
}

// Hiện/ẩn nút back to top
function handleBackToTopButton() {
  const backToTop = document.getElementById("backToTop");

  if (!backToTop) {
    return;
  }

  if (window.scrollY > 500) {
    backToTop.style.display = "grid";
  } else {
    backToTop.style.display = "none";
  }
}

// Cuộn lên đầu trang
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}
