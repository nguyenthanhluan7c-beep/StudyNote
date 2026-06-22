// ===============================
// AUTH.JS
// Xử lý user đăng nhập dùng chung cho mọi trang
// ===============================

const AUTH_KEY = "studyhub-current-user";

// Lấy user đang đăng nhập từ localStorage
function getCurrentUser() {
  const userJSON = localStorage.getItem(AUTH_KEY);

  if (!userJSON) {
    return null;
  }

  try {
    return JSON.parse(userJSON);
  } catch (error) {
    console.error("User trong localStorage bị lỗi:", error);
    localStorage.removeItem(AUTH_KEY);
    return null;
  }
}

// Lưu user đăng nhập
function setCurrentUser(user) {
  localStorage.setItem(AUTH_KEY, JSON.stringify(user));
}

// Xóa user khi đăng xuất
function logoutUser() {
  localStorage.removeItem(AUTH_KEY);
  window.location.href = "./index.html";
}

// Lấy tên hiển thị ưu tiên displayName
function getUserDisplayName(user) {
  return user.displayName || user.fullName || user.email || "Người dùng";
}

// Lấy avatar user
function getUserAvatar(user) {
  if (user.avatar && isValidImageUrl(user.avatar)) {
    return user.avatar;
  }

  const seed = getUserDisplayName(user);

  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

// Check url cơ bản
function isValidImageUrl(url) {
  return (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:image/")
  );
}

// Render navbar theo trạng thái đăng nhập
function renderAuthNavbar() {
  const guestNavItem = document.getElementById("guestNavItem");
  const userNavItem = document.getElementById("userNavItem");
  const navbarUserAvatar = document.getElementById("navbarUserAvatar");
  const navbarUserName = document.getElementById("navbarUserName");
  const logoutBtn = document.getElementById("logoutBtn");

  if (!guestNavItem || !userNavItem) {
    return;
  }

  const user = getCurrentUser();

  if (!user) {
    guestNavItem.classList.remove("d-none");
    userNavItem.classList.add("d-none");
    return;
  }

  guestNavItem.classList.add("d-none");
  userNavItem.classList.remove("d-none");

  navbarUserName.textContent = getUserDisplayName(user);
  navbarUserAvatar.src = getUserAvatar(user);
  renderAdminDropdownLink(user);

  if (logoutBtn) {
    logoutBtn.addEventListener("click", logoutUser);
  }
}
function renderAdminDropdownLink(user) {
  const dropdown = document.querySelector("#userNavItem .user-dropdown");

  if (!dropdown) {
    return;
  }

  const oldAdminLink = document.getElementById("adminDropdownItem");
  const oldAdminDivider = document.getElementById("adminDropdownDivider");

  if (oldAdminLink) {
    oldAdminLink.remove();
  }

  if (oldAdminDivider) {
    oldAdminDivider.remove();
  }

  if (user.role !== "admin") {
    return;
  }

  dropdown.insertAdjacentHTML(
    "afterbegin",
    `
      <li id="adminDropdownItem">
        <a class="dropdown-item" href="./admin.html">
          <i class="bi bi-shield-lock"></i>
          Trang admin
        </a>
      </li>

      <li id="adminDropdownDivider">
        <hr class="dropdown-divider" />
      </li>
    `,
  );
}
