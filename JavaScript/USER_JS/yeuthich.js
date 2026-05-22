/* ============================================================
   YEUTHICH.JS — Trang yêu thích khóa học
   ============================================================ */

// Dữ liệu khóa học
const allCourses = {
  1: {
    id: 1,
    title: "C++ nâng cao",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/C___Advance_1c572a2e59e5405cb057e864d3590d34.png",
  },
  2: {
    id: 2,
    title: "Cấu trúc dữ liệu và giải thuật",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/cau-truc-du-lieu-va-giai-thuat_ef33392c074c4cd29a9892f11abbc2bc.png",
  },
  3: {
    id: 3,
    title: "Làm quen với SQL",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/lam-quen-voi-sql_2f374a8d41f34eceab306830d4aea433.png",
  },
  4: {
    id: 4,
    title: "C# cơ bản",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/csharp-co-ban_96ca03bee27f454eb1f1c86e1fc5ef74.png",
  },
  5: {
    id: 5,
    title: "JavaScript cơ bản",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/Javascript-co-ban__2__be74112f409f47e9874f0da758c1d7cb.png",
  },
  6: {
    id: 6,
    title: "Lập trình hướng đối tượng trong C++",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/lap-trinh-huong-doi-tuong-trong-cpp_653cb309970b492ca7f69162384814f8.png",
  },
};

// Load favorites on page load
document.addEventListener("DOMContentLoaded", () => {
  renderFavorites();
});

// Get favorites from localStorage
function getFavorites() {
  const favorites = localStorage.getItem("favoritesCourses") || "[]";
  return JSON.parse(favorites);
}

// Save favorites to localStorage
function saveFavorites(favorites) {
  localStorage.setItem("favoritesCourses", JSON.stringify(favorites));
}

// Render favorites
function renderFavorites() {
  const container = document.getElementById("favoritesContainer");
  const favorites = getFavorites();

  if (favorites.length === 0) {
    renderEmptyState(container);
    return;
  }

  let html = `
        <div class="favorites-header">
            <h3 class="favorites-count">
                <i class="bi bi-heart-fill" style="color: #ff6b6b;"></i> 
                ${favorites.length} khóa học yêu thích
            </h3>
            <button class="btn-clear-all" onclick="clearAllFavorites()">
                <i class="bi bi-trash me-2"></i> Xóa tất cả
            </button>
        </div>

        <div class="favorites-grid">
    `;

  favorites.forEach((fav) => {
    const course = allCourses[fav.id];
    if (course) {
      html += `
                <div class="favorite-card">
                    <img src="${escapeHtml(course.image)}" alt="${escapeHtml(course.title)}" class="favorite-card-image">
                    <div class="favorite-card-body">
                        <h5 class="favorite-title">${escapeHtml(course.title)}</h5>
                        <div class="favorite-card-actions">
                            <button class="btn-view" onclick="viewCourseDetail(${course.id}, '${course.title.replace(/'/g, "\\'")}', '${course.image.replace(/'/g, "\\'")}')">
                                <i class="bi bi-eye me-1"></i> Xem chi tiết
                            </button>
                            <button class="btn-remove" onclick="removeFromFavorites(${course.id})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
    }
  });

  html += "</div>";
  container.innerHTML = html;
}

// Render empty state
function renderEmptyState(container) {
  const html = `
        <div class="empty-favorites">
            <div class="empty-icon">
                <i class="bi bi-heart"></i>
            </div>
            <p class="empty-text">Không có khóa học yêu thích</p>
            <p class="empty-subtext">Hãy quay lại trang chủ và thêm các khóa học yêu thích của bạn</p>
            <a href="index.html" class="btn-back-shop">
                <i class="bi bi-arrow-left me-2"></i> Quay lại trang chủ
            </a>
        </div>
    `;
  container.innerHTML = html;
}

// Remove from favorites
function removeFromFavorites(courseId) {
  let favorites = getFavorites();
  favorites = favorites.filter((fav) => fav.id !== courseId);
  saveFavorites(favorites);
  renderFavorites();
}

// Clear all favorites
function clearAllFavorites() {
  if (confirm("Bạn có chắc muốn xóa tất cả khóa học yêu thích?")) {
    saveFavorites([]);
    renderFavorites();
  }
}

// View course detail
function viewCourseDetail(id, title, image) {
  const courseData = {
    id: id,
    title: title,
    image: image,
  };
  localStorage.setItem("selectedCourse", JSON.stringify(courseData));
  window.location.href = "chitiet.html";
}

// Escape HTML
function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Logout
function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userId");
  localStorage.removeItem("role");
  localStorage.removeItem("favoritesCourses");
  window.location.href = "./login.html";
}
