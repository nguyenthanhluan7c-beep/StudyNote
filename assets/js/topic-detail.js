let currentUser = null;
let currentTopic = null;
let topicId = null;
let topicComments = [];

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  renderAuthNavbar();

  currentUser = getCurrentUser();
  topicId = getTopicIdFromUrl();

  setupTopicDetailEvents();
  loadTopicDetail();
});

function setupTopicDetailEvents() {
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
    .getElementById("likeTopicBtn")
    .addEventListener("click", handleLikeTopic);

  document
    .getElementById("topicCommentForm")
    .addEventListener("submit", handleTopicCommentSubmit);

  document
    .getElementById("topicCommentList")
    .addEventListener("click", handleCommentListClick);

  document
    .getElementById("ownerStatusSelect")
    .addEventListener("change", handleStatusChange);
}

function getTopicIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadTopicDetail() {
  if (!topicId || topicId === "undefined" || topicId === "null") {
    showTopicError();
    return;
  }

  try {
    showLoading(true);

    currentTopic = await apiGet(`${CONFIG.api.topics}/${topicId}`);
  } catch (error) {
    console.error("Lỗi tải topic:", error);
    showTopicError();
    showLoading(false);
    return;
  }

  try {
    await loadTopicComments();
  } catch (error) {
    console.warn("Không tải được comment topic:", error);
    topicComments = [];
  }

  renderTopic();
  renderCommentAuthState();
  renderTopicComments();

  showLoading(false);
}

async function loadTopicComments() {
  topicComments = await apiGet(CONFIG.api.comments, {
    targetType: "topic",
    targetId: topicId,
  });
}

function renderTopic() {
  document.getElementById("topicContentBox").classList.remove("d-none");

  document.getElementById("topicTitleText").textContent =
    currentTopic.title || "Chủ đề chưa có tiêu đề";

  document.getElementById("topicBodyText").textContent =
    currentTopic.content || "Chưa có nội dung.";

  document.getElementById("topicAuthorAvatar").src =
    currentTopic.authorAvatar ||
    "https://api.dicebear.com/9.x/initials/svg?seed=StudyHub";

  document.getElementById("topicAuthorName").textContent =
    currentTopic.authorName || "Người dùng StudyHub";

  document.getElementById("topicCreatedAt").textContent = formatDate(
    currentTopic.createdAt,
  );

  document.getElementById("topicSubjectText").textContent =
    currentTopic.subject || "Khác";

  document.getElementById("topicLikeCount").textContent = Number(
    currentTopic.likeCount || 0,
  );

  document.getElementById("topicCommentCount").textContent =
    topicComments.length;

  renderStatusBadge();
  renderOwnerStatusBox();
}

function renderStatusBadge() {
  const badge = document.getElementById("topicStatusBadge");
  const status = currentTopic.status || "Thảo luận";

  badge.textContent = status;
  badge.className = `topic-status ${getStatusClass(status)}`;
}

function renderOwnerStatusBox() {
  const ownerStatusBox = document.getElementById("ownerStatusBox");
  const select = document.getElementById("ownerStatusSelect");

  if (isTopicOwner()) {
    ownerStatusBox.classList.remove("d-none");
    select.value = currentTopic.status || "Thảo luận";
  } else {
    ownerStatusBox.classList.add("d-none");
  }
}

function isTopicOwner() {
  if (!currentUser || !currentTopic) {
    return false;
  }

  return String(currentUser.id) === String(currentTopic.authorId);
}

function renderCommentAuthState() {
  const loginBox = document.getElementById("topicCommentLoginBox");
  const form = document.getElementById("topicCommentForm");

  if (!currentUser) {
    loginBox.classList.remove("d-none");
    form.classList.add("d-none");
    return;
  }

  loginBox.classList.add("d-none");
  form.classList.remove("d-none");
}

async function handleLikeTopic() {
  if (!currentTopic) {
    return;
  }

  try {
    const updatedTopic = {
      ...currentTopic,
      likeCount: Number(currentTopic.likeCount || 0) + 1,
    };

    currentTopic = await apiPut(
      CONFIG.api.topics,
      currentTopic.id,
      updatedTopic,
    );

    document.getElementById("topicLikeCount").textContent = Number(
      currentTopic.likeCount || 0,
    );

    showToast("Đã thích chủ đề!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể like chủ đề.", "error");
  }
}

async function handleStatusChange() {
  if (!isTopicOwner()) {
    showToast("Bạn không có quyền đổi trạng thái chủ đề này.", "error");
    return;
  }

  const newStatus = document.getElementById("ownerStatusSelect").value;

  try {
    const updatedTopic = {
      ...currentTopic,
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    currentTopic = await apiPut(
      CONFIG.api.topics,
      currentTopic.id,
      updatedTopic,
    );

    renderStatusBadge();

    showToast("Đã cập nhật trạng thái chủ đề!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể cập nhật trạng thái.", "error");
  }
}

async function handleTopicCommentSubmit(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast("Bạn cần đăng nhập để bình luận.", "error");
    return;
  }

  const content = document.getElementById("topicCommentInput").value.trim();

  if (content.length < 3) {
    document.getElementById("topicCommentError").textContent =
      "Bình luận phải có ít nhất 3 ký tự.";
    return;
  }

  try {
    document.getElementById("topicCommentError").textContent = "";

    const commentData = {
      targetType: "topic",
      targetId: topicId,
      parentId: null,

      userId: currentUser.id,
      userName: getUserDisplayName(currentUser),
      userAvatar: getUserAvatar(currentUser),
      content: content,
      createdAt: new Date().toISOString(),
    };

    const createdComment = await apiPost(CONFIG.api.comments, commentData);

    topicComments.unshift(createdComment);

    document.getElementById("topicCommentInput").value = "";

    await updateTopicCommentCount();

    renderTopicComments();

    showToast("Gửi bình luận thành công!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể gửi bình luận.", "error");
  }
}

async function updateTopicCommentCount() {
  try {
    const updatedTopic = {
      ...currentTopic,
      commentCount: topicComments.length,
    };

    currentTopic = await apiPut(
      CONFIG.api.topics,
      currentTopic.id,
      updatedTopic,
    );

    document.getElementById("topicCommentCount").textContent =
      topicComments.length;
  } catch (error) {
    console.warn("Không cập nhật được commentCount topic:", error);
  }
}

function renderTopicComments() {
  const list = document.getElementById("topicCommentList");

  list.innerHTML = "";

  if (topicComments.length === 0) {
    list.innerHTML = `
      <div class="topic-comment-item">
        <p>Chưa có bình luận nào. Hãy là người đầu tiên phản hồi chủ đề này.</p>
      </div>
    `;
    return;
  }

  const parentComments = topicComments
    .filter(function (comment) {
      return !comment.parentId;
    })
    .sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  parentComments.forEach(function (comment) {
    const replies = topicComments
      .filter(function (reply) {
        return String(reply.parentId) === String(comment.id);
      })
      .sort(function (a, b) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    const html = `
      <div class="topic-comment-thread">
        ${renderCommentItem(comment, false)}

        <div class="reply-list">
          ${replies
            .map(function (reply) {
              return renderCommentItem(reply, true);
            })
            .join("")}
        </div>

        <div id="replyBox-${comment.id}" class="reply-box d-none">
          <textarea
            class="form-control topic-control reply-input"
            rows="3"
            placeholder="Viết phản hồi của bạn..."
          ></textarea>

          <small class="error-message reply-error"></small>

          <div class="reply-actions">
            <button
              class="btn btn-main btn-sm submit-reply-btn"
              type="button"
              data-parent-id="${comment.id}"
            >
              <i class="bi bi-send"></i>
              Gửi phản hồi
            </button>

            <button
              class="btn btn-ghost btn-sm cancel-reply-btn"
              type="button"
              data-parent-id="${comment.id}"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    `;

    list.insertAdjacentHTML("beforeend", html);
  });

  $(".topic-comment-thread").hide().fadeIn(250);
}

function renderCommentItem(comment, isReply) {
  const className = isReply
    ? "topic-comment-item topic-comment-reply"
    : "topic-comment-item";

  const replyButton =
    !isReply && currentUser
      ? `
        <button
          class="reply-toggle-btn"
          type="button"
          data-parent-id="${comment.id}"
        >
          <i class="bi bi-reply"></i>
          Trả lời
        </button>
      `
      : "";

  return `
    <div class="${className}">
      <div class="comment-user">
        <img
          src="${escapeHTML(comment.userAvatar)}"
          alt="${escapeHTML(comment.userName)}"
        />

        <div>
          <strong>${escapeHTML(comment.userName)}</strong>
          <span>${formatDate(comment.createdAt)}</span>
        </div>
      </div>

      <p>${escapeHTML(comment.content)}</p>

      <div class="comment-tools">
        ${replyButton}
      </div>
    </div>
  `;
}

function handleCommentListClick(event) {
  const replyToggleBtn = event.target.closest(".reply-toggle-btn");
  const submitReplyBtn = event.target.closest(".submit-reply-btn");
  const cancelReplyBtn = event.target.closest(".cancel-reply-btn");

  if (replyToggleBtn) {
    toggleReplyBox(replyToggleBtn.dataset.parentId);
    return;
  }

  if (submitReplyBtn) {
    handleReplySubmit(submitReplyBtn.dataset.parentId);
    return;
  }

  if (cancelReplyBtn) {
    hideReplyBox(cancelReplyBtn.dataset.parentId);
  }
}

function toggleReplyBox(parentId) {
  if (!currentUser) {
    showToast("Bạn cần đăng nhập để phản hồi.", "error");
    return;
  }

  const replyBox = document.getElementById(`replyBox-${parentId}`);

  if (!replyBox) {
    return;
  }

  replyBox.classList.toggle("d-none");

  const input = replyBox.querySelector(".reply-input");

  if (!replyBox.classList.contains("d-none")) {
    input.focus();
  }
}

function hideReplyBox(parentId) {
  const replyBox = document.getElementById(`replyBox-${parentId}`);

  if (!replyBox) {
    return;
  }

  replyBox.classList.add("d-none");

  replyBox.querySelector(".reply-input").value = "";
  replyBox.querySelector(".reply-error").textContent = "";
}

async function handleReplySubmit(parentId) {
  if (!currentUser) {
    showToast("Bạn cần đăng nhập để phản hồi.", "error");
    return;
  }

  const replyBox = document.getElementById(`replyBox-${parentId}`);
  const input = replyBox.querySelector(".reply-input");
  const error = replyBox.querySelector(".reply-error");

  const content = input.value.trim();

  if (content.length < 3) {
    error.textContent = "Phản hồi phải có ít nhất 3 ký tự.";
    return;
  }

  try {
    error.textContent = "";

    const replyData = {
      targetType: "topic",
      targetId: topicId,
      parentId: parentId,

      userId: currentUser.id,
      userName: getUserDisplayName(currentUser),
      userAvatar: getUserAvatar(currentUser),
      content: content,
      createdAt: new Date().toISOString(),
    };

    const createdReply = await apiPost(CONFIG.api.comments, replyData);

    topicComments.push(createdReply);

    await updateTopicCommentCount();

    renderTopicComments();

    showToast("Đã gửi phản hồi!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể gửi phản hồi.", "error");
  }
}

function showLoading(isShow) {
  const loading = document.getElementById("topicLoadingBox");

  if (isShow) {
    loading.classList.remove("d-none");
  } else {
    loading.classList.add("d-none");
  }
}

function showTopicError() {
  document.getElementById("topicLoadingBox").classList.add("d-none");
  document.getElementById("topicContentBox").classList.add("d-none");
  document.getElementById("topicErrorBox").classList.remove("d-none");
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

function getStatusClass(status) {
  if (status === "Đang hỏi") {
    return "asking";
  }

  if (status === "Đã giải quyết") {
    return "solved";
  }

  return "discuss";
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
