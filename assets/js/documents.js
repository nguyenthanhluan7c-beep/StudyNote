// ===============================
// DOCUMENTS.JS
// Trang kho tài liệu
// Có GET documents + reviews + comments + search/filter/sort/pagination
// ===============================

let allDocuments = [];
let allReviews = [];
let allComments = [];

let currentDocuments = [];

let currentPage = 1;
const itemsPerPage = 6;

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  renderAuthNavbar();
  setupDocumentsEvents();
  loadDocuments();
});

// ===============================
// 1. GẮN SỰ KIỆN
// ===============================
function setupDocumentsEvents() {
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const refreshBtn = document.getElementById("refreshBtn");

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (backToTop) {
    backToTop.addEventListener("click", scrollToTop);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", loadDocuments);
  }

  window.addEventListener("scroll", handleBackToTopButton);

  $("#searchInput").on("input", function () {
    currentPage = 1;
    applyFilters();
  });

  $("#subjectFilter").on("change", function () {
    currentPage = 1;
    applyFilters();
  });

  $("#sortSelect").on("change", function () {
    currentPage = 1;
    applyFilters();
  });

  document
    .getElementById("documentPagination")
    .addEventListener("click", handlePaginationClick);
}

// ===============================
// 2. GET DATA TỪ MOCKAPI
// ===============================
async function loadDocuments() {
  try {
    showError(false);
    showEmpty(false);
    renderSkeleton();

    const results = await Promise.allSettled([
      apiGet(CONFIG.api.documents),
      apiGet(CONFIG.api.reviews),
      apiGet(CONFIG.api.comments),
    ]);

    if (results[0].status === "rejected") {
      throw results[0].reason;
    }

    allDocuments = results[0].value.map(normalizeDocument);

    allReviews = results[1].status === "fulfilled" ? results[1].value : [];
    allComments = results[2].status === "fulfilled" ? results[2].value : [];

    updateSubjectFilter();
    updateStats(allDocuments);

    currentPage = 1;
    applyFilters();
  } catch (error) {
    console.error(error);
    document.getElementById("documentList").innerHTML = "";
    document.getElementById("documentPagination").innerHTML = "";
    showError(true);
  }
}

function normalizeDocument(document) {
  return {
    id: document.id,
    title: document.title || "Tài liệu chưa có tiêu đề",
    subject: document.subject || "Khác",
    category: document.category || "Tài liệu học tập",
    description: document.description || "Chưa có mô tả cho tài liệu này.",
    coverImage:
      document.coverImage ||
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200",
    fileUrl: document.fileUrl || "#",
    authorName: document.authorName || "Người dùng StudyHub",
    authorAvatar:
      document.authorAvatar ||
      "https://api.dicebear.com/9.x/initials/svg?seed=StudyHub",
    viewCount: Number(document.viewCount || 0),
    downloadCount: Number(document.downloadCount || 0),
    createdAt: document.createdAt || new Date().toISOString(),
  };
}

// ===============================
// 3. SEARCH + FILTER + SORT
// ===============================
function applyFilters() {
  const keyword = document
    .getElementById("searchInput")
    .value.toLowerCase()
    .trim();
  const subject = document.getElementById("subjectFilter").value;
  const sortType = document.getElementById("sortSelect").value;

  currentDocuments = allDocuments.filter(function (document) {
    const searchableText = `
      ${document.title}
      ${document.description}
      ${document.authorName}
      ${document.subject}
      ${document.category}
    `.toLowerCase();

    const matchKeyword = searchableText.includes(keyword);
    const matchSubject = subject === "all" || document.subject === subject;

    return matchKeyword && matchSubject;
  });

  sortDocuments(sortType);

  updateResultCount(currentDocuments.length);
  renderDocuments(currentDocuments);
  renderPagination(currentDocuments.length);
}

function sortDocuments(sortType) {
  if (sortType === "newest") {
    currentDocuments.sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  if (sortType === "downloads") {
    currentDocuments.sort(function (a, b) {
      return b.downloadCount - a.downloadCount;
    });
  }

  if (sortType === "views") {
    currentDocuments.sort(function (a, b) {
      return b.viewCount - a.viewCount;
    });
  }

  if (sortType === "rating") {
    currentDocuments.sort(function (a, b) {
      return getAverageRating(b.id) - getAverageRating(a.id);
    });
  }

  if (sortType === "title") {
    currentDocuments.sort(function (a, b) {
      return a.title.localeCompare(b.title, "vi");
    });
  }
}

// ===============================
// 4. RENDER DANH SÁCH
// ===============================
function renderDocuments(documents) {
  const documentList = document.getElementById("documentList");

  documentList.innerHTML = "";

  if (documents.length === 0) {
    showEmpty(true);
    document.getElementById("documentPagination").innerHTML = "";
    return;
  }

  showEmpty(false);

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const pageDocuments = documents.slice(start, end);

  pageDocuments.forEach(function (document) {
    const averageRating = getAverageRating(document.id);
    const reviewCount = getReviewCount(document.id);
    const commentCount = getCommentCount(document.id);

    const cardHTML = `
      <div class="col-md-6 col-xl-4">
        <article class="document-card">
          <div class="document-cover">
            <img
              src="${escapeHTML(document.coverImage)}"
              alt="${escapeHTML(document.title)}"
              onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200'"
            />

            <span class="free-badge">
              <i class="bi bi-unlock"></i>
              Miễn phí
            </span>

            <span class="subject-badge">
              ${escapeHTML(document.subject)}
            </span>
          </div>

          <div class="document-body">
            <h3>${escapeHTML(document.title)}</h3>

            <p class="document-desc">
              ${escapeHTML(shortText(document.description, 110))}
            </p>

            <div class="author-row">
              <img
                src="${escapeHTML(document.authorAvatar)}"
                alt="${escapeHTML(document.authorName)}"
              />

              <div>
                <strong>${escapeHTML(document.authorName)}</strong>
                <span>${formatDate(document.createdAt)}</span>
              </div>
            </div>

            <div class="document-meta">
              <span>
                <i class="bi bi-eye"></i>
                ${document.viewCount}
              </span>

              <span>
                <i class="bi bi-download"></i>
                ${document.downloadCount}
              </span>

              <span>
                <i class="bi bi-chat-left-text"></i>
                ${commentCount}
              </span>
            </div>

            <div class="document-rating mt-3">
              ${renderStars(averageRating)}
              <span>
                ${averageRating.toFixed(1)} / ${reviewCount} đánh giá
              </span>
            </div>

            <div class="document-actions">
              <a
                href="./document-detail.html?id=${document.id}"
                class="btn btn-main btn-sm"
              >
                <i class="bi bi-eye"></i>
                Xem chi tiết
              </a>

              <a
                href="${escapeHTML(document.fileUrl)}"
                target="_blank"
                class="btn btn-ghost btn-sm"
              >
                <i class="bi bi-box-arrow-up-right"></i>
                Mở
              </a>
            </div>
          </div>
        </article>
      </div>
    `;

    documentList.insertAdjacentHTML("beforeend", cardHTML);
  });

  $(".document-card").hide().fadeIn(350);
}

// ===============================
// 5. PAGINATION
// ===============================
function renderPagination(totalItems) {
  const pagination = document.getElementById("documentPagination");
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  pagination.innerHTML = "";

  if (totalPages <= 1) {
    return;
  }

  const prevDisabled = currentPage === 1 ? "disabled" : "";
  const nextDisabled = currentPage === totalPages ? "disabled" : "";

  pagination.insertAdjacentHTML(
    "beforeend",
    `
      <button class="page-btn" data-page="prev" ${prevDisabled}>
        <i class="bi bi-chevron-left"></i>
      </button>
    `,
  );

  for (let page = 1; page <= totalPages; page++) {
    const activeClass = page === currentPage ? "active" : "";

    pagination.insertAdjacentHTML(
      "beforeend",
      `
        <button class="page-btn ${activeClass}" data-page="${page}">
          ${page}
        </button>
      `,
    );
  }

  pagination.insertAdjacentHTML(
    "beforeend",
    `
      <button class="page-btn" data-page="next" ${nextDisabled}>
        <i class="bi bi-chevron-right"></i>
      </button>
    `,
  );
}

function handlePaginationClick(event) {
  const button = event.target.closest(".page-btn");

  if (!button || button.disabled) {
    return;
  }

  const page = button.dataset.page;
  const totalPages = Math.ceil(currentDocuments.length / itemsPerPage);

  if (page === "prev") {
    currentPage--;
  } else if (page === "next") {
    currentPage++;
  } else {
    currentPage = Number(page);
  }

  if (currentPage < 1) {
    currentPage = 1;
  }

  if (currentPage > totalPages) {
    currentPage = totalPages;
  }

  renderDocuments(currentDocuments);
  renderPagination(currentDocuments.length);

  document.querySelector(".documents-main").scrollIntoView({
    behavior: "smooth",
  });
}

// ===============================
// 6. RATING + COMMENT COUNT
// ===============================
function getDocumentReviews(documentId) {
  return allReviews.filter(function (review) {
    return String(review.documentId) === String(documentId);
  });
}

function getAverageRating(documentId) {
  const documentReviews = getDocumentReviews(documentId);

  if (documentReviews.length === 0) {
    return 0;
  }

  const total = documentReviews.reduce(function (sum, review) {
    return sum + Number(review.rating || 0);
  }, 0);

  return total / documentReviews.length;
}

function getReviewCount(documentId) {
  return getDocumentReviews(documentId).length;
}

function getCommentCount(documentId) {
  return allComments.filter(function (comment) {
    return (
      comment.targetType === "document" &&
      String(comment.targetId) === String(documentId)
    );
  }).length;
}

function renderStars(rating) {
  let html = "";

  const roundedRating = Math.round(rating);

  for (let i = 1; i <= 5; i++) {
    if (i <= roundedRating) {
      html += `<i class="bi bi-star-fill"></i>`;
    } else {
      html += `<i class="bi bi-star"></i>`;
    }
  }

  return html;
}

// ===============================
// 7. SKELETON LOADING
// ===============================
function renderSkeleton() {
  const documentList = document.getElementById("documentList");
  let skeletonHTML = "";

  for (let i = 0; i < 6; i++) {
    skeletonHTML += `
      <div class="col-md-6 col-xl-4">
        <div class="skeleton-card">
          <div class="skeleton-img"></div>

          <div class="skeleton-body">
            <div class="skeleton-line big"></div>
            <div class="skeleton-line"></div>
            <div class="skeleton-line mid"></div>

            <div class="d-flex align-items-center gap-3 mt-4">
              <div class="skeleton-avatar"></div>
              <div class="flex-grow-1">
                <div class="skeleton-line short"></div>
                <div class="skeleton-line mid"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  documentList.innerHTML = skeletonHTML;
  document.getElementById("documentPagination").innerHTML = "";
}

// ===============================
// 8. FILTER MÔN HỌC
// ===============================
function updateSubjectFilter() {
  const subjectFilter = document.getElementById("subjectFilter");

  const subjects = allDocuments.map(function (document) {
    return document.subject;
  });

  const uniqueSubjects = [...new Set(subjects)];

  subjectFilter.innerHTML = `<option value="all">Tất cả môn học</option>`;

  uniqueSubjects.forEach(function (subject) {
    const optionHTML = `
      <option value="${escapeHTML(subject)}">
        ${escapeHTML(subject)}
      </option>
    `;

    subjectFilter.insertAdjacentHTML("beforeend", optionHTML);
  });
}

// ===============================
// 9. THỐNG KÊ
// ===============================
function updateStats(documents) {
  const totalDocuments = document.getElementById("totalDocuments");
  const totalSubjects = document.getElementById("totalSubjects");
  const totalDownloads = document.getElementById("totalDownloads");

  const subjects = documents.map(function (document) {
    return document.subject;
  });

  const downloads = documents.reduce(function (sum, document) {
    return sum + document.downloadCount;
  }, 0);

  totalDocuments.textContent = documents.length;
  totalSubjects.textContent = new Set(subjects).size;
  totalDownloads.textContent = downloads;
}

function updateResultCount(count) {
  document.getElementById("resultCount").textContent = `${count} kết quả`;
}

// ===============================
// 10. UI STATE
// ===============================
function showError(isShow) {
  const errorBox = document.getElementById("errorBox");

  if (isShow) {
    errorBox.classList.remove("d-none");
  } else {
    errorBox.classList.add("d-none");
  }
}

function showEmpty(isShow) {
  const emptyBox = document.getElementById("emptyBox");

  if (isShow) {
    emptyBox.classList.remove("d-none");
  } else {
    emptyBox.classList.add("d-none");
  }
}

// ===============================
// 11. HELPER
// ===============================
function shortText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + "...";
}

function formatDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Không rõ ngày";
  }

  return date.toLocaleDateString("vi-VN");
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
