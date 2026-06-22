// ===============================
// PROFILE.JS
// Trang cá nhân + crop avatar + Cloudinary
// ===============================

let currentUser = null;
let myDocuments = [];

let selectedImage = new Image();
let selectedFileName = "avatar.png";

let cropState = {
  zoom: 1,
  offsetX: 0,
  offsetY: 0,
};

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  renderAuthNavbar();
  loadProfileUser();
  setupProfileEvents();
});

function setupProfileEvents() {
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
    .getElementById("chooseAvatarBtn")
    .addEventListener("click", openFilePicker);
  document
    .getElementById("chooseAvatarBtn2")
    .addEventListener("click", openFilePicker);
  document
    .getElementById("avatarInput")
    .addEventListener("change", handleAvatarFile);

  document
    .getElementById("zoomRange")
    .addEventListener("input", updateCropFromControls);
  document
    .getElementById("offsetXRange")
    .addEventListener("input", updateCropFromControls);
  document
    .getElementById("offsetYRange")
    .addEventListener("input", updateCropFromControls);

  document
    .getElementById("saveAvatarBtn")
    .addEventListener("click", saveAvatarToCloudinary);
  document
    .getElementById("myDocumentList")
    .addEventListener("click", handleProfileDocumentClick);
}

function loadProfileUser() {
  currentUser = getCurrentUser();

  const profileContent = document.getElementById("profileContent");
  const loginRequired = document.getElementById("loginRequiredProfile");

  if (!currentUser) {
    profileContent.classList.add("d-none");
    loginRequired.classList.remove("d-none");
    return;
  }

  profileContent.classList.remove("d-none");
  loginRequired.classList.add("d-none");

  renderProfile();
  loadMyDocuments();
}

function renderProfile() {
  document.getElementById("profileAvatar").src = getUserAvatar(currentUser);
  document.getElementById("profileDisplayName").textContent =
    getUserDisplayName(currentUser);
  document.getElementById("profileEmail").textContent = currentUser.email || "";
  document.getElementById("profileFullName").textContent =
    currentUser.fullName || "---";
  document.getElementById("profileNameValue").textContent =
    getUserDisplayName(currentUser);
  document.getElementById("profileEmailValue").textContent =
    currentUser.email || "---";
  document.getElementById("profileRole").textContent =
    currentUser.role || "student";
}

// ===============================
// LOAD TÀI LIỆU CỦA USER
// ===============================
async function loadMyDocuments() {
  try {
    const allDocuments = await apiGet(CONFIG.api.documents);

    myDocuments = allDocuments.filter(function (document) {
      return String(document.authorId) === String(currentUser.id);
    });

    updateProfileStats();
    renderMyDocuments();
  } catch (error) {
    console.error(error);
    showToast("Không thể tải tài liệu của bạn.", "error");
  }
}

function updateProfileStats() {
  const totalViews = myDocuments.reduce(function (sum, document) {
    return sum + Number(document.viewCount || 0);
  }, 0);

  const totalDownloads = myDocuments.reduce(function (sum, document) {
    return sum + Number(document.downloadCount || 0);
  }, 0);

  document.getElementById("myDocumentCount").textContent = myDocuments.length;
  document.getElementById("myViewCount").textContent = totalViews;
  document.getElementById("myDownloadCount").textContent = totalDownloads;
}

function renderMyDocuments() {
  const list = document.getElementById("myDocumentList");
  const empty = document.getElementById("myDocumentEmpty");

  list.innerHTML = "";

  if (myDocuments.length === 0) {
    empty.classList.remove("d-none");
    return;
  }

  empty.classList.add("d-none");

  const recentDocuments = [...myDocuments]
    .sort(function (a, b) {
      return new Date(b.createdAt) - new Date(a.createdAt);
    })
    .slice(0, 4);

  recentDocuments.forEach(function (document) {
    const itemHTML = `
  <div class="my-document-item" data-id="${document.id}">
    <img
      src="${escapeHTML(document.coverImage)}"
      alt="${escapeHTML(document.title)}"
      onerror="this.src='https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200'"
    />

    <div>
      <h5>${escapeHTML(document.title || "Tài liệu chưa có tiêu đề")}</h5>
      <p>
        ${escapeHTML(document.subject || "Khác")}
        · ${Number(document.viewCount || 0)} lượt xem
        · ${Number(document.downloadCount || 0)} lượt tải
      </p>
    </div>

    <div class="my-document-actions">
      <a href="./document-detail.html?id=${document.id}" class="btn btn-ghost btn-sm">
        <i class="bi bi-eye"></i>
        Xem
      </a>

      <a href="./document-detail.html?id=${document.id}&edit=true" class="btn btn-warning-soft btn-sm">
        <i class="bi bi-pencil-square"></i>
        Sửa
      </a>

      <button
        class="btn btn-danger-soft btn-sm profile-delete-doc-btn"
        type="button"
        data-id="${document.id}"
      >
        <i class="bi bi-trash"></i>
        Xóa
      </button>
    </div>
  </div>
`;

    list.insertAdjacentHTML("beforeend", itemHTML);
  });

  $(".my-document-item").hide().fadeIn(300);
}

// ===============================
// AVATAR CROP
// ===============================
function openFilePicker() {
  if (!currentUser) {
    showToast("Bạn cần đăng nhập trước.", "error");
    return;
  }

  document.getElementById("avatarInput").click();
}

function handleAvatarFile(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("Vui lòng chọn file ảnh.", "error");
    return;
  }

  selectedFileName = file.name || "avatar.png";

  const reader = new FileReader();

  reader.onload = function (e) {
    selectedImage = new Image();

    selectedImage.onload = function () {
      resetCropControls();
      drawCropCanvas();

      const modal = new bootstrap.Modal(
        document.getElementById("avatarCropModal"),
      );
      modal.show();
    };

    selectedImage.src = e.target.result;
  };

  reader.readAsDataURL(file);
}

function resetCropControls() {
  cropState = {
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
  };

  document.getElementById("zoomRange").value = 1;
  document.getElementById("offsetXRange").value = 0;
  document.getElementById("offsetYRange").value = 0;
}

function updateCropFromControls() {
  cropState.zoom = Number(document.getElementById("zoomRange").value);
  cropState.offsetX = Number(document.getElementById("offsetXRange").value);
  cropState.offsetY = Number(document.getElementById("offsetYRange").value);

  drawCropCanvas();
}

function drawCropCanvas() {
  const canvas = document.getElementById("cropCanvas");
  const ctx = canvas.getContext("2d");

  const size = canvas.width;

  ctx.clearRect(0, 0, size, size);

  if (!selectedImage.src) {
    return;
  }

  const baseScale = Math.max(
    size / selectedImage.width,
    size / selectedImage.height,
  );
  const finalScale = baseScale * cropState.zoom;

  const drawWidth = selectedImage.width * finalScale;
  const drawHeight = selectedImage.height * finalScale;

  const x = (size - drawWidth) / 2 + cropState.offsetX;
  const y = (size - drawHeight) / 2 + cropState.offsetY;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);

  ctx.drawImage(selectedImage, x, y, drawWidth, drawHeight);
}

async function saveAvatarToCloudinary() {
  try {
    setSaveAvatarLoading(true);

    const blob = await getCroppedAvatarBlob();

    const avatarFile = new File([blob], selectedFileName, {
      type: "image/png",
    });

    const uploadedAvatar = await uploadToCloudinary(avatarFile, "image");

    const updatedUser = {
      ...currentUser,
      avatar: uploadedAvatar.secure_url,
    };

    await apiPut(CONFIG.api.users, currentUser.id, updatedUser);

    setCurrentUser(updatedUser);
    currentUser = updatedUser;

    renderProfile();
    renderAuthNavbar();

    const modalElement = document.getElementById("avatarCropModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) {
      modal.hide();
    }

    showToast("Cập nhật ảnh đại diện thành công!", "success");
  } catch (error) {
    console.error(error);
    showToast("Upload avatar thất bại: " + error.message, "error");
  } finally {
    setSaveAvatarLoading(false);
  }
}

function getCroppedAvatarBlob() {
  const canvas = document.getElementById("cropCanvas");

  return new Promise(function (resolve) {
    canvas.toBlob(
      function (blob) {
        resolve(blob);
      },
      "image/png",
      0.92,
    );
  });
}

function setSaveAvatarLoading(isLoading) {
  const saveBtn = document.getElementById("saveAvatarBtn");

  if (isLoading) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      Đang lưu...
    `;
  } else {
    saveBtn.disabled = false;
    saveBtn.innerHTML = `
      <i class="bi bi-cloud-upload"></i>
      Lưu ảnh đại diện
    `;
  }
}
function handleProfileDocumentClick(event) {
  const deleteBtn = event.target.closest(".profile-delete-doc-btn");

  if (!deleteBtn) {
    return;
  }

  const documentId = deleteBtn.dataset.id;

  deleteMyDocument(documentId);
}

async function deleteMyDocument(documentId) {
  const documentItem = myDocuments.find(function (document) {
    return String(document.id) === String(documentId);
  });

  if (!documentItem) {
    showToast("Không tìm thấy tài liệu cần xóa.", "error");
    return;
  }

  const isConfirm = confirm(
    `Bạn có chắc muốn xóa tài liệu "${documentItem.title}" không?`,
  );

  if (!isConfirm) {
    return;
  }

  try {
    await apiDelete(CONFIG.api.documents, documentId);

    myDocuments = myDocuments.filter(function (document) {
      return String(document.id) !== String(documentId);
    });

    updateProfileStats();
    renderMyDocuments();

    showToast("Đã xóa tài liệu khỏi MockAPI.", "success");
  } catch (error) {
    console.error(error);
    showToast("Không thể xóa tài liệu.", "error");
  }
}

// ===============================
// TOAST + HELPER
// ===============================
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

function escapeHTML(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
