// ===============================
// UPLOAD.JS
// Trang đăng tài liệu
// ===============================

let currentUser = null;

let selectedDocumentFile = null;
let selectedCoverImageFile = null;

let localDocumentPreviewUrl = "";
let localCoverPreviewUrl = "";

document.addEventListener("DOMContentLoaded", function () {
  loadTheme();
  renderAuthNavbar();
  loadCurrentUser();
  setupUploadEvents();
  updatePreview();
});

// ===============================
// 1. LẤY USER ĐANG ĐĂNG NHẬP
// ===============================
function loadCurrentUser() {
  currentUser = getCurrentUser();
  renderCurrentUserState();
}

function renderCurrentUserState() {
  const uploadForm = document.getElementById("uploadForm");
  const loginRequiredBox = document.getElementById("loginRequiredBox");
  const currentUserBox = document.getElementById("currentUserBox");
  const currentUserAvatar = document.getElementById("currentUserAvatar");
  const currentUserName = document.getElementById("currentUserName");

  if (!currentUser) {
    uploadForm.classList.add("locked");
    loginRequiredBox.classList.remove("d-none");
    currentUserBox.classList.add("d-none");
    return;
  }

  uploadForm.classList.remove("locked");
  loginRequiredBox.classList.add("d-none");
  currentUserBox.classList.remove("d-none");

  currentUserName.textContent =
    currentUser.displayName || currentUser.fullName || "Người dùng StudyHub";

  currentUserAvatar.src = getCurrentUserAvatar();
}

// ===============================
// 2. GẮN SỰ KIỆN
// ===============================
function setupUploadEvents() {
  const themeToggle = document.getElementById("themeToggle");
  const backToTop = document.getElementById("backToTop");
  const uploadForm = document.getElementById("uploadForm");
  const resetBtn = document.getElementById("resetBtn");

  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }

  if (backToTop) {
    backToTop.addEventListener("click", scrollToTop);
  }

  if (uploadForm) {
    uploadForm.addEventListener("submit", handleUploadSubmit);
  }

  if (resetBtn) {
    resetBtn.addEventListener("click", resetUploadForm);
  }

  window.addEventListener("scroll", handleBackToTopButton);

  $("#uploadForm input, #uploadForm textarea, #uploadForm select").on(
    "input change",
    function () {
      updatePreview();
    },
  );

  document
    .getElementById("documentFile")
    .addEventListener("change", handleDocumentFileChange);

  document
    .getElementById("coverImageFile")
    .addEventListener("change", handleCoverImageFileChange);
}

// ===============================
// 3. CHỌN FILE
// ===============================
function handleDocumentFileChange(event) {
  const file = event.target.files[0];

  selectedDocumentFile = file || null;

  const nameBox = document.getElementById("documentFileName");
  const labelBox = document.querySelector('label[for="documentFile"]');

  if (!file) {
    nameBox.textContent = "Chọn file tài liệu";
    labelBox.classList.remove("file-selected");
    localDocumentPreviewUrl = "";
    updatePreview();
    return;
  }

  nameBox.textContent = file.name;
  labelBox.classList.add("file-selected");

  if (file.type.startsWith("image/")) {
    localDocumentPreviewUrl = URL.createObjectURL(file);
  } else {
    localDocumentPreviewUrl = "";
  }

  updatePreview();
}

function handleCoverImageFileChange(event) {
  const file = event.target.files[0];

  selectedCoverImageFile = file || null;

  const nameBox = document.getElementById("coverImageFileName");
  const labelBox = document.querySelector('label[for="coverImageFile"]');

  if (!file) {
    nameBox.textContent = "Chọn ảnh preview riêng";
    labelBox.classList.remove("file-selected");
    localCoverPreviewUrl = "";
    updatePreview();
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("File preview phải là ảnh.", "error");
    event.target.value = "";
    selectedCoverImageFile = null;
    localCoverPreviewUrl = "";
    updatePreview();
    return;
  }

  nameBox.textContent = file.name;
  labelBox.classList.add("file-selected");

  localCoverPreviewUrl = URL.createObjectURL(file);

  updatePreview();
}

// ===============================
// 4. XỬ LÝ SUBMIT FORM
// ===============================
async function handleUploadSubmit(event) {
  event.preventDefault();

  if (!currentUser) {
    showToast("Bạn cần đăng nhập trước khi đăng tài liệu.", "error");
    return;
  }

  if (!validateUploadForm()) {
    showToast("Vui lòng kiểm tra lại thông tin tài liệu.", "error");
    return;
  }

  try {
    setSubmitLoading(true);

    // 1. Upload file tài liệu
    showToast("Đang upload file tài liệu lên Cloudinary...", "info");

    const uploadedDocument = await uploadToCloudinary(
      selectedDocumentFile,
      "auto",
    );

    // 2. Xử lý ảnh preview
    let coverImageUrl = "";
    let coverSource = "";

    if (selectedCoverImageFile) {
      const uploadedCover = await uploadToCloudinary(
        selectedCoverImageFile,
        "image",
      );

      coverImageUrl = uploadedCover.secure_url;
      coverSource = "custom";
    } else {
      const autoCover = getAutoCoverImage(
        uploadedDocument,
        selectedDocumentFile,
      );

      coverImageUrl = autoCover.url;
      coverSource = autoCover.source;
    }

    // 3. Tạo dữ liệu document để POST lên MockAPI
    const documentData = {
      title: getInputValue("title"),
      subject: getInputValue("subject"),
      category: getInputValue("category"),
      description: getInputValue("description"),

      coverImage: coverImageUrl,
      coverSource: coverSource,

      fileUrl: uploadedDocument.secure_url,
      filePublicId: uploadedDocument.public_id,
      fileResourceType: uploadedDocument.resource_type,
      fileFormat:
        uploadedDocument.format || getFileExtension(selectedDocumentFile.name),
      fileOriginalName: selectedDocumentFile.name,
      fileSize: selectedDocumentFile.size,

      authorId: currentUser.id,
      authorName:
        currentUser.displayName ||
        currentUser.fullName ||
        "Người dùng StudyHub",
      authorAvatar: getCurrentUserAvatar(),

      viewCount: 0,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
    };

    await apiPost(CONFIG.api.documents, documentData);

    showToast("Đăng tài liệu thành công!", "success");

    resetUploadForm();

    setTimeout(function () {
      window.location.href = "./documents.html";
    }, 900);
  } catch (error) {
    console.error(error);
    showToast("Đăng tài liệu thất bại: " + error.message, "error");
  } finally {
    setSubmitLoading(false);
  }
}

// ===============================
// 5. TỰ TẠO COVER NẾU USER KHÔNG CHỌN
// ===============================
function getAutoCoverImage(uploadedDocument, file) {
  const subject = getInputValue("subject");

  if (file.type.startsWith("image/")) {
    return {
      url: uploadedDocument.secure_url,
      source: "document-image",
    };
  }

  if (isPdfFile(file)) {
    return {
      url: buildPdfFirstPagePreview(uploadedDocument.public_id),
      source: "pdf-first-page",
    };
  }

  return {
    url: getDefaultCoverBySubject(subject),
    source: "default-subject-cover",
  };
}

function isPdfFile(file) {
  return (
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")
  );
}

// ===============================
// 6. VALIDATE FORM
// ===============================
function validateUploadForm() {
  let isValid = true;

  clearAllErrors();

  const title = getInputValue("title");
  const subject = getInputValue("subject");
  const category = getInputValue("category");
  const description = getInputValue("description");

  if (title.length < 5) {
    showInputError("title", "Tên tài liệu phải có ít nhất 5 ký tự.");
    isValid = false;
  } else {
    showInputSuccess("title");
  }

  if (subject === "") {
    showInputError("subject", "Vui lòng chọn môn học.");
    isValid = false;
  } else {
    showInputSuccess("subject");
  }

  if (category === "") {
    showInputError("category", "Vui lòng chọn danh mục.");
    isValid = false;
  } else {
    showInputSuccess("category");
  }

  if (!selectedDocumentFile) {
    showInputError("documentFile", "Vui lòng chọn file tài liệu.");
    isValid = false;
  } else {
    clearInputError("documentFile");
  }

  if (
    selectedCoverImageFile &&
    !selectedCoverImageFile.type.startsWith("image/")
  ) {
    showInputError("coverImageFile", "Ảnh preview phải là file ảnh.");
    isValid = false;
  } else {
    clearInputError("coverImageFile");
  }

  if (description.length < 20) {
    showInputError("description", "Mô tả phải có ít nhất 20 ký tự.");
    isValid = false;
  } else {
    showInputSuccess("description");
  }

  return isValid;
}

// ===============================
// 7. PREVIEW CARD
// ===============================
function updatePreview() {
  const title = getInputValue("title") || "Tên tài liệu sẽ hiển thị tại đây";
  const subject = getInputValue("subject") || "Môn học";
  const description =
    getInputValue("description") ||
    "Mô tả ngắn của tài liệu sẽ được cập nhật khi bạn nhập form.";

  const authorName = currentUser
    ? currentUser.displayName || currentUser.fullName || "Người dùng StudyHub"
    : "Chưa đăng nhập";

  const avatar = currentUser
    ? getCurrentUserAvatar()
    : "https://api.dicebear.com/9.x/initials/svg?seed=Guest";

  document.getElementById("previewTitle").textContent = title;
  document.getElementById("previewSubject").textContent = subject;
  document.getElementById("previewDesc").textContent = shortPreviewText(
    description,
    120,
  );
  document.getElementById("previewAuthor").textContent = authorName;
  document.getElementById("previewAvatar").src = avatar;

  const previewCover = document.getElementById("previewCover");

  let previewImage = "";

  if (localCoverPreviewUrl) {
    previewImage = localCoverPreviewUrl;
  } else if (localDocumentPreviewUrl) {
    previewImage = localDocumentPreviewUrl;
  } else if (selectedDocumentFile && isPdfFile(selectedDocumentFile)) {
    previewCover.removeAttribute("style");
    previewCover.innerHTML = `<i class="bi bi-file-earmark-pdf"></i>`;
    return;
  } else {
    previewImage = getDefaultCoverBySubject(subject);
  }

  previewCover.style.background = `
    linear-gradient(135deg, rgba(37, 99, 235, 0.35), rgba(124, 58, 237, 0.35)),
    url("${previewImage}")
  `;
  previewCover.style.backgroundSize = "cover";
  previewCover.style.backgroundPosition = "center";
  previewCover.innerHTML = "";
}

// ===============================
// 8. RESET FORM
// ===============================
function resetUploadForm() {
  const uploadForm = document.getElementById("uploadForm");

  uploadForm.reset();

  selectedDocumentFile = null;
  selectedCoverImageFile = null;
  localDocumentPreviewUrl = "";
  localCoverPreviewUrl = "";

  document.getElementById("documentFileName").textContent =
    "Chọn file tài liệu";
  document.getElementById("coverImageFileName").textContent =
    "Chọn ảnh preview riêng";

  const documentLabel = document.querySelector('label[for="documentFile"]');
  const coverLabel = document.querySelector('label[for="coverImageFile"]');

  if (documentLabel) documentLabel.classList.remove("file-selected");
  if (coverLabel) coverLabel.classList.remove("file-selected");

  clearAllErrors();
  updatePreview();

  showToast("Đã làm mới form.", "info");
}

// ===============================
// 9. TOAST
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

// ===============================
// 10. HÀM PHỤ TRỢ FORM
// ===============================
function getInputValue(id) {
  return document.getElementById(id).value.trim();
}

function getCurrentUserAvatar() {
  return getUserAvatar(currentUser);
}

function showInputError(inputId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  if (input) {
    input.classList.add("input-error");
    input.classList.remove("input-success");
  }

  if (error) {
    error.textContent = message;
  }
}

function showInputSuccess(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  if (input) {
    input.classList.remove("input-error");
    input.classList.add("input-success");
  }

  if (error) {
    error.textContent = "";
  }
}

function clearInputError(inputId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(inputId + "Error");

  if (input) {
    input.classList.remove("input-error");
    input.classList.remove("input-success");
  }

  if (error) {
    error.textContent = "";
  }
}

function clearAllErrors() {
  const inputs = document.querySelectorAll(".study-control");
  const errors = document.querySelectorAll(".error-message");

  inputs.forEach(function (input) {
    input.classList.remove("input-error");
    input.classList.remove("input-success");
  });

  errors.forEach(function (error) {
    error.textContent = "";
  });
}

function setSubmitLoading(isLoading) {
  const submitBtn = document.getElementById("submitBtn");

  if (isLoading) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm me-2"></span>
      Đang upload...
    `;
  } else {
    submitBtn.disabled = false;
    submitBtn.innerHTML = `
      <i class="bi bi-cloud-upload"></i>
      Đăng tài liệu
    `;
  }
}

function shortPreviewText(text, maxLength) {
  if (text.length <= maxLength) {
    return text;
  }

  return text.slice(0, maxLength) + "...";
}

function getFileExtension(fileName) {
  const parts = fileName.split(".");

  if (parts.length <= 1) {
    return "";
  }

  return parts.pop().toLowerCase();
}
