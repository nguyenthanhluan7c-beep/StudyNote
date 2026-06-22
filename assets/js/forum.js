let currentUser = null;
let allTopics = [];
let currentTopics = [];

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  renderAuthNavbar();

  currentUser = getCurrentUser();

  setupForumEvents();
  loadTopics();
});

function setupForumEvents() {
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (backToTop) {
    backToTop.addEventListener("click", scrollToTop);
  }

  window.addEventListener("scroll", handleBackToTopButton);

  document
    .getElementById("openCreateTopicBtn")
    .addEventListener("click", openCreateTopicModal);

  document
    .getElementById("openCreateTopicBtn2")
    .addEventListener("click", openCreateTopicModal);

  document
    .getElementById("refreshTopicsBtn")
    .addEventListener("click", loadTopics);

  document
    .getElementById("createTopicForm")
    .addEventListener("submit", handleCreateTopic);

  document
    .getElementById("topicSearchInput")
    .addEventListener("input", applyTopicFilters);

  document
    .getElementById("topicSubjectFilter")
    .addEventListener("change", applyTopicFilters);

  document
    .getElementById("topicStatusFilter")
    .addEventListener("change", applyTopicFilters);

  document
    .getElementById("topicList")
    .addEventListener("click", handleTopicListClick);
}

async function loadTopics() {
  try {
    showForumError(false);
    showForumEmpty(false);
    renderTopicSkeleton();

    const data = await apiGet(CONFIG.api.topics);

    allTopics = data.map(normalizeTopic);

    updateTopicSubjectFilter();
    applyTopicFilters();
    updateForumStats();
  } catch (error) {
    console.error(error);
    document.getElementById("topicList").innerHTML = "";
    showForumError(true);
  }
}

function normalizeTopic(topic) {
  return {
    id: topic.id,
    title: topic.title || "Chủ đề chưa có tiêu đề",
    content: topic.content || "Chưa có nội dung.",
    subject: topic.subject || "Khác",
    status: topic.status || "Thảo luận",
    authorId: topic.authorId || "",
    authorName: topic.authorName || "Người dùng StudyHub",
    authorAvatar:
      topic.authorAvatar ||
      "https://api.dicebear.com/9.x/initials/svg?seed=StudyHub",
    likeCount: Number(topic.likeCount || 0),
    commentCount: Number(topic.commentCount || 0),
    createdAt: topic.createdAt || new Date().toISOString(),
  };
}

function applyTopicFilters() {
  const keyword = document
    .getElementById("topicSearchInput")
    .value.toLowerCase()
    .trim();

  const subject = document.getElementById("topicSubjectFilter").value;
  const status = document.getElementById("topicStatusFilter").value;

  currentTopics = allTopics.filter(function (topic) {
    const searchText = `
      ${topic.title}
      ${topic.content}
      ${topic.subject}
      ${topic.authorName}
    `.toLowerCase();

    const matchKeyword = searchText.includes(keyword);
    const matchSubject = subject === "all" || topic.subject === subject;
    const matchStatus = status === "all" || topic.status === status;

    return matchKeyword && matchSubject && matchStatus;
  });

  currentTopics.sort(function (a, b) {
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  renderTopics(currentTopics);
  updateTopicResultCount(currentTopics.length);
}

function renderTopics(topics) {
  const topicList = document.getElementById("topicList");

  topicList.innerHTML = "";

  if (topics.length === 0) {
    showForumEmpty(true);
    return;
  }

  showForumEmpty(false);

  topics.forEach(function (topic) {
    const statusClass = getStatusClass(topic.status);

    const itemHTML = `
      <article class="topic-card">
        <div class="topic-head">
          <img
            class="topic-avatar"
            src="${escapeHTML(topic.authorAvatar)}"
            alt="${escapeHTML(topic.authorName)}"
          />

          <div class="topic-main">
            <h3>
              <a href="./topic-detail.html?id=${topic.id}">
                ${escapeHTML(topic.title)}
              </a>
            </h3>

            <p class="topic-content">
              ${escapeHTML(shortText(topic.content, 180))}
            </p>

            <div class="topic-meta">
              <span>
                <i class="bi bi-person"></i>
                ${escapeHTML(topic.authorName)}
              </span>

              <span>
                <i class="bi bi-book"></i>
                ${escapeHTML(topic.subject)}
              </span>

              <span>
                <i class="bi bi-calendar"></i>
                ${formatDate(topic.createdAt)}
              </span>

              <span>
                <i class="bi bi-chat-left-text"></i>
                ${topic.commentCount} bình luận
              </span>
            </div>
          </div>

          <div class="topic-side">
            <span class="topic-status ${statusClass}">
              ${escapeHTML(topic.status)}
            </span>

            <button
              class="like-topic-btn"
              type="button"
              data-id="${topic.id}"
            >
              <i class="bi bi-heart"></i>
              ${topic.likeCount}
            </button>
          </div>
        </div>
      </article>
    `;

    topicList.insertAdjacentHTML("beforeend", itemHTML);
  });

  $(".topic-card").hide().fadeIn(300);
}

function renderTopicSkeleton() {
  const topicList = document.getElementById("topicList");

  let html = "";

  for (let i = 0; i < 4; i++) {
    html += `
      <article class="topic-card">
        <div class="home-loading-line">
          <span class="spinner-border spinner-border-sm"></span>
          Đang tải chủ đề...
        </div>
      </article>
    `;
  }

  topicList.innerHTML = html;
}

function openCreateTopicModal() {
  const topicLoginBox = document.getElementById("topicLoginBox");
  const topicFormContent = document.getElementById("topicFormContent");
  const submitBtn = document.getElementById("createTopicSubmitBtn");

  clearTopicErrors();

  if (!currentUser) {
    topicLoginBox.classList.remove("d-none");
    topicFormContent.classList.add("d-none");
    submitBtn.classList.add("d-none");
  } else {
    topicLoginBox.classList.add("d-none");
    topicFormContent.classList.remove("d-none");
    submitBtn.classList.remove("d-none");
  }

  const modal = new bootstrap.Modal(
    document.getElementById("createTopicModal"),
  );
  modal.show();
}

async function handleCreateTopic(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast("Bạn cần đăng nhập để tạo chủ đề.", "error");
    return;
  }

  if (!validateTopicForm()) {
    showToast("Vui lòng kiểm tra lại nội dung chủ đề.", "error");
    return;
  }

  try {
    setCreateTopicLoading(true);

    const topicData = {
      title: getInputValue("topicTitle"),
      content: getInputValue("topicContent"),
      subject: getInputValue("topicSubject"),
      status: getInputValue("topicStatus"),

      authorId: currentUser.id,
      authorName: getUserDisplayName(currentUser),
      authorAvatar: getUserAvatar(currentUser),

      likeCount: 0,
      commentCount: 0,
      createdAt: new Date().toISOString(),
    };

    const createdTopic = await apiPost(CONFIG.api.topics, topicData);

    allTopics.unshift(normalizeTopic(createdTopic));

    document.getElementById("createTopicForm").reset();

    const modalElement = document.getElementById("createTopicModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
      modal.hide();
    }

    applyTopicFilters();
    updateForumStats();

    showToast("Tạo chủ đề thành công!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể tạo chủ đề.", "error");
  } finally {
    setCreateTopicLoading(false);
  }
}

function validateTopicForm() {
  let isValid = true;

  clearTopicErrors();

  const title = getInputValue("topicTitle");
  const subject = getInputValue("topicSubject");
  const content = getInputValue("topicContent");

  if (title.length < 5) {
    showTopicError("topicTitle", "Tiêu đề phải có ít nhất 5 ký tự.");
    isValid = false;
  }

  if (subject === "") {
    showTopicError("topicSubject", "Vui lòng chọn môn học.");
    isValid = false;
  }

  if (content.length < 15) {
    showTopicError("topicContent", "Nội dung phải có ít nhất 15 ký tự.");
    isValid = false;
  }

  return isValid;
}

async function handleTopicListClick(event) {
  const likeBtn = event.target.closest(".like-topic-btn");

  if (!likeBtn) {
    return;
  }

  const topicId = likeBtn.dataset.id;

  await likeTopic(topicId);
}

async function likeTopic(topicId) {
  const topic = allTopics.find(function (item) {
    return String(item.id) === String(topicId);
  });

  if (!topic) {
    return;
  }

  try {
    const updatedTopic = {
      ...topic,
      likeCount: Number(topic.likeCount || 0) + 1,
    };

    const savedTopic = await apiPut(CONFIG.api.topics, topic.id, updatedTopic);

    allTopics = allTopics.map(function (item) {
      if (String(item.id) === String(topic.id)) {
        return normalizeTopic(savedTopic);
      }

      return item;
    });

    applyTopicFilters();
    updateForumStats();
  } catch (error) {
    console.error(error);
    showToast("Không thể like chủ đề.", "error");
  }
}

function updateTopicSubjectFilter() {
  const select = document.getElementById("topicSubjectFilter");

  const subjects = allTopics.map(function (topic) {
    return topic.subject;
  });

  const uniqueSubjects = [...new Set(subjects)];

  select.innerHTML = `<option value="all">Tất cả môn học</option>`;

  uniqueSubjects.forEach(function (subject) {
    select.insertAdjacentHTML(
      "beforeend",
      `<option value="${escapeHTML(subject)}">${escapeHTML(subject)}</option>`,
    );
  });
}

function updateForumStats() {
  const solvedCount = allTopics.filter(function (topic) {
    return topic.status === "Đã giải quyết";
  }).length;

  const totalLikes = allTopics.reduce(function (sum, topic) {
    return sum + Number(topic.likeCount || 0);
  }, 0);

  setText("totalTopics", allTopics.length);
  setText("solvedTopics", solvedCount);
  setText("totalLikes", totalLikes);
}

function updateTopicResultCount(count) {
  setText("topicResultCount", `${count} kết quả`);
}

function showForumError(isShow) {
  document.getElementById("forumErrorBox").classList.toggle("d-none", !isShow);
}

function showForumEmpty(isShow) {
  document.getElementById("forumEmptyBox").classList.toggle("d-none", !isShow);
}

function showTopicError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  input.classList.add("input-error");
  error.textContent = message;
}

function clearTopicErrors() {
  const inputs = document.querySelectorAll("#createTopicForm .forum-control");
  const errors = document.querySelectorAll("#createTopicForm .error-message");

  inputs.forEach(function (input) {
    input.classList.remove("input-error");
  });

  errors.forEach(function (error) {
    error.textContent = "";
  });
}

function setCreateTopicLoading(isLoading) {
  const btn = document.getElementById("createTopicSubmitBtn");

  if (isLoading) {
    btn.disabled = true;
    btn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      Đang đăng...
    `;
  } else {
    btn.disabled = false;
    btn.innerHTML = `
      <i class="bi bi-send"></i>
      Đăng chủ đề
    `;
  }
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

function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

function getStatusClass(status) {
  if (status === "Đang hỏi") {
    return "asking";
  }

  if (status === "Đã giải quyết") {
    return "solved";
  }

  return "discuss";
}

function setText(id, value) {
  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

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
