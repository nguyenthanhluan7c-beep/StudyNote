/* ============================================================
   YEUTHICH.JS — Trang yêu thích khóa học
   ============================================================ */

// Load favorites on page load
document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
});

/**
 * Lấy danh sách yêu thích từ localStorage
 * Dữ liệu được lưu bởi main.js khi người dùng nhấn nút "Yêu thích"
 * Mỗi phần tử có cấu trúc: { id, title, image }
 * @returns {Array} Mảng các course yêu thích
 */
function getFavorites() {
  const favorites = localStorage.getItem("favoritesCourses") || "[]";
  try {
    return JSON.parse(favorites);
  } catch (error) {
    console.error("Lỗi phân tích dữ liệu yêu thích:", error);
    return [];
  }
}

/**
 * Lưu danh sách yêu thích vào localStorage
 * @param {Array} favorites - Mảng các course cần lưu
 */
function saveFavorites(favorites) {
  localStorage.setItem("favoritesCourses", JSON.stringify(favorites));
}

/**
 * Render danh sách yêu thích
 * ✅ FIX: Sử dụng dữ liệu đã lưu trong localStorage thay vì tìm kiếm từ object allCourses cứng
 * Dữ liệu trong favorites đã có đầy đủ: id, title, image từ MockAPI
 */
function renderFavorites() {
  const container = document.getElementById("favoritesContainer");
  const favorites = getFavorites();

  // Nếu không có yêu thích, hiển thị trạng thái rỗng
  if (favorites.length === 0) {
    renderEmptyState(container);
    return;
  }

  let html = `
        <div class="favorites-header">
            <h3 class="favorites-count">
                <i class="bi bi-heart-fill" style="color: #ff6b6b;"></i> 
                ${favorites.length} tài liệu yêu thích
            </h3>
            <button class="btn-clear-all" onclick="clearAllFavorites()">
                <i class="bi bi-trash me-2"></i> Xóa tất cả
            </button>
        </div>

        <div class="favorites-grid">
    `;

  // ✅ FIX: Duyệt qua danh sách yêu thích và render từ dữ liệu đã lưu
  // Không còn phụ thuộc vào object allCourses hardcoded
  favorites.forEach((fav) => {
    // Dữ liệu fav đã đủ đầy đủ từ localStorage: { id, title, image }
    // Được lưu từ main.js khi người dùng thêm vào yêu thích
    html += `
                <div class="favorite-card">
                    <img src="${escapeHtml(fav.image)}" alt="${escapeHtml(fav.title)}" class="favorite-card-image">
                    <div class="favorite-card-body">
                        <h5 class="favorite-title">${escapeHtml(fav.title)}</h5>
                        <div class="favorite-card-actions">
                            <button class="btn-view" onclick="viewCourseDetail('${escapeJsString(fav.id)}', '${escapeJsString(fav.title)}', '${escapeJsString(fav.image)}')">
                                <i class="bi bi-eye me-1"></i> Xem chi tiết
                            </button>
                            <button class="btn-remove" onclick="removeFromFavorites('${escapeJsString(fav.id)}')">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
  });

  html += "</div>";
  container.innerHTML = html;
}

/**
 * Render trạng thái rỗng (không có yêu thích)
 * @param {HTMLElement} container - Phần tử chứa
 */
function renderEmptyState(container) {
  const html = `
        <div class="empty-favorites">
            <div class="empty-icon">
                <i class="bi bi-heart"></i>
            </div>
            <p class="empty-text">Không có tài liệu yêu thích</p>
            <p class="empty-subtext">Hãy quay lại trang chủ và thêm các tài liệu yêu thích của bạn</p>
            <a href="index.html" class="btn-back-shop">
                <i class="bi bi-arrow-left me-2"></i> Quay lại trang chủ
            </a>
        </div>
    `;
  container.innerHTML = html;
}

/**
 * Xóa một course khỏi danh sách yêu thích
 * @param {string|number} courseId - ID của course cần xóa
 */
function removeFromFavorites(courseId) {
  let favorites = getFavorites();
  // ✅ FIX: So sánh courseId dưới dạng string để tránh lỗi so sánh
  favorites = favorites.filter((fav) => String(fav.id) !== String(courseId));
  saveFavorites(favorites);
  renderFavorites();
}

/**
 * Xóa tất cả tài liệu yêu thích
 */
function clearAllFavorites() {
  if (confirm("Bạn có chắc muốn xóa tất cả tài liệu yêu thích?")) {
    saveFavorites([]);
    renderFavorites();
  }
}

/**
 * Chuyển đến trang chi tiết khóa học
 * ✅ FIX: Sử dụng tham số String/ID từ dữ liệu lưu trữ thay vì object cứng
 * @param {string|number} id - ID khóa học
 * @param {string} title - Tiêu đề khóa học
 * @param {string} image - URL hình ảnh
 */
function viewCourseDetail(id, title, image) {
  const courseData = {
    id: id,
    title: title,
    image: image,
  };
  localStorage.setItem("selectedCourse", JSON.stringify(courseData));
  window.location.href = "chitiet.html";
}

/**
 * Escape HTML entities để tránh XSS
 * @param {string} text - Chuỗi cần escape
 * @returns {string} Chuỗi đã escape
 */
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Escape JavaScript strings để tránh lỗi cú pháp
 * Dùng cho inline event handlers (onclick, etc.)
 * @param {string} str - Chuỗi cần escape
 * @returns {string} Chuỗi đã escape
 */
function escapeJsString(str) {
  return String(str)
    .replace(/\\/g, "\\\\") // Escape backslash
    .replace(/'/g, "\\'") // Escape single quote
    .replace(/"/g, '\\"') // Escape double quote
    .replace(/\n/g, "\\n") // Escape newline
    .replace(/\r/g, "\\r"); // Escape carriage return
}

// ============ NAVBAR SCROLL EFFECT ============
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ============ LOGOUT ============
/**
 * Đăng xuất tài khoản
 * Xóa tất cả dữ liệu liên quan đến người dùng và yêu thích
 */
function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  localStorage.removeItem("favoritesCourses");
  window.location.href = "./login.html";
}
