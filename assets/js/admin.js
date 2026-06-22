let adminCurrentUser = null;

let adminDocuments = [];
let adminUsers = [];
let adminTopics = [];
let adminComments = [];
let adminReviews = [];

let currentAdminTab = "dashboard";

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  renderAuthNavbar();

  adminCurrentUser = getCurrentUser();

  setupAdminEvents();
  guardAdminPage();
});

// ===============================
// 1. EVENTS
// ===============================
function setupAdminEvents() {
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (backToTop) {
    backToTop.addEventListener("click", scrollToTop);
  }

  window.addEventListener("scroll", handleBackToTopButton);

  document.querySelectorAll(".admin-tab").forEach(function (button) {
    button.addEventListener("click", function () {
      switchAdminTab(button.dataset.tab);
    });
  });

  document
    .getElementById("adminRefreshBtn")
    .addEventListener("click", loadAdminData);

  document
    .getElementById("adminSearchInput")
    .addEventListener("input", renderCurrentTab);

  document
    .getElementById("adminApp")
    .addEventListener("click", handleAdminClick);

  document
    .getElementById("adminApp")
    .addEventListener("change", handleAdminChange);
}

// ===============================
// 2. GUARD ADMIN
// ===============================
async function guardAdminPage() {
  if (!adminCurrentUser) {
    showAdminDenied();
    return;
  }

  try {
    const freshUser = await apiGet(
      `${CONFIG.api.users}/${adminCurrentUser.id}`,
    );

    adminCurrentUser = {
      ...adminCurrentUser,
      ...freshUser,
    };

    setCurrentUser(adminCurrentUser);

    if (adminCurrentUser.role !== "admin") {
      showAdminDenied();
      return;
    }

    showAdminApp();
    loadAdminData();
  } catch (error) {
    console.error("Không kiểm tra được quyền admin:", error);
    showAdminDenied();
  }
}

function showAdminDenied() {
  document.getElementById("adminDenied").classList.remove("d-none");
  document.getElementById("adminApp").classList.add("d-none");
}

function showAdminApp() {
  document.getElementById("adminDenied").classList.add("d-none");
  document.getElementById("adminApp").classList.remove("d-none");

  document.getElementById("adminName").textContent =
    getUserDisplayName(adminCurrentUser);

  document.getElementById("adminAvatar").src = getUserAvatar(adminCurrentUser);
}

// ===============================
// 3. LOAD DATA
// ===============================
async function loadAdminData() {
  try {
    setRefreshLoading(true);

    const results = await Promise.allSettled([
      apiGet(CONFIG.api.documents),
      apiGet(CONFIG.api.users),
      apiGet(CONFIG.api.topics),
      apiGet(CONFIG.api.comments),
      apiGet(CONFIG.api.reviews),
    ]);

    adminDocuments = results[0].status === "fulfilled" ? results[0].value : [];
    adminUsers = results[1].status === "fulfilled" ? results[1].value : [];
    adminTopics = results[2].status === "fulfilled" ? results[2].value : [];
    adminComments = results[3].status === "fulfilled" ? results[3].value : [];
    adminReviews = results[4].status === "fulfilled" ? results[4].value : [];

    renderDashboard();
    renderCurrentTab();

    showToast("Đã tải dữ liệu admin.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể tải dữ liệu admin.", "error");
  } finally {
    setRefreshLoading(false);
  }
}

// ===============================
// 4. TAB
// ===============================
function switchAdminTab(tab) {
  currentAdminTab = tab;

  document.querySelectorAll(".admin-tab").forEach(function (button) {
    button.classList.toggle("active", button.dataset.tab === tab);
  });

  document.querySelectorAll(".admin-panel").forEach(function (panel) {
    panel.classList.remove("active");
  });

  document.getElementById(tab + "Panel").classList.add("active");
  document.getElementById("adminSearchInput").value = "";

  renderCurrentTab();
}

function renderCurrentTab() {
  if (currentAdminTab === "dashboard") {
    renderDashboard();
  }

  if (currentAdminTab === "documents") {
    renderDocumentsTable();
  }

  if (currentAdminTab === "users") {
    renderUsersTable();
  }

  if (currentAdminTab === "topics") {
    renderTopicsTable();
  }

  if (currentAdminTab === "comments") {
    renderCommentsTable();
  }

  if (currentAdminTab === "reviews") {
    renderReviewsTable();
  }
}

function getAdminKeyword() {
  return document.getElementById("adminSearchInput").value.toLowerCase().trim();
}

// ===============================
// 5. DASHBOARD
// ===============================
function renderDashboard() {
  const totalDownloads = adminDocuments.reduce(function (sum, document) {
    return sum + Number(document.downloadCount || 0);
  }, 0);

  setText("adminTotalDocuments", adminDocuments.length);
  setText("adminTotalUsers", adminUsers.length);
  setText("adminTotalTopics", adminTopics.length);
  setText("adminTotalComments", adminComments.length);
  setText("adminTotalReviews", adminReviews.length);
  setText("adminTotalDownloads", totalDownloads);

  renderRecentAdminList();
}

function renderRecentAdminList() {
  const list = document.getElementById("adminRecentList");
  const activities = [];

  adminDocuments.forEach(function (document) {
    activities.push({
      icon: "bi-file-earmark-arrow-up",
      title: "Tài liệu mới",
      desc: document.title || "Tài liệu chưa có tiêu đề",
      createdAt: document.createdAt || new Date().toISOString(),
    });
  });

  adminTopics.forEach(function (topic) {
    activities.push({
      icon: "bi-chat-square-text",
      title: "Chủ đề mới",
      desc: topic.title || "Chủ đề chưa có tiêu đề",
      createdAt: topic.createdAt || new Date().toISOString(),
    });
  });

  adminComments.forEach(function (comment) {
    activities.push({
      icon: "bi-chat-dots",
      title: "Bình luận mới",
      desc: `${comment.userName || "Người dùng"}: ${shortText(comment.content, 70)}`,
      createdAt: comment.createdAt || new Date().toISOString(),
    });
  });

  adminReviews.forEach(function (review) {
    activities.push({
      icon: "bi-star-fill",
      title: "Đánh giá mới",
      desc: `${review.userName || "Người dùng"} đánh giá ${review.rating || 0} sao`,
      createdAt: review.createdAt || new Date().toISOString(),
    });
  });

  activities.sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  list.innerHTML = "";

  if (activities.length === 0) {
    list.innerHTML = `<p class="text-muted mb-0">Chưa có hoạt động nào.</p>`;
    return;
  }

  activities.slice(0, 10).forEach(function (item) {
    list.insertAdjacentHTML(
      "beforeend",
      `
        <div class="admin-recent-item">
          <i class="bi ${item.icon}"></i>

          <div>
            <strong>${escapeHTML(item.title)}</strong>
            <span>${escapeHTML(item.desc)} · ${formatDate(item.createdAt)}</span>
          </div>
        </div>
      `,
    );
  });
}

// ===============================
// 6. DOCUMENTS TABLE
// ===============================
function renderDocumentsTable() {
  const tbody = document.getElementById("adminDocumentsBody");
  const keyword = getAdminKeyword();

  const documents = adminDocuments
    .filter(function (document) {
      const text = `
        ${document.title}
        ${document.description}
        ${document.subject}
        ${document.category}
        ${document.authorName}
      `.toLowerCase();

      return text.includes(keyword);
    })
    .sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  tbody.innerHTML = "";

  if (documents.length === 0) {
    tbody.innerHTML = getEmptyRowHTML(6, "Không có tài liệu phù hợp.");
    return;
  }

  documents.forEach(function (document) {
    tbody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>
            <div class="admin-table-item">
              <img
                src="${escapeHTML(document.coverImage || getDefaultCover())}"
                alt="${escapeHTML(document.title)}"
                onerror="this.src='${getDefaultCover()}'"
              />

              <div>
                <div class="admin-table-title">
                  ${escapeHTML(document.title || "Tài liệu chưa có tiêu đề")}
                </div>
                <span class="admin-table-sub">
                  ${escapeHTML(shortText(document.description || "", 60))}
                </span>
              </div>
            </div>
          </td>

          <td>${escapeHTML(document.authorName || "Không rõ")}</td>
          <td>${escapeHTML(document.subject || "Khác")}</td>

          <td>
            <b>${Number(document.viewCount || 0)}</b>
            /
            <b>${Number(document.downloadCount || 0)}</b>
          </td>

          <td>${formatDate(document.createdAt)}</td>

          <td>
            <div class="admin-actions">
              <a href="./document-detail.html?id=${document.id}" class="btn btn-ghost btn-sm">
                <i class="bi bi-eye"></i>
                Xem
              </a>

              <a href="./document-detail.html?id=${document.id}&edit=true" class="btn btn-warning-soft btn-sm">
                <i class="bi bi-pencil-square"></i>
                Sửa
              </a>

              <button
                class="btn btn-danger-soft btn-sm"
                type="button"
                data-admin-action="delete-document"
                data-id="${document.id}"
              >
                <i class="bi bi-trash"></i>
                Xóa
              </button>
            </div>
          </td>
        </tr>
      `,
    );
  });
}

// ===============================
// 7. USERS TABLE
// ===============================
function renderUsersTable() {
  const tbody = document.getElementById("adminUsersBody");
  const keyword = getAdminKeyword();

  const users = adminUsers.filter(function (user) {
    const text = `
      ${user.fullName}
      ${user.displayName}
      ${user.email}
      ${user.role}
    `.toLowerCase();

    return text.includes(keyword);
  });

  tbody.innerHTML = "";

  if (users.length === 0) {
    tbody.innerHTML = getEmptyRowHTML(5, "Không có người dùng phù hợp.");
    return;
  }

  users.forEach(function (user) {
    const role = user.role || "student";
    const isCurrentAdmin = String(user.id) === String(adminCurrentUser.id);

    tbody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>
            <div class="admin-table-item user">
              <img
                src="${escapeHTML(getSafeUserAvatar(user))}"
                alt="${escapeHTML(user.displayName || user.fullName || user.email)}"
              />

              <div>
                <div class="admin-table-title">
                  ${escapeHTML(user.displayName || user.fullName || "Người dùng")}
                </div>
                <span class="admin-table-sub">ID: ${escapeHTML(user.id)}</span>
              </div>
            </div>
          </td>

          <td>${escapeHTML(user.email || "Không có email")}</td>

          <td>
            <select
              class="form-select admin-role-select"
              data-admin-change="user-role"
              data-id="${user.id}"
              ${isCurrentAdmin ? "disabled" : ""}
            >
              <option value="student" ${role === "student" ? "selected" : ""}>student</option>
              <option value="admin" ${role === "admin" ? "selected" : ""}>admin</option>
            </select>
          </td>

          <td>${formatDate(user.createdAt)}</td>

          <td>
            <div class="admin-actions">
              <span class="admin-badge ${role === "admin" ? "admin" : "student"}">
                <i class="bi bi-person-badge"></i>
                ${escapeHTML(role)}
              </span>

              <button
                class="btn btn-danger-soft btn-sm"
                type="button"
                data-admin-action="delete-user"
                data-id="${user.id}"
                ${isCurrentAdmin ? "disabled" : ""}
              >
                <i class="bi bi-trash"></i>
                Xóa
              </button>
            </div>
          </td>
        </tr>
      `,
    );
  });
}

// ===============================
// 8. TOPICS TABLE
// ===============================
function renderTopicsTable() {
  const tbody = document.getElementById("adminTopicsBody");
  const keyword = getAdminKeyword();

  const topics = adminTopics
    .filter(function (topic) {
      const text = `
        ${topic.title}
        ${topic.content}
        ${topic.subject}
        ${topic.status}
        ${topic.authorName}
      `.toLowerCase();

      return text.includes(keyword);
    })
    .sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  tbody.innerHTML = "";

  if (topics.length === 0) {
    tbody.innerHTML = getEmptyRowHTML(6, "Không có chủ đề phù hợp.");
    return;
  }

  topics.forEach(function (topic) {
    tbody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>
            <div class="admin-table-title">
              ${escapeHTML(topic.title || "Chủ đề chưa có tiêu đề")}
            </div>
            <span class="admin-table-sub">
              ${escapeHTML(shortText(topic.content || "", 75))}
            </span>
          </td>

          <td>${escapeHTML(topic.authorName || "Không rõ")}</td>
          <td>${escapeHTML(topic.subject || "Khác")}</td>

          <td>
            <select
              class="form-select admin-status-select"
              data-admin-change="topic-status"
              data-id="${topic.id}"
            >
              <option value="Đang hỏi" ${topic.status === "Đang hỏi" ? "selected" : ""}>
                Đang hỏi
              </option>
              <option value="Thảo luận" ${topic.status === "Thảo luận" ? "selected" : ""}>
                Thảo luận
              </option>
              <option value="Đã giải quyết" ${topic.status === "Đã giải quyết" ? "selected" : ""}>
                Đã giải quyết
              </option>
            </select>
          </td>

          <td>
            <b>${Number(topic.likeCount || 0)}</b>
            /
            <b>${Number(topic.commentCount || 0)}</b>
          </td>

          <td>
            <div class="admin-actions">
              <a href="./topic-detail.html?id=${topic.id}" class="btn btn-ghost btn-sm">
                <i class="bi bi-eye"></i>
                Xem
              </a>

              <button
                class="btn btn-danger-soft btn-sm"
                type="button"
                data-admin-action="delete-topic"
                data-id="${topic.id}"
              >
                <i class="bi bi-trash"></i>
                Xóa
              </button>
            </div>
          </td>
        </tr>
      `,
    );
  });
}

// ===============================
// 9. COMMENTS TABLE
// ===============================
function renderCommentsTable() {
  const tbody = document.getElementById("adminCommentsBody");
  const keyword = getAdminKeyword();

  const comments = adminComments
    .filter(function (comment) {
      const text = `
        ${comment.content}
        ${comment.userName}
        ${comment.targetType}
        ${comment.targetId}
      `.toLowerCase();

      return text.includes(keyword);
    })
    .sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  tbody.innerHTML = "";

  if (comments.length === 0) {
    tbody.innerHTML = getEmptyRowHTML(5, "Không có bình luận phù hợp.");
    return;
  }

  comments.forEach(function (comment) {
    const isReply = Boolean(comment.parentId);

    tbody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>
            <div class="admin-table-title">
              ${escapeHTML(shortText(comment.content || "", 90))}
            </div>
            <span class="admin-table-sub">
              ${isReply ? "Reply" : "Comment gốc"} · targetId: ${escapeHTML(comment.targetId)}
            </span>
          </td>

          <td>${escapeHTML(comment.userName || "Không rõ")}</td>

          <td>
            <span class="admin-badge comment">
              ${escapeHTML(comment.targetType || "unknown")}
            </span>
          </td>

          <td>${formatDate(comment.createdAt)}</td>

          <td>
            <div class="admin-actions">
              <a href="${getCommentTargetLink(comment)}" class="btn btn-ghost btn-sm">
                <i class="bi bi-eye"></i>
                Xem
              </a>

              <button
                class="btn btn-danger-soft btn-sm"
                type="button"
                data-admin-action="delete-comment"
                data-id="${comment.id}"
              >
                <i class="bi bi-trash"></i>
                Xóa
              </button>
            </div>
          </td>
        </tr>
      `,
    );
  });
}

// ===============================
// 10. REVIEWS TABLE
// ===============================
function renderReviewsTable() {
  const tbody = document.getElementById("adminReviewsBody");
  const keyword = getAdminKeyword();

  const reviews = adminReviews
    .filter(function (review) {
      const document = findAdminDocumentById(review.documentId);

      const text = `
        ${review.comment}
        ${review.userName}
        ${review.rating}
        ${review.documentId}
        ${document ? document.title : ""}
      `.toLowerCase();

      return text.includes(keyword);
    })
    .sort(function (a, b) {
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  tbody.innerHTML = "";

  if (reviews.length === 0) {
    tbody.innerHTML = getEmptyRowHTML(6, "Không có đánh giá phù hợp.");
    return;
  }

  reviews.forEach(function (review) {
    const document = findAdminDocumentById(review.documentId);

    tbody.insertAdjacentHTML(
      "beforeend",
      `
        <tr>
          <td>
            <div class="admin-table-title">
              ${escapeHTML(shortText(review.comment || "Không có nội dung", 90))}
            </div>
            <span class="admin-table-sub">Review ID: ${escapeHTML(review.id)}</span>
          </td>

          <td>${escapeHTML(review.userName || "Không rõ")}</td>

          <td>
            ${
              document
                ? `<a href="./document-detail.html?id=${document.id}" class="admin-table-title">
                    ${escapeHTML(shortText(document.title, 45))}
                  </a>`
                : `<span class="text-muted">Không tìm thấy tài liệu</span>`
            }
          </td>

          <td>
            <span class="admin-stars">
              ${renderAdminStars(Number(review.rating || 0))}
            </span>
          </td>

          <td>${formatDate(review.createdAt)}</td>

          <td>
            <div class="admin-actions">
              <a href="./document-detail.html?id=${review.documentId}" class="btn btn-ghost btn-sm">
                <i class="bi bi-eye"></i>
                Xem
              </a>

              <button
                class="btn btn-danger-soft btn-sm"
                type="button"
                data-admin-action="delete-review"
                data-id="${review.id}"
              >
                <i class="bi bi-trash"></i>
                Xóa
              </button>
            </div>
          </td>
        </tr>
      `,
    );
  });
}

// ===============================
// 11. CLICK ACTIONS
// ===============================
async function handleAdminClick(event) {
  const button = event.target.closest("[data-admin-action]");

  if (!button) {
    return;
  }

  const action = button.dataset.adminAction;
  const id = button.dataset.id;

  if (action === "delete-document") {
    await deleteDocumentByAdmin(id);
  }

  if (action === "delete-user") {
    await deleteUserByAdmin(id);
  }

  if (action === "delete-topic") {
    await deleteTopicByAdmin(id);
  }

  if (action === "delete-comment") {
    await deleteCommentByAdmin(id);
  }

  if (action === "delete-review") {
    await deleteReviewByAdmin(id);
  }
}

async function handleAdminChange(event) {
  const select = event.target.closest("[data-admin-change]");

  if (!select) {
    return;
  }

  const changeType = select.dataset.adminChange;
  const id = select.dataset.id;

  if (changeType === "user-role") {
    await updateUserRoleByAdmin(id, select.value);
  }

  if (changeType === "topic-status") {
    await updateTopicStatusByAdmin(id, select.value);
  }
}

// ===============================
// 12. CRUD ACTIONS
// ===============================
async function deleteDocumentByAdmin(documentId) {
  const documentItem = adminDocuments.find(function (item) {
    return String(item.id) === String(documentId);
  });

  const ok = confirm(
    `Xóa tài liệu "${documentItem?.title || documentId}" khỏi MockAPI?`,
  );

  if (!ok) {
    return;
  }

  try {
    await apiDelete(CONFIG.api.documents, documentId);

    adminDocuments = adminDocuments.filter(function (item) {
      return String(item.id) !== String(documentId);
    });

    renderDashboard();
    renderDocumentsTable();

    showToast("Đã xóa tài liệu.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể xóa tài liệu.", "error");
  }
}

async function deleteUserByAdmin(userId) {
  if (String(userId) === String(adminCurrentUser.id)) {
    showToast("Không thể xóa chính tài khoản admin đang dùng.", "error");
    return;
  }

  const user = adminUsers.find(function (item) {
    return String(item.id) === String(userId);
  });

  const ok = confirm(`Xóa user "${user?.email || userId}" khỏi MockAPI?`);

  if (!ok) {
    return;
  }

  try {
    await apiDelete(CONFIG.api.users, userId);

    adminUsers = adminUsers.filter(function (item) {
      return String(item.id) !== String(userId);
    });

    renderDashboard();
    renderUsersTable();

    showToast("Đã xóa người dùng.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể xóa người dùng.", "error");
  }
}

async function deleteTopicByAdmin(topicId) {
  const topic = adminTopics.find(function (item) {
    return String(item.id) === String(topicId);
  });

  const ok = confirm(`Xóa topic "${topic?.title || topicId}" khỏi MockAPI?`);

  if (!ok) {
    return;
  }

  try {
    await apiDelete(CONFIG.api.topics, topicId);

    adminTopics = adminTopics.filter(function (item) {
      return String(item.id) !== String(topicId);
    });

    renderDashboard();
    renderTopicsTable();

    showToast("Đã xóa topic.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể xóa topic.", "error");
  }
}

async function deleteCommentByAdmin(commentId) {
  const ok = confirm("Xóa bình luận này khỏi MockAPI?");

  if (!ok) {
    return;
  }

  try {
    await apiDelete(CONFIG.api.comments, commentId);

    adminComments = adminComments.filter(function (item) {
      return String(item.id) !== String(commentId);
    });

    renderDashboard();
    renderCommentsTable();

    showToast("Đã xóa bình luận.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể xóa bình luận.", "error");
  }
}

async function deleteReviewByAdmin(reviewId) {
  const ok = confirm("Xóa đánh giá này khỏi MockAPI?");

  if (!ok) {
    return;
  }

  try {
    await apiDelete(CONFIG.api.reviews, reviewId);

    adminReviews = adminReviews.filter(function (item) {
      return String(item.id) !== String(reviewId);
    });

    renderDashboard();
    renderReviewsTable();

    showToast("Đã xóa đánh giá.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể xóa đánh giá.", "error");
  }
}

async function updateUserRoleByAdmin(userId, newRole) {
  const user = adminUsers.find(function (item) {
    return String(item.id) === String(userId);
  });

  if (!user) {
    return;
  }

  try {
    const updatedUser = {
      ...user,
      role: newRole,
      updatedAt: new Date().toISOString(),
    };

    const savedUser = await apiPut(CONFIG.api.users, userId, updatedUser);

    adminUsers = adminUsers.map(function (item) {
      if (String(item.id) === String(userId)) {
        return savedUser;
      }

      return item;
    });

    renderUsersTable();

    showToast("Đã cập nhật role người dùng.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể cập nhật role.", "error");
  }
}

async function updateTopicStatusByAdmin(topicId, newStatus) {
  const topic = adminTopics.find(function (item) {
    return String(item.id) === String(topicId);
  });

  if (!topic) {
    return;
  }

  try {
    const updatedTopic = {
      ...topic,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    const savedTopic = await apiPut(CONFIG.api.topics, topicId, updatedTopic);

    adminTopics = adminTopics.map(function (item) {
      if (String(item.id) === String(topicId)) {
        return savedTopic;
      }

      return item;
    });

    showToast("Đã cập nhật trạng thái topic.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể cập nhật topic.", "error");
  }
}

// ===============================
// 13. HELPERS
// ===============================
function findAdminDocumentById(documentId) {
  return adminDocuments.find(function (document) {
    return String(document.id) === String(documentId);
  });
}

function getCommentTargetLink(comment) {
  if (comment.targetType === "topic") {
    return `./topic-detail.html?id=${comment.targetId}`;
  }

  return `./document-detail.html?id=${comment.targetId}`;
}

function getSafeUserAvatar(user) {
  if (user.avatar) {
    return user.avatar;
  }

  const seed = user.displayName || user.fullName || user.email || "StudyHub";

  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
}

function getDefaultCover() {
  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200";
}

function renderAdminStars(rating) {
  let html = "";

  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      html += `<i class="bi bi-star-fill"></i>`;
    } else {
      html += `<i class="bi bi-star"></i>`;
    }
  }

  return html;
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

function setRefreshLoading(isLoading) {
  const button = document.getElementById("adminRefreshBtn");

  if (isLoading) {
    button.disabled = true;
    button.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      Đang tải...
    `;
  } else {
    button.disabled = false;
    button.innerHTML = `
      <i class="bi bi-arrow-clockwise"></i>
      Tải lại dữ liệu
    `;
  }
}

function getEmptyRowHTML(colspan, message) {
  return `
    <tr>
      <td colspan="${colspan}">
        <div class="text-center text-muted py-4">
          ${message}
        </div>
      </td>
    </tr>
  `;
}

function shortText(text, maxLength) {
  const safeText = String(text || "");

  if (safeText.length <= maxLength) {
    return safeText;
  }

  return safeText.slice(0, maxLength) + "...";
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
