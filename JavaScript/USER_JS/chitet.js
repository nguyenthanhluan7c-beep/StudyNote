/* ============================================================
   CHITET.JS — Chi tiết khóa học
   ============================================================ */

// Auth check
(function authGuard() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (!user) {
    window.location.href = "index.html";
  }
})();

// Dữ liệu khóa học chi tiết
const courseDetails = {
  1: {
    title: "C++ nâng cao",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/C___Advance_1c572a2e59e5405cb057e864d3590d34.png",
    description:
      "Khóa học C++ nâng cao được thiết kế cho những người đã có kiến thức cơ bản về C++. Trong khóa học này, bạn sẽ học về các chủ đề nâng cao như template, smart pointers, modern C++ (C++11, C++14, C++17), và nhiều điều khác.",
    instructor: "Thầy Nguyễn Văn A",
    rating: 4.8,
    reviews: 234,
    students: 5600,
    duration: "24 giờ",
    level: "Nâng cao",
    category: "Lập trình C++",
    curriculum: [
      "Giới thiệu về C++ nâng cao",
      "Template và Generic Programming",
      "Smart Pointers và Memory Management",
      "Modern C++ Features",
      "Exception Handling",
      "STL (Standard Template Library)",
      "Multithreading",
      "Networking Programming",
    ],
    requirements: [
      "Kiến thức cơ bản về C++",
      "Hiểu biết về cấu trúc dữ liệu",
      "Máy tính có cài đặt C++ compiler",
    ],
    price: "450,000 VNĐ",
  },
  2: {
    title: "Cấu trúc dữ liệu và giải thuật",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/cau-truc-du-lieu-va-giai-thuat_ef33392c074c4cd29a9892f11abbc2bc.png",
    description:
      "Khóa học toàn diện về cấu trúc dữ liệu và giải thuật - những kiến thức nền tảng không thể thiếu cho mỗi lập trình viên. Bạn sẽ học về Array, Linked List, Stack, Queue, Tree, Graph, Sorting, Searching và nhiều giải thuật quan trọng khác.",
    instructor: "Thầy Trần Văn B",
    rating: 4.9,
    reviews: 567,
    students: 8900,
    duration: "32 giờ",
    level: "Trung bình",
    category: "Lập trình",
    curriculum: [
      "Giới thiệu cấu trúc dữ liệu",
      "Array và Dynamic Array",
      "Linked List",
      "Stack và Queue",
      "Tree và Binary Search Tree",
      "Graph",
      "Sorting Algorithms",
      "Searching Algorithms",
      "Hash Table",
    ],
    requirements: ["Kiến thức lập trình cơ bản", "Hiểu biết về biến và hàm"],
    price: "500,000 VNĐ",
  },
  3: {
    title: "Làm quen với SQL",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/lam-quen-voi-sql_2f374a8d41f34eceab306830d4aea433.png",
    description:
      "Khóa học SQL dành cho người mới bắt đầu. Bạn sẽ học cách tạo, truy vấn, cập nhật và xóa dữ liệu trong cơ sở dữ liệu. Khóa học bao gồm các chủ đề như SELECT, INSERT, UPDATE, DELETE, JOIN, GROUP BY, và nhiều hơn nữa.",
    instructor: "Cô Lê Thị C",
    rating: 4.7,
    reviews: 345,
    students: 6500,
    duration: "20 giờ",
    level: "Cơ bản",
    category: "Cơ sở dữ liệu",
    curriculum: [
      "Giới thiệu SQL và Database",
      "CREATE TABLE",
      "INSERT, UPDATE, DELETE",
      "SELECT Query",
      "WHERE Clause",
      "JOIN",
      "GROUP BY và HAVING",
      "Subquery",
      "Index và Optimization",
    ],
    requirements: ["Không yêu cầu kiến thức trước"],
    price: "350,000 VNĐ",
  },
  4: {
    title: "C# cơ bản",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/csharp-co-ban_96ca03bee27f454eb1f1c86e1fc5ef74.png",
    description:
      "Khóa học C# cơ bản sẽ giúp bạn nắm vững các khái niệm cơ bản về lập trình hướng đối tượng với C#. Từ biến, hàm, lớp, cho đến các chủ đề nâng cao hơn như delegate, event, và LINQ.",
    instructor: "Thầy Phạm Văn D",
    rating: 4.6,
    reviews: 289,
    students: 4200,
    duration: "28 giờ",
    level: "Cơ bản",
    category: "Lập trình C#",
    curriculum: [
      "Giới thiệu C# và .NET",
      "Biến và Kiểu dữ liệu",
      "Điều khiển luồng",
      "Hàm và Method",
      "Lập trình Hướng đối tượng",
      "Kế thừa và Đa hình",
      "Exception Handling",
      "Collections",
    ],
    requirements: ["Kiến thức lập trình cơ bản", "Visual Studio được cài đặt"],
    price: "400,000 VNĐ",
  },
  5: {
    title: "JavaScript cơ bản",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/Javascript-co-ban__2__be74112f409f47e9874f0da758c1d7cb.png",
    description:
      "Khóa học JavaScript cơ bản từ zero đến hero. Học cách tạo các ứng dụng web tương tác với JavaScript. Bao gồm DOM manipulation, Events, Promises, Async/Await, và các chủ đề quan trọng khác.",
    instructor: "Thầy Hoàng Văn E",
    rating: 4.8,
    reviews: 678,
    students: 9800,
    duration: "30 giờ",
    level: "Cơ bản",
    category: "Web Development",
    curriculum: [
      "Giới thiệu JavaScript",
      "Biến và Scope",
      "Function",
      "Object và Array",
      "DOM Manipulation",
      "Events",
      "Promises và Async/Await",
      "Fetch API",
      "ES6+ Features",
    ],
    requirements: ["Kiến thức HTML/CSS cơ bản", "Text editor hoặc IDE"],
    price: "420,000 VNĐ",
  },
  6: {
    title: "Lập trình hướng đối tượng trong C++",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/lap-trinh-huong-doi-tuong-trong-cpp_653cb309970b492ca7f69162384814f8.png",
    description:
      "Khóa học lập trình hướng đối tượng (OOP) trong C++. Bạn sẽ học về Class, Object, Inheritance, Polymorphism, Encapsulation, Abstraction, và cách thiết kế ứng dụng theo nguyên tắc SOLID.",
    instructor: "Thầy Đặng Văn F",
    rating: 4.7,
    reviews: 412,
    students: 7100,
    duration: "26 giờ",
    level: "Trung bình",
    category: "Lập trình C++",
    curriculum: [
      "Giới thiệu OOP",
      "Class và Object",
      "Constructor và Destructor",
      "Encapsulation",
      "Inheritance",
      "Polymorphism",
      "Virtual Function",
      "Abstract Class",
      "SOLID Principles",
    ],
    requirements: ["Kiến thức cơ bản về C++", "Hiểu biết về cấu trúc cơ bản"],
    price: "480,000 VNĐ",
  },
};

// Load course detail on page load
document.addEventListener("DOMContentLoaded", () => {
  const selectedCourse = JSON.parse(
    localStorage.getItem("selectedCourse") || "null",
  );

  if (!selectedCourse) {
    renderEmptyState();
    return;
  }

  const courseId = selectedCourse.id;
  const courseData = courseDetails[courseId];

  if (!courseData) {
    renderEmptyState();
    return;
  }

  renderCourseDetail(courseData, courseId);
});

// Render course detail
function renderCourseDetail(course, courseId) {
  const container = document.getElementById("courseContainer");
  const starsHTML = generateStars(course.rating);

  const html = `
        <section class="course-detail-hero">
            <div class="container">
                <div class="row align-items-center">
                    <div class="col-lg-8">
                        <a onclick="goBack()" class="breadcrumb-link mb-3 d-inline-block">
                            <i class="bi bi-chevron-left"></i> Quay lại
                        </a>
                        <h1 class="display-4 mb-3 fw-bold">${escapeHtml(course.title)}</h1>
                        <p class="lead mb-0">
                            <span class="me-3">
                                <i class="bi bi-star-fill"></i> ${course.rating} 
                                <span class="text-white-50">(${course.reviews} đánh giá)</span>
                            </span>
                            <span>
                                <i class="bi bi-people-fill"></i> ${course.students.toLocaleString()} học viên
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>

        <div class="container mb-5">
            <div class="row g-4">
                <!-- Main Content -->
                <div class="col-lg-8">
                    <!-- Course Image -->
                    <div class="mb-4">
                        <img src="${escapeHtml(course.image)}" alt="${escapeHtml(course.title)}" class="course-detail-image">
                    </div>

                    <!-- Course Details Container -->
                    <div class="course-detail-container">
                        <!-- Description -->
                        <section class="detail-section">
                            <h2 class="section-title">Mô tả khóa học</h2>
                            <p class="section-content">${escapeHtml(course.description)}</p>
                        </section>

                        <!-- Curriculum -->
                        <section class="detail-section">
                            <h2 class="section-title">Nội dung khóa học</h2>
                            <ul class="section-content">
                                ${course.curriculum.map((item) => `<li class="mb-2">${escapeHtml(item)}</li>`).join("")}
                            </ul>
                        </section>

                        <!-- Requirements -->
                        <section class="detail-section">
                            <h2 class="section-title">Yêu cầu</h2>
                            <ul class="section-content">
                                ${course.requirements.map((item) => `<li class="mb-2"><i class="bi bi-check-circle text-success me-2"></i>${escapeHtml(item)}</li>`).join("")}
                            </ul>
                        </section>

                        <!-- Instructor -->
                        <section class="detail-section">
                            <h2 class="section-title">Giảng viên</h2>
                            <div class="d-flex align-items-center section-content">
                                <div class="avatar me-3" style="width: 60px; height: 60px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 20px;">
                                    ${course.instructor.charAt(0)}
                                </div>
                                <div>
                                    <p class="mb-0"><strong>${escapeHtml(course.instructor)}</strong></p>
                                    <p class="text-muted mb-0">Giảng viên chuyên nghiệp</p>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>

                <!-- Sidebar -->
                <div class="col-lg-4">
                    <div class="course-detail-container" style="position: sticky; top: 100px;">
                        <!-- Price -->
                        <div class="mb-4">
                            <p class="text-muted mb-1">Giá khóa học</p>
                            <h3 class="mb-0" style="color: #667eea; font-weight: 700;">${escapeHtml(course.price)}</h3>
                        </div>

                        <!-- Course Info -->
                        <div class="mb-4 pb-4 border-bottom">
                            <div class="d-flex justify-content-between mb-3">
                                <span class="text-muted">
                                    <i class="bi bi-clock me-2"></i> Thời lượng
                                </span>
                                <span class="fw-600">${escapeHtml(course.duration)}</span>
                            </div>
                            <div class="d-flex justify-content-between mb-3">
                                <span class="text-muted">
                                    <i class="bi bi-bar-chart me-2"></i> Mức độ
                                </span>
                                <span class="fw-600">${escapeHtml(course.level)}</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span class="text-muted">
                                    <i class="bi bi-tag me-2"></i> Danh mục
                                </span>
                                <span class="fw-600">${escapeHtml(course.category)}</span>
                            </div>
                        </div>

                        <!-- Enroll Button -->
                        <div class="action-buttons">
                            <button class="btn-enroll w-100" onclick="enrollCourse(${courseId})">
                                <i class="bi bi-play-fill me-2"></i> Đăng ký khóa học
                            </button>
                        </div>

                        <!-- Add to Favorites -->
                        <button class="btn btn-outline-secondary w-100 mt-2 rounded-pill">
                            <i class="bi bi-heart me-2"></i> Thêm vào yêu thích
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;

  container.innerHTML = html;
}

// Render empty state
function renderEmptyState() {
  const container = document.getElementById("courseContainer");
  const html = `
        <div class="container my-5">
            <div class="empty-state">
                <div class="empty-state-icon">
                    <i class="bi bi-inbox"></i>
                </div>
                <div class="empty-state-text">Không tìm thấy khóa học</div>
                <a href="use.html" class="btn btn-primary rounded-pill px-4">
                    <i class="bi bi-arrow-left me-2"></i> Quay lại trang chủ
                </a>
            </div>
        </div>
    `;
  container.innerHTML = html;
}

// Generate star rating
function generateStars(rating) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  let stars = "";

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="bi bi-star-fill"></i>';
  }

  if (hasHalfStar) {
    stars += '<i class="bi bi-star-half"></i>';
  }

  for (let i = fullStars + (hasHalfStar ? 1 : 0); i < 5; i++) {
    stars += '<i class="bi bi-star"></i>';
  }

  return stars;
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

// Go back
function goBack() {
  window.history.back();
}

// Enroll course
function enrollCourse(courseId) {
  const course = courseDetails[courseId];
  alert(
    `Cảm ơn bạn đã đăng ký khóa học "${course.title}"! Chúng tôi sẽ liên hệ với bạn sớm.`,
  );
}

// Navbar scroll effect
window.addEventListener("scroll", () => {
  const navbar = document.getElementById("navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// Logout
function handleLogout() {
  localStorage.removeItem("loggedInUser");
  localStorage.removeItem("selectedCourse");
  window.location.href = "index.html";
}
