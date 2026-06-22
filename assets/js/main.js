// ===============================
// MAIN.JS
// Trang chủ StudyHub
// ===============================

let homeDocuments = [];
let homeTopics = [];
let homeReviews = [];
let homeComments = [];
let homeUsers = [];

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  renderAuthNavbar();
  setupCommonEvents();
  loadHomeData();
});

// ===============================
// 1. EVENT CHUNG
// ===============================
function setupCommonEvents() {
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (backToTop) {
    backToTop.addEventListener("click", scrollToTop);
  }

  window.addEventListener("scroll", handleBackToTopButton);

  $(".feature-card, .stat-card, .content-panel").hide().fadeIn(450);
}

// ===============================
// 2. LOAD DATA TRANG CHỦ
// ===============================
async function loadHomeData() {
  try {
    const results = await Promise.allSettled([
      apiGet(CONFIG.api.documents),
      apiGet(CONFIG.api.topics),
      apiGet(CONFIG.api.reviews),
      apiGet(CONFIG.api.comments),
      apiGet(CONFIG.api.users),
    ]);

    homeDocuments = results[0].status === "fulfilled" ? results[0].value : [];
    homeTopics = results[1].status === "fulfilled" ? results[1].value : [];
    homeReviews = results[2].status === "fulfilled" ? results[2].value : [];
    homeComments = results[3].status === "fulfilled" ? results[3].value : [];
    homeUsers = results[4].status === "fulfilled" ? results[4].value : [];

    renderHomeStats();
    renderFeaturedDocuments();
    renderLatestTopics();
    renderRecentActivity();
  } catch (error) {
    console.error(error);
    renderHomeFallback();
  }
}

// ===============================
// 3. THỐNG KÊ TRANG CHỦ
// ===============================
function renderHomeStats() {
  const totalDocuments = homeDocuments.length;
  const totalTopics = homeTopics.length;
  const totalUsers = homeUsers.length;

  const averageRating = calculateAverageRating(homeReviews);

  setText("homeTotalDocuments", totalDocuments);
  setText("homeTotalTopics", totalTopics);
  setText("homeAverageRating", averageRating);
  setText("homeTotalUsers", totalUsers);
}

function calculateAverageRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return "0.0";
  }

  const total = reviews.reduce(function (sum, review) {
    return sum + Number(review.rating || 0);
  }, 0);

  return (total / reviews.length).toFixed(1);
}

// ===============================
// 4. RENDER TÀI LIỆU NỔI BẬT
// ===============================
function renderFeaturedDocuments() {
  const container = document.getElementById("homeFeaturedDocuments");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (homeDocuments.length === 0) {
    container.innerHTML = `
      <div class="home-empty-mini">
        Chưa có tài liệu nào. Hãy đăng tài liệu đầu tiên nhé.
      </div>
    `;
    return;
  }

  const featuredDocuments = [...homeDocuments]
    .sort(function (a, b) {
      return Number(b.downloadCount || 0) - Number(a.downloadCount || 0);
    })
    .slice(0, 3);

  featuredDocuments.forEach(function (document) {
    const itemHTML = `
      <a href="./document-detail.html?id=${document.id}" class="demo-item">
        <div class="home-doc-thumb">
          <img
            src="${escapeHTML(document.coverImage || getDefaultHomeCover())}"
            alt="${escapeHTML(document.title || "Tài liệu")}"
            onerror="this.src='${getDefaultHomeCover()}'"
          />
        </div>

        <div>
          <h6>${escapeHTML(document.title || "Tài liệu chưa có tiêu đề")}</h6>
          <p>
            ${escapeHTML(document.subject || "Khác")}
            · ${Number(document.viewCount || 0)} lượt xem
            · ${Number(document.downloadCount || 0)} lượt tải
          </p>
        </div>
      </a>
    `;

    container.insertAdjacentHTML("beforeend", itemHTML);
  });

  $(".demo-item").hide().fadeIn(350);
}

// ===============================
// 5. RENDER TOPIC MỚI
// ===============================
function renderLatestTopics() {
  const container = document.getElementById("homeLatestTopics");

  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!homeTopics || homeTopics.length === 0) {
    container.innerHTML = `
      <div class="home-empty-mini">
        Chưa có chủ đề diễn đàn nào. Phần forum sẽ được thêm ở bước sau.
      </div>
    `;
    return;
  }

  const latestTopics = [...homeTopics]
    .sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 3);

  latestTopics.forEach(function (topic) {
    const status = topic.status || "Thảo luận";
    const statusClass = getTopicStatusClass(status);

    const itemHTML = `
      <a href="./topic-detail.html?id=${topic.id}" class="topic-mini d-block">
        <span class="topic-status ${statusClass}">
          ${escapeHTML(status)}
        </span>

        <h6>${escapeHTML(topic.title || "Chủ đề chưa có tiêu đề")}</h6>

        <p>
          ${Number(topic.commentCount || 0)} bình luận
          · ${escapeHTML(topic.subject || "Khác")}
        </p>
      </a>
    `;

    container.insertAdjacentHTML("beforeend", itemHTML);
  });

  $(".topic-mini").hide().fadeIn(350);
}

function getTopicStatusClass(status) {
  if (status === "Đang hỏi") {
    return "asking";
  }

  if (status === "Đã giải quyết") {
    return "solved";
  }

  return "discuss";
}

// ===============================
// 6. FALLBACK KHI LỖI
// ===============================
function renderHomeFallback() {
  const docs = document.getElementById("homeFeaturedDocuments");
  const topics = document.getElementById("homeLatestTopics");
  const activity = document.getElementById("homeRecentActivity");

  if (docs) {
    docs.innerHTML = `
      <div class="home-empty-mini">
        Không thể tải tài liệu nổi bật. Kiểm tra MockAPI config.
      </div>
    `;
  }

  if (topics) {
    topics.innerHTML = `
      <div class="home-empty-mini">
        Không thể tải chủ đề diễn đàn.
      </div>
    `;
  }

  if (activity) {
    activity.innerHTML = `
    <div class="home-empty-mini">
      Không thể tải hoạt động mới nhất.
    </div>
  `;
  }
}

// ===============================
// 7. HELPER
// ===============================
function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function getDefaultHomeCover() {
  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200";
}

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
// ===============================
// 8. RECENT ACTIVITY
// ===============================
function renderRecentActivity() {
  const container = document.getElementById("homeRecentActivity");

  if (!container) {
    return;
  }

  const activities = buildRecentActivities();

  container.innerHTML = "";

  if (activities.length === 0) {
    container.innerHTML = `
      <div class="home-empty-mini">
        Chưa có hoạt động nào. Hãy đăng tài liệu hoặc tạo chủ đề đầu tiên nhé.
      </div>
    `;
    return;
  }

  activities.slice(0, 6).forEach(function (activity) {
    const itemHTML = `
      <a href="${activity.link}" class="activity-item">
        <div class="activity-icon ${activity.type}">
          <i class="bi ${activity.icon}"></i>
        </div>

        <div class="activity-content">
          <h6>${escapeHTML(activity.title)}</h6>
          <p>${escapeHTML(activity.description)}</p>
        </div>

        <span class="activity-time">
          ${formatShortDate(activity.createdAt)}
        </span>
      </a>
    `;

    container.insertAdjacentHTML("beforeend", itemHTML);
  });

  $(".activity-item").hide().fadeIn(350);
}

function buildRecentActivities() {
  const activities = [];

  homeDocuments.forEach(function (document) {
    activities.push({
      type: "document",
      icon: "bi-file-earmark-arrow-up",
      title: `${document.authorName || "Người dùng"} vừa đăng tài liệu`,
      description: document.title || "Tài liệu chưa có tiêu đề",
      createdAt: document.createdAt || new Date().toISOString(),
      link: `./document-detail.html?id=${document.id}`,
    });
  });

  homeTopics.forEach(function (topic) {
    activities.push({
      type: "topic",
      icon: "bi-chat-square-text",
      title: `${topic.authorName || "Người dùng"} vừa tạo chủ đề`,
      description: topic.title || "Chủ đề chưa có tiêu đề",
      createdAt: topic.createdAt || new Date().toISOString(),
      link: `./topic-detail.html?id=${topic.id}`,
    });
  });

  homeComments.forEach(function (comment) {
    const targetLabel = getCommentTargetLabel(comment);

    activities.push({
      type: "comment",
      icon: "bi-chat-dots",
      title: `${comment.userName || "Người dùng"} vừa bình luận`,
      description: targetLabel,
      createdAt: comment.createdAt || new Date().toISOString(),
      link: getCommentTargetLink(comment),
    });
  });

  homeReviews.forEach(function (review) {
    const document = findDocumentById(review.documentId);

    activities.push({
      type: "review",
      icon: "bi-star-fill",
      title: `${review.userName || "Người dùng"} vừa đánh giá ${review.rating || 0} sao`,
      description: document
        ? document.title
        : "Một tài liệu học tập",
      createdAt: review.createdAt || new Date().toISOString(),
      link: `./document-detail.html?id=${review.documentId}`,
    });
  });

  activities.sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return activities;
}

function getCommentTargetLabel(comment) {
  if (comment.targetType === "topic") {
    const topic = findTopicById(comment.targetId);

    if (topic) {
      return `Trong chủ đề: ${topic.title}`;
    }

    return "Trong một chủ đề diễn đàn";
  }

  const document = findDocumentById(comment.targetId);

  if (document) {
    return `Trong tài liệu: ${document.title}`;
  }

  return "Trong một tài liệu học tập";
}

function getCommentTargetLink(comment) {
  if (comment.targetType === "topic") {
    return `./topic-detail.html?id=${comment.targetId}`;
  }

  return `./document-detail.html?id=${comment.targetId}`;
}

function findDocumentById(id) {
  return homeDocuments.find(function (document) {
    return String(document.id) === String(id);
  });
}

function findTopicById(id) {
  return homeTopics.find(function (topic) {
    return String(topic.id) === String(id);
  });
}

function formatShortDate(dateString) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return "Gần đây";
  }

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
  });
}