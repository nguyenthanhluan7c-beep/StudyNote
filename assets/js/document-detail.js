let currentUser = null;
let currentDocument = null;
let documentId = null;

let reviews = [];
let comments = [];
let selectedRating = 0;

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  renderAuthNavbar();

  currentUser = getCurrentUser();
  documentId = getDocumentIdFromUrl();

  setupDetailEvents();
  loadDocumentDetail();
});

function setupDetailEvents() {
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
    .getElementById("downloadBtn")
    .addEventListener("click", handleDownloadClick);
  document
    .getElementById("reviewForm")
    .addEventListener("submit", handleReviewSubmit);
  document
    .getElementById("commentForm")
    .addEventListener("submit", handleCommentSubmit);
  document
    .getElementById("commentList")
    .addEventListener("click", handleCommentListClick);
  document
    .getElementById("editDocumentBtn")
    .addEventListener("click", openEditModal);
  document
    .getElementById("deleteDocumentBtn")
    .addEventListener("click", openDeleteModal);
  document
    .getElementById("editDocumentForm")
    .addEventListener("submit", handleEditSubmit);
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", handleDeleteDocument);

  document.querySelectorAll("#ratingPicker button").forEach(function (button) {
    button.addEventListener("click", function () {
      selectedRating = Number(this.dataset.rating);
      renderRatingPicker();
    });
  });
}

function getDocumentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function loadDocumentDetail() {
  if (!documentId || documentId === "undefined" || documentId === "null") {
    showError("Thiếu ID tài liệu trên đường dẫn.");
    return;
  }

  try {
    showLoading(true);

    // Chỉ lỗi đoạn này mới được coi là không tìm thấy tài liệu
    currentDocument = await apiGet(`${CONFIG.api.documents}/${documentId}`);
  } catch (error) {
    console.error("Lỗi tải document:", error);
    showError("Không tải được thông tin tài liệu từ MockAPI.");
    showLoading(false);
    return;
  }

  // Tăng lượt xem: lỗi thì bỏ qua, không được làm sập trang
  try {
    await increaseViewCount();
  } catch (error) {
    console.warn("Không thể tăng lượt xem:", error);
  }

  // Review/comment lỗi thì vẫn render tài liệu
  const extraResults = await Promise.allSettled([
    loadReviews(),
    loadComments(),
  ]);

  if (extraResults[0].status === "rejected") {
    console.warn("Không tải được reviews:", extraResults[0].reason);
    reviews = [];
  }

  if (extraResults[1].status === "rejected") {
    console.warn("Không tải được comments:", extraResults[1].reason);
    comments = [];
  }

  renderDocument();
  renderAuthBlocks();
  showLoading(false);
  openEditModalFromQuery();
}

async function increaseViewCount() {
  const updatedDocument = {
    ...currentDocument,
    viewCount: Number(currentDocument.viewCount || 0) + 1,
  };

  currentDocument = await apiPut(
    CONFIG.api.documents,
    currentDocument.id,
    updatedDocument,
  );
}

async function loadReviews() {
  reviews = await apiGet(CONFIG.api.reviews, {
    documentId: documentId,
  });
}

async function loadComments() {
  comments = await apiGet(CONFIG.api.comments, {
    targetType: "document",
    targetId: documentId,
  });
}

function renderDocument() {
  document.getElementById("detailContent").classList.remove("d-none");

  document.getElementById("documentCover").src =
    currentDocument.coverImage ||
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200";

  document.getElementById("documentSubject").textContent =
    currentDocument.subject || "Khác";

  document.getElementById("documentTitle").textContent =
    currentDocument.title || "Tài liệu chưa có tiêu đề";

  document.getElementById("documentDescription").textContent =
    currentDocument.description || "Chưa có mô tả.";

  document.getElementById("authorAvatar").src =
    currentDocument.authorAvatar ||
    "https://api.dicebear.com/9.x/initials/svg?seed=StudyHub";

  document.getElementById("authorName").textContent =
    currentDocument.authorName || "Người dùng StudyHub";

  document.getElementById("viewCount").textContent = Number(
    currentDocument.viewCount || 0,
  );

  document.getElementById("downloadCount").textContent = Number(
    currentDocument.downloadCount || 0,
  );

  document.getElementById("commentCount").textContent = comments.length;

  document.getElementById("documentCategory").textContent =
    currentDocument.category || "Tài liệu học tập";

  document.getElementById("documentDate").textContent = formatDate(
    currentDocument.createdAt,
  );

  document.getElementById("documentFormat").textContent = String(
    currentDocument.fileFormat || "file",
  ).toUpperCase();

  document.getElementById("openFileBtn").href = currentDocument.fileUrl || "#";

  renderAverageRating();
  renderReviews();
  renderComments();
  renderOwnerActions();
}

function renderAuthBlocks() {
  const reviewLoginBox = document.getElementById("reviewLoginBox");
  const commentLoginBox = document.getElementById("commentLoginBox");
  const reviewForm = document.getElementById("reviewForm");
  const commentForm = document.getElementById("commentForm");

  if (!currentUser) {
    reviewLoginBox.classList.remove("d-none");
    commentLoginBox.classList.remove("d-none");

    reviewForm.classList.add("d-none");
    commentForm.classList.add("d-none");
    return;
  }

  reviewLoginBox.classList.add("d-none");
  commentLoginBox.classList.add("d-none");

  reviewForm.classList.remove("d-none");
  commentForm.classList.remove("d-none");
}

async function handleDownloadClick() {
  if (!currentDocument) {
    return;
  }

  try {
    const updatedDocument = {
      ...currentDocument,
      downloadCount: Number(currentDocument.downloadCount || 0) + 1,
    };

    currentDocument = await apiPut(
      CONFIG.api.documents,
      currentDocument.id,
      updatedDocument,
    );

    document.getElementById("downloadCount").textContent = Number(
      currentDocument.downloadCount || 0,
    );

    showToast("Đã ghi nhận lượt tải. Đang mở tài liệu...", "success");

    setTimeout(function () {
      window.open(currentDocument.fileUrl, "_blank");
    }, 400);
  } catch (error) {
    console.error(error);
    showToast("Không thể cập nhật lượt tải.", "error");
  }
}

async function handleReviewSubmit(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast("Bạn cần đăng nhập để đánh giá.", "error");
    return;
  }

  const comment = document.getElementById("reviewComment").value.trim();

  if (selectedRating === 0) {
    document.getElementById("reviewError").textContent =
      "Vui lòng chọn số sao.";
    return;
  }

  if (comment.length < 5) {
    document.getElementById("reviewError").textContent =
      "Nhận xét phải có ít nhất 5 ký tự.";
    return;
  }

  try {
    document.getElementById("reviewError").textContent = "";

    const reviewData = {
      documentId: documentId,
      userId: currentUser.id,
      userName: getUserDisplayName(currentUser),
      userAvatar: getUserAvatar(currentUser),
      rating: selectedRating,
      comment: comment,
      createdAt: new Date().toISOString(),
    };

    const createdReview = await apiPost(CONFIG.api.reviews, reviewData);

    reviews.unshift(createdReview);

    selectedRating = 0;
    document.getElementById("reviewComment").value = "";

    renderRatingPicker();
    renderAverageRating();
    renderReviews();

    showToast("Gửi đánh giá thành công!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể gửi đánh giá.", "error");
  }
}

async function handleCommentSubmit(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast("Bạn cần đăng nhập để bình luận.", "error");
    return;
  }

  const content = document.getElementById("commentContent").value.trim();

  if (content.length < 3) {
    document.getElementById("commentError").textContent =
      "Bình luận phải có ít nhất 3 ký tự.";
    return;
  }

  try {
    document.getElementById("commentError").textContent = "";

    const commentData = {
      targetType: "document",
      targetId: documentId,

      // null nghĩa là bình luận gốc, không phải reply
      parentId: null,

      userId: currentUser.id,
      userName: getUserDisplayName(currentUser),
      userAvatar: getUserAvatar(currentUser),
      content: content,
      createdAt: new Date().toISOString(),
    };

    const createdComment = await apiPost(CONFIG.api.comments, commentData);

    comments.unshift(createdComment);

    document.getElementById("commentContent").value = "";

    renderComments();

    document.getElementById("commentCount").textContent = comments.length;

    showToast("Gửi bình luận thành công!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể gửi bình luận.", "error");
  }
}

function renderRatingPicker() {
  document.querySelectorAll("#ratingPicker button").forEach(function (button) {
    const rating = Number(button.dataset.rating);
    const icon = button.querySelector("i");

    if (rating <= selectedRating) {
      button.classList.add("active");
      icon.className = "bi bi-star-fill";
    } else {
      button.classList.remove("active");
      icon.className = "bi bi-star";
    }
  });
}

function renderAverageRating() {
  if (reviews.length === 0) {
    document.getElementById("averageRating").textContent = "0.0";
    return;
  }

  const total = reviews.reduce(function (sum, review) {
    return sum + Number(review.rating || 0);
  }, 0);

  const average = total / reviews.length;

  document.getElementById("averageRating").textContent = average.toFixed(1);
}

function renderReviews() {
  const reviewList = document.getElementById("reviewList");

  reviewList.innerHTML = "";

  if (reviews.length === 0) {
    reviewList.innerHTML = `
      <div class="review-item">
        <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá tài liệu này.</p>
      </div>
    `;
    return;
  }

  reviews
    .sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .forEach(function (review) {
      const itemHTML = `
        <div class="review-item">
          <div class="item-user">
            <img src="${escapeHTML(review.userAvatar)}" alt="${escapeHTML(review.userName)}" />
            <div>
              <strong>${escapeHTML(review.userName)}</strong>
              <span>${formatDate(review.createdAt)}</span>
            </div>
          </div>

          <div class="review-stars">
            ${renderStars(Number(review.rating || 0))}
          </div>

          <p>${escapeHTML(review.comment)}</p>
        </div>
      `;

      reviewList.insertAdjacentHTML("beforeend", itemHTML);
    });

  $(".review-item").hide().fadeIn(250);
}

function renderComments() {
  const commentList = document.getElementById("commentList");

  commentList.innerHTML = "";

  if (comments.length === 0) {
    commentList.innerHTML = `
      <div class="comment-item">
        <p>Chưa có bình luận nào. Hãy đặt câu hỏi hoặc góp ý về tài liệu này.</p>
      </div>
    `;
    return;
  }

  const parentComments = comments
    .filter(function (comment) {
      return !comment.parentId;
    })
    .sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

  parentComments.forEach(function (comment) {
    const replies = comments
      .filter(function (reply) {
        return String(reply.parentId) === String(comment.id);
      })
      .sort(function (a, b) {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });

    const itemHTML = `
      <div class="comment-thread">
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
            class="form-control detail-control reply-input"
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

    commentList.insertAdjacentHTML("beforeend", itemHTML);
  });

  $(".comment-thread").hide().fadeIn(250);
}
function renderCommentItem(comment, isReply) {
  const replyClass = isReply
    ? "comment-item comment-reply-item"
    : "comment-item";

  const replyButtonHTML =
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
    <div class="${replyClass}">
      <div class="item-user">
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
        ${replyButtonHTML}
      </div>
    </div>
  `;
}
function handleCommentListClick(event) {
  const replyToggleBtn = event.target.closest(".reply-toggle-btn");
  const submitReplyBtn = event.target.closest(".submit-reply-btn");
  const cancelReplyBtn = event.target.closest(".cancel-reply-btn");

  if (replyToggleBtn) {
    const parentId = replyToggleBtn.dataset.parentId;
    toggleReplyBox(parentId);
    return;
  }

  if (submitReplyBtn) {
    const parentId = submitReplyBtn.dataset.parentId;
    handleReplySubmit(parentId);
    return;
  }

  if (cancelReplyBtn) {
    const parentId = cancelReplyBtn.dataset.parentId;
    hideReplyBox(parentId);
  }
}

function toggleReplyBox(parentId) {
  if (!currentUser) {
    showToast("Bạn cần đăng nhập để phản hồi bình luận.", "error");
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

  const input = replyBox.querySelector(".reply-input");
  const error = replyBox.querySelector(".reply-error");

  input.value = "";
  error.textContent = "";
}
async function handleReplySubmit(parentId) {
  if (!currentUser) {
    showToast("Bạn cần đăng nhập để phản hồi bình luận.", "error");
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
      targetType: "document",
      targetId: documentId,

      // Đây là điểm quan trọng: reply trỏ về comment cha
      parentId: parentId,

      userId: currentUser.id,
      userName: getUserDisplayName(currentUser),
      userAvatar: getUserAvatar(currentUser),
      content: content,
      createdAt: new Date().toISOString(),
    };

    const createdReply = await apiPost(CONFIG.api.comments, replyData);

    comments.push(createdReply);

    renderComments();

    document.getElementById("commentCount").textContent = comments.length;

    showToast("Đã gửi phản hồi!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể gửi phản hồi.", "error");
  }
}

function renderStars(rating) {
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

function showLoading(isShow) {
  const loadingBox = document.getElementById("loadingBox");

  if (isShow) {
    loadingBox.classList.remove("d-none");
  } else {
    loadingBox.classList.add("d-none");
  }
}

function showError(
  message = "Tài liệu có thể đã bị xóa hoặc đường dẫn không hợp lệ.",
) {
  document.getElementById("loadingBox").classList.add("d-none");
  document.getElementById("detailContent").classList.add("d-none");
  document.getElementById("errorBox").classList.remove("d-none");

  const errorText = document.querySelector("#errorBox p");

  if (errorText) {
    errorText.textContent = message;
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
function isDocumentOwner() {
  if (!currentUser || !currentDocument) {
    return false;
  }

  return String(currentUser.id) === String(currentDocument.authorId);
}

function renderOwnerActions() {
  const ownerActions = document.getElementById("ownerActions");

  if (!ownerActions) {
    return;
  }

  if (isDocumentOwner()) {
    ownerActions.classList.remove("d-none");
  } else {
    ownerActions.classList.add("d-none");
  }
}
function openEditModal() {
  if (!isDocumentOwner()) {
    showToast("Bạn không có quyền sửa tài liệu này.", "error");
    return;
  }

  document.getElementById("editTitle").value = currentDocument.title || "";
  document.getElementById("editSubject").value = currentDocument.subject || "";
  document.getElementById("editCategory").value =
    currentDocument.category || "";
  document.getElementById("editDescription").value =
    currentDocument.description || "";
  document.getElementById("editCoverFile").value = "";

  clearEditErrors();

  const modal = new bootstrap.Modal(
    document.getElementById("editDocumentModal"),
  );
  modal.show();
}
function validateEditForm() {
  let isValid = true;

  clearEditErrors();

  const title = document.getElementById("editTitle").value.trim();
  const subject = document.getElementById("editSubject").value.trim();
  const category = document.getElementById("editCategory").value.trim();
  const description = document.getElementById("editDescription").value.trim();
  const coverFile = document.getElementById("editCoverFile").files[0];

  if (title.length < 5) {
    showEditError("editTitle", "Tên tài liệu phải có ít nhất 5 ký tự.");
    isValid = false;
  }

  if (subject === "") {
    showEditError("editSubject", "Vui lòng chọn môn học.");
    isValid = false;
  }

  if (category === "") {
    showEditError("editCategory", "Vui lòng chọn danh mục.");
    isValid = false;
  }

  if (description.length < 20) {
    showEditError("editDescription", "Mô tả phải có ít nhất 20 ký tự.");
    isValid = false;
  }

  if (coverFile && !coverFile.type.startsWith("image/")) {
    showEditError("editCoverFile", "Ảnh preview mới phải là file ảnh.");
    isValid = false;
  }

  return isValid;
}

function showEditError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  if (input) {
    input.classList.add("input-error");
  }

  if (error) {
    error.textContent = message;
  }
}

function clearEditErrors() {
  const inputs = document.querySelectorAll("#editDocumentForm .detail-control");
  const errors = document.querySelectorAll("#editDocumentForm .error-message");

  inputs.forEach(function (input) {
    input.classList.remove("input-error");
  });

  errors.forEach(function (error) {
    error.textContent = "";
  });
}
async function handleEditSubmit(event) {
  event.preventDefault();

  if (!isDocumentOwner()) {
    showToast("Bạn không có quyền sửa tài liệu này.", "error");
    return;
  }

  if (!validateEditForm()) {
    showToast("Vui lòng kiểm tra lại thông tin chỉnh sửa.", "error");
    return;
  }

  const saveBtn = document.getElementById("saveEditBtn");
  const coverFile = document.getElementById("editCoverFile").files[0];

  try {
    setEditLoading(true);

    let newCoverImage = currentDocument.coverImage;
    let newCoverSource = currentDocument.coverSource || "old-cover";

    if (coverFile) {
      showToast("Đang upload ảnh preview mới...", "info");

      const uploadedCover = await uploadToCloudinary(coverFile, "image");

      newCoverImage = uploadedCover.secure_url;
      newCoverSource = "custom-edited";
    }

    const updatedDocument = {
      ...currentDocument,

      title: document.getElementById("editTitle").value.trim(),
      subject: document.getElementById("editSubject").value.trim(),
      category: document.getElementById("editCategory").value.trim(),
      description: document.getElementById("editDescription").value.trim(),

      coverImage: newCoverImage,
      coverSource: newCoverSource,

      updatedAt: new Date().toISOString(),
    };

    currentDocument = await apiPut(
      CONFIG.api.documents,
      currentDocument.id,
      updatedDocument,
    );

    renderDocument();

    const modalElement = document.getElementById("editDocumentModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
      modal.hide();
    }

    showToast("Cập nhật tài liệu thành công!", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể cập nhật tài liệu: " + error.message, "error");
  } finally {
    setEditLoading(false);
  }
}

function setEditLoading(isLoading) {
  const saveBtn = document.getElementById("saveEditBtn");

  if (isLoading) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      Đang lưu...
    `;
  } else {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `
      <i class="bi bi-save"></i>
      Lưu thay đổi
    `;
  }
}
function openDeleteModal() {
  if (!isDocumentOwner()) {
    showToast("Bạn không có quyền xóa tài liệu này.", "error");
    return;
  }

  const modal = new bootstrap.Modal(
    document.getElementById("deleteDocumentModal"),
  );
  modal.show();
}
async function handleDeleteDocument() {
  if (!isDocumentOwner()) {
    showToast("Bạn không có quyền xóa tài liệu này.", "error");
    return;
  }

  const deleteBtn = document.getElementById("confirmDeleteBtn");

  try {
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      Đang xóa...
    `;

    await apiDelete(CONFIG.api.documents, currentDocument.id);

    showToast("Xóa tài liệu thành công!", "success");

    setTimeout(function () {
      window.location.href = "./documents.html";
    }, 900);
  } catch (error) {
    console.error(error);
    showToast("Không thể xóa tài liệu.", "error");
  } finally {
    deleteBtn.disabled = false;
    deleteBtn.innerHTML = `
      <i class="bi bi-trash"></i>
      Xóa tài liệu
    `;
  }
}
function openEditModalFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const shouldOpenEdit = params.get("edit") === "true";

  if (!shouldOpenEdit) {
    return;
  }

  if (!isDocumentOwner()) {
    showToast("Bạn không có quyền sửa tài liệu này.", "error");
    return;
  }

  setTimeout(function () {
    openEditModal();
  }, 300);
}