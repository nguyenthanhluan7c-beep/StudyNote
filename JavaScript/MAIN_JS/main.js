// ============ NAVBAR SHADOW ON SCROLL ============
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ============ MOCK API URL ============
const COURSE_API_URL =
  "https://69fd352830ad0a6fd1c093f8.mockapi.io/api/v1/courses";

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Lỗi phân tích currentUser:", error);
    }
  }
  const id = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  return id ? { id, username, role } : null;
}

/**
 * Khởi tạo các nút "Yêu thích" (Like buttons) trên trang
 * ✅ FIX: Loại bỏ fallback nguy hiểm (index + 1)
 * Chỉ sử dụng data-course-id từ API để đảm bảo lấy đúng ID
 */
function initFavoriteButtons() {
  document.querySelectorAll(".course-overlay button").forEach((btn) => {
    const courseCard = btn.closest(".course-card");

    // Lấy courseId từ data-course-id attribute (được set từ API response)
    // ✅ FIX: Không dùng fallback index vì sẽ gây lỗi lấy sai ID
    const courseId = courseCard?.dataset.courseId;

    // Nếu không tìm được courseId, bỏ qua button này
    if (!courseId) {
      console.warn("Không tìm thấy courseId cho course card:", courseCard);
      return;
    }

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(String(courseId), btn);
    });

    // Kiểm tra xem course đã có trong yêu thích chưa
    // Nếu có, thay đổi icon từ rỗng (bi-heart) thành đầy (bi-heart-fill)
    if (isCourseInFavorites(courseId)) {
      btn.classList.add("liked");
      const icon = btn.querySelector("i");
      icon.classList.remove("bi-heart");
      icon.classList.add("bi-heart-fill");
    }
  });
}

function escapeStringForHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// ============ LOAD COURSES FROM MOCK API ============
/**
 * Tải danh sách khóa học từ MockAPI và render vào DOM
 * Chỉ tải các khóa học có status = "approved"
 * ✅ FIX: Gọi initFavoriteButtons() sau khi render xong
 */
async function loadApprovedCourses() {
  try {
    const response = await fetch(COURSE_API_URL);
    if (!response.ok) throw new Error("Không thể tải tài liệu đã duyệt");
    const courses = await response.json();
    if (!Array.isArray(courses)) return;

    const container = document.getElementById("coursesGrid");
    if (!container) return;

    const approved = courses.filter((course) => course.status === "approved");
    approved.forEach((course) => {
      // Tránh trùng lặp nếu thẻ đã tồn tại
      if (
        document.querySelector(`.course-card[data-course-id="${course.id}"]`)
      ) {
        return;
      }

      const courseTitle = course.name || "Tài liệu không tên";
      const courseImage =
        course.image || "https://via.placeholder.com/300x220?text=Khóa+học";
      const courseDetail = course.detail || "Không có mô tả";
      const coursePrice = course.price ? `${course.price}đ` : "Miễn phí";

      const cardHtml = `
        <div class="col-md-6 col-lg-4">
          <div class="course-card" data-course-id="${course.id}">
            <div class="course-image-wrapper">
              <img src="${courseImage}" alt="${escapeStringForHtml(courseTitle)}" />
              <div class="course-overlay">
                <button class="btn btn-light rounded-circle">
                  <i class="bi bi-heart"></i>
                </button>
              </div>
            </div>
            <div class="card-body">
              <div class="category-badge">${escapeStringForHtml(course.status === "approved" ? "Mới duyệt" : "Khóa học")}</div>
              <h5 class="card-title">${escapeStringForHtml(courseTitle)}</h5>
              <p class="course-desc">${escapeStringForHtml(courseDetail.substring(0, 100))}...</p>
              <div class="course-meta mb-3">
                <span class="me-3">${coursePrice}</span>
              </div>
              <button
                class="btn btn-primary w-100 rounded-pill"
                onclick="viewCourseDetail('${course.id}', '${escapeStringForHtml(courseTitle)}', '${escapeStringForHtml(courseImage)}')"
              >
                Xem chi tiết
              </button>
            </div>
          </div>
        </div>
      `;

      container.insertAdjacentHTML("beforeend", cardHtml);
    });

    observeCourseCards();

    // ✅ FIX: Gọi initFavoriteButtons() sau khi render xong
    // Điều này đảm bảo các buttons yêu thích được khởi tạo
    initFavoriteButtons();
  } catch (error) {
    console.error(error);
  }
}

function observeCourseCards() {
  document.querySelectorAll(".course-card").forEach((card) => {
    if (!card.classList.contains("observed")) {
      observer.observe(card);
      card.classList.add("observed");
    }
  });
}

window.addEventListener("storage", (event) => {
  if (event.key === "coursesUpdatedAt") {
    loadApprovedCourses();
  }
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

// Check if course is in favorites
function isCourseInFavorites(courseId) {
  const favorites = getFavorites();
  return favorites.some((fav) => String(fav.id) === String(courseId));
}

/**
 * Toggle trạng thái yêu thích của một khóa học
 * ✅ FIX: Đảm bảo lưu đúng ID, title, image từ DOM/API
 * @param {string|number} courseId - ID khóa học từ API
 * @param {HTMLElement} btn - Button "Yêu thích"
 */
function toggleFavorite(courseId, btn) {
  let favorites = getFavorites();
  const courseCard = btn.closest(".course-card");

  // Lấy thông tin course từ DOM (được render từ MockAPI)
  const courseTitle =
    courseCard?.querySelector(".card-title")?.textContent?.trim() || "Khóa học";
  const courseImage =
    courseCard?.querySelector("img")?.getAttribute("src") ||
    "https://via.placeholder.com/300x220?text=StudyNote";

  // Kiểm tra xem course đã có trong danh sách yêu thích chưa
  const isFavorited = isCourseInFavorites(courseId);

  if (isFavorited) {
    // ❌ Xóa khỏi yêu thích
    favorites = favorites.filter((fav) => String(fav.id) !== String(courseId));
    btn.classList.remove("liked");
    const icon = btn.querySelector("i");
    icon.classList.add("bi-heart");
    icon.classList.remove("bi-heart-fill");
  } else {
    // ✅ Thêm vào yêu thích
    // Lưu đầy đủ thông tin: id, title, image
    favorites.push({
      id: String(courseId), // ✅ FIX: Lưu ID dưới dạng string để đảm bảo consistent
      title: courseTitle,
      image: courseImage,
    });
    btn.classList.add("liked");
    const icon = btn.querySelector("i");
    icon.classList.remove("bi-heart");
    icon.classList.add("bi-heart-fill");
  }

  // Lưu danh sách yêu thích vào localStorage
  saveFavorites(favorites);
}

// ============ COURSE CARD ANIMATION ON SCROLL ============
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add("visible");
      }, index * 100);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".course-card").forEach((card) => {
  observer.observe(card);
  card.classList.add("observed");
});

// ============ FILTER INTERACTION ============
document
  .querySelectorAll('.filter-group input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      console.log(`${this.id} is ${this.checked ? "checked" : "unchecked"}`);
    });
  });

// ============ VIEW COURSE DETAIL ============
function viewCourseDetail(id, title, image) {
  const courseData = {
    id: id,
    title: title,
    image: image,
  };
  localStorage.setItem("selectedCourse", JSON.stringify(courseData));
  window.location.href = "./chitiet.html";
}

// ============ LOGOUT ============
function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  localStorage.removeItem("userId");
  localStorage.removeItem("username");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}

function setActiveNavItem() {
  const path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".navbar-nav .nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    const normalized = href.replace("./", "").replace("#", "index.html");
    if (normalized === path || (path === "" && normalized === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// Check auth on page load
document.addEventListener("DOMContentLoaded", () => {
  setActiveNavItem();
  // Trang chủ không yêu cầu đăng nhập. Chỉ tải nội dung công khai.
  // ✅ FIX: Gọi loadApprovedCourses() (không cần gọi initFavoriteButtons ở đây nữa)
  // Vì initFavoriteButtons() đã được gọi bên trong loadApprovedCourses()
  loadApprovedCourses();
});
