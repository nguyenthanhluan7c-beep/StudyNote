/* ============================================================
   ADMIN FEATURES — StudyNote Admin Management System
   ============================================================ */

// Auth Guard
(function authGuard() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (!user || user.role !== "admin") {
    window.location.href = "index.html";
  }
})();

// Global State
let currentEditingUserId = null;
let currentEditingNoteId = null;
let allUsers = [];
let allNotes = [];
let uploadedFiles = [];

/* ============================================================
   DOM READY
   ============================================================ */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initTabNavigation();
  initUserManagement();
  initNoteManagement();
  initUploadManagement();
  initDownloadManagement();
  loadDashboardStats();
  loadAllData();
});

/* ============================================================
   THEME MANAGEMENT
   ============================================================ */
function initTheme() {
  const btn = document.getElementById("themeToggleBtn");
  const saved = localStorage.getItem("adminTheme") || "dark";
  applyTheme(saved);

  btn?.addEventListener("click", () => {
    const current = document.body.dataset.theme || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("adminTheme", next);
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const icon = document.getElementById("themeToggleBtn")?.querySelector("i");
  if (icon) {
    icon.className = theme === "light" ? "fas fa-sun" : "fas fa-moon";
  }
}

/* ============================================================
   TAB NAVIGATION
   ============================================================ */
function initTabNavigation() {
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.addEventListener("click", () => {
      const tab = item.dataset.tab;
      if (!tab) return;

      // Update active nav item
      document.querySelectorAll(".nav-item").forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      // Update page title
      const titles = {
        dashboard: "Bảng điều khiển",
        users: "Quản lý Người dùng",
        notes: "Quản lý Ghi chú",
        uploads: "Quản lý Tải lên",
        downloads: "Quản lý Tải xuống",
      };
      document.getElementById("pageTitle").textContent = titles[tab] || "Dashboard";

      // Show active content section
      document.querySelectorAll(".content-section").forEach((s) => s.classList.remove("active"));
      document.getElementById(tab)?.classList.add("active");

      if (tab === "dashboard") loadDashboardStats();
      if (tab === "users") loadUsers();
      if (tab === "notes") loadNotes();
      if (tab === "downloads") loadDownloads();
    });
  });

  // Logout
  document.getElementById("logoutBtn")?.addEventListener("click", () => {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    }
  });
}

/* ============================================================
   DASHBOARD STATS
   ============================================================ */
async function loadDashboardStats() {
  try {
    const users = await get(api_url.LOGIN_API_URL);
    const notes = await get(api_url.DOCUMENT_API_URL);
    const comments = await get(api_url.COMMENT_API_URL);
    const reviews = await get(api_url.REVIEW_API_URL);

    document.getElementById("totalUsersCount").textContent = users.length || 0;
    document.getElementById("totalNotesCount").textContent = notes.length || 0;
    document.getElementById("totalCommentsCount").textContent = comments.length || 0;
    document.getElementById("totalReviewsCount").textContent = reviews.length || 0;
  } catch (error) {
    console.error("Lỗi tải thống kê:", error);
  }
}

/* ============================================================
   USER MANAGEMENT
   ============================================================ */
function initUserManagement() {
  document.getElementById("addUserBtn")?.addEventListener("click", () => {
    currentEditingUserId = null;
    document.getElementById("userModalTitle").textContent = "Thêm Người dùng";
    document.getElementById("userForm").reset();
    document.getElementById("userPassword").disabled = false;
    openModal("userModal");
  });

  document.getElementById("userForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("userEmail").value;
    const name = document.getElementById("userName").value;
    const password = document.getElementById("userPassword").value;
    const role = document.getElementById("userRole").value;

    try {
      if (currentEditingUserId) {
        // Update user
        await put(api_url.LOGIN_API_URL, { email, name, password, role }, currentEditingUserId);
        showAlert("Cập nhật người dùng thành công!", "success");
      } else {
        // Create user
        await post(api_url.LOGIN_API_URL, { email, name, password, role });
        showAlert("Thêm người dùng thành công!", "success");
      }
      closeModal("userModal");
      loadUsers();
    } catch (error) {
      showAlert("Lỗi: " + error.message, "error");
    }
  });

  document.getElementById("userSearchInput")?.addEventListener("input", (e) => {
    filterTable("usersTableBody", e.target.value);
  });
}

async function loadUsers() {
  try {
    const response = await get(api_url.LOGIN_API_URL);
    allUsers = Array.isArray(response) ? response : [];
    renderUsersTable();
  } catch (error) {
    console.error("Lỗi tải người dùng:", error);
    document.getElementById("usersTableBody").innerHTML =
      '<tr><td colspan="6" class="no-data">Lỗi tải dữ liệu</td></tr>';
  }
}

function renderUsersTable() {
  const tbody = document.getElementById("usersTableBody");
  if (allUsers.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Không có người dùng nào</td></tr>';
    return;
  }

  tbody.innerHTML = allUsers
    .map(
      (user) => `
    <tr>
      <td>${user.id || "N/A"}</td>
      <td>${user.email || "N/A"}</td>
      <td>${user.name || "N/A"}</td>
      <td><span style="background: #7ec041; color: white; padding: 3px 8px; border-radius: 3px;">${user.role || "user"}</span></td>
      <td>${new Date(user.createdAt || Date.now()).toLocaleDateString("vi-VN")}</td>
      <td>
        <button class="btn-edit" onclick="editUser(${user.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-danger" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function editUser(userId) {
  const user = allUsers.find((u) => u.id == userId);
  if (!user) return;

  currentEditingUserId = userId;
  document.getElementById("userModalTitle").textContent = "Sửa Người dùng";
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userName").value = user.name;
  document.getElementById("userPassword").value = user.password;
  document.getElementById("userPassword").disabled = true;
  document.getElementById("userRole").value = user.role || "user";
  openModal("userModal");
}

async function deleteUser(userId) {
  if (!confirm("Bạn chắc chắn muốn xóa người dùng này?")) return;
  try {
    await remove(api_url.LOGIN_API_URL, userId);
    showAlert("Xóa người dùng thành công!", "success");
    loadUsers();
  } catch (error) {
    showAlert("Lỗi xóa người dùng", "error");
  }
}

/* ============================================================
   NOTE MANAGEMENT
   ============================================================ */
function initNoteManagement() {
  document.getElementById("addNoteBtn")?.addEventListener("click", () => {
    currentEditingNoteId = null;
    document.getElementById("noteModalTitle").textContent = "Thêm Ghi chú";
    document.getElementById("noteForm").reset();
    openModal("noteModal");
  });

  document.getElementById("noteForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const title = document.getElementById("noteTitle").value;
    const content = document.getElementById("noteContent").value;
    const category = document.getElementById("noteCategory").value;
    const author = document.getElementById("noteAuthor").value;

    try {
      if (currentEditingNoteId) {
        await put(api_url.DOCUMENT_API_URL, { title, content, category, author }, currentEditingNoteId);
        showAlert("Cập nhật ghi chú thành công!", "success");
      } else {
        await post(api_url.DOCUMENT_API_URL, { title, content, category, author });
        showAlert("Thêm ghi chú thành công!", "success");
      }
      closeModal("noteModal");
      loadNotes();
    } catch (error) {
      showAlert("Lỗi: " + error.message, "error");
    }
  });

  document.getElementById("noteSearchInput")?.addEventListener("input", (e) => {
    filterTable("notesTableBody", e.target.value);
  });
}

async function loadNotes() {
  try {
    const response = await get(api_url.DOCUMENT_API_URL);
    allNotes = Array.isArray(response) ? response : [];
    renderNotesTable();
  } catch (error) {
    console.error("Lỗi tải ghi chú:", error);
    document.getElementById("notesTableBody").innerHTML =
      '<tr><td colspan="7" class="no-data">Lỗi tải dữ liệu</td></tr>';
  }
}

function renderNotesTable() {
  const tbody = document.getElementById("notesTableBody");
  if (allNotes.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="no-data">Không có ghi chú nào</td></tr>';
    return;
  }

  tbody.innerHTML = allNotes
    .map(
      (note) => `
    <tr>
      <td>${note.id || "N/A"}</td>
      <td>${note.title || "N/A"}</td>
      <td>${(note.content || "").substring(0, 50)}...</td>
      <td>${note.category || "Chung"}</td>
      <td>${note.author || "Admin"}</td>
      <td>${new Date(note.createdAt || Date.now()).toLocaleDateString("vi-VN")}</td>
      <td>
        <button class="btn-edit" onclick="editNote(${note.id})"><i class="fas fa-edit"></i></button>
        <button class="btn-danger" onclick="deleteNote(${note.id})"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function editNote(noteId) {
  const note = allNotes.find((n) => n.id == noteId);
  if (!note) return;

  currentEditingNoteId = noteId;
  document.getElementById("noteModalTitle").textContent = "Sửa Ghi chú";
  document.getElementById("noteTitle").value = note.title;
  document.getElementById("noteContent").value = note.content;
  document.getElementById("noteCategory").value = note.category || "";
  document.getElementById("noteAuthor").value = note.author || "";
  openModal("noteModal");
}

async function deleteNote(noteId) {
  if (!confirm("Bạn chắc chắn muốn xóa ghi chú này?")) return;
  try {
    await remove(api_url.DOCUMENT_API_URL, noteId);
    showAlert("Xóa ghi chú thành công!", "success");
    loadNotes();
  } catch (error) {
    showAlert("Lỗi xóa ghi chú", "error");
  }
}

/* ============================================================
   UPLOAD MANAGEMENT
   ============================================================ */
function initUploadManagement() {
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");

  uploadArea?.addEventListener("click", () => fileInput?.click());
  uploadArea?.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = "rgba(126, 192, 65, 0.2)";
  });
  uploadArea?.addEventListener("dragleave", () => {
    uploadArea.style.backgroundColor = "";
  });
  uploadArea?.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.style.backgroundColor = "";
    handleFileSelect(e.dataTransfer.files);
  });

  fileInput?.addEventListener("change", (e) => handleFileSelect(e.target.files));
}

function handleFileSelect(files) {
  Array.from(files).forEach((file) => {
    const fileObj = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      uploadedAt: new Date().toLocaleDateString("vi-VN"),
    };
    uploadedFiles.push(fileObj);
    showAlert(`Tệp "${file.name}" đã được tải lên!`, "success");
  });
  renderUploadedFiles();
  localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
}

function renderUploadedFiles() {
  const container = document.getElementById("uploadedFilesList");
  if (uploadedFiles.length === 0) {
    container.innerHTML = '<div class="no-data">Chưa có tệp nào</div>';
    return;
  }

  container.innerHTML = uploadedFiles
    .map(
      (file) => `
    <div class="file-item">
      <div class="file-info">
        <div class="file-name"><i class="fas fa-file"></i> ${file.name}</div>
        <div class="file-size">${file.size} • ${file.uploadedAt}</div>
      </div>
      <div class="file-actions">
        <button class="btn-primary" onclick="downloadFile('${file.name}')"><i class="fas fa-download"></i></button>
        <button class="btn-danger" onclick="deleteFile(${file.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `,
    )
    .join("");
}

function deleteFile(fileId) {
  uploadedFiles = uploadedFiles.filter((f) => f.id !== fileId);
  renderUploadedFiles();
  localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
  showAlert("Tệp đã được xóa!", "success");
}

function downloadFile(fileName) {
  showAlert(`Tệp "${fileName}" đang được tải xuống...`, "success");
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/* ============================================================
   DOWNLOAD MANAGEMENT
   ============================================================ */
async function initDownloadManagement() {
  loadDownloads();
}

async function loadDownloads() {
  try {
    const response = await get(api_url.DOCUMENT_API_URL);
    const documents = Array.isArray(response) ? response : [];
    renderDownloadsTable(documents);
  } catch (error) {
    console.error("Lỗi tải danh sách tải xuống:", error);
  }
}

function renderDownloadsTable(documents) {
  const tbody = document.getElementById("downloadsTableBody");
  if (documents.length === 0) {
    tbody.innerHTML = '<tr><td colspan="6" class="no-data">Không có tệp nào</td></tr>';
    return;
  }

  tbody.innerHTML = documents
    .slice(0, 10)
    .map(
      (doc, idx) => `
    <tr>
      <td>${doc.title || "document_" + idx}</td>
      <td>PDF/DOC</td>
      <td>${formatFileSize(Math.random() * 5000000)}</td>
      <td>${Math.floor(Math.random() * 1000)}</td>
      <td>${new Date(doc.createdAt || Date.now()).toLocaleDateString("vi-VN")}</td>
      <td>
        <button class="btn-primary" onclick="downloadFile('${doc.title}')"><i class="fas fa-download"></i></button>
      </td>
    </tr>
  `,
    )
    .join("");
}

/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */
async function loadAllData() {
  await Promise.all([loadUsers(), loadNotes()]);
  loadDownloads();
  const stored = localStorage.getItem("uploadedFiles");
  if (stored) uploadedFiles = JSON.parse(stored);
  renderUploadedFiles();
}

function openModal(modalId) {
  document.getElementById(modalId)?.classList.add("active");
}

function closeModal(modalId) {
  document.getElementById(modalId)?.classList.remove("active");
}

function showAlert(message, type = "info") {
  const alert = document.createElement("div");
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background: ${type === "success" ? "#28a745" : type === "error" ? "#dc3545" : "#17a2b8"};
    color: white;
    border-radius: 5px;
    z-index: 5000;
    animation: slideIn 0.3s ease;
  `;
  alert.textContent = message;
  document.body.appendChild(alert);
  setTimeout(() => alert.remove(), 3000);
}

function filterTable(tbodyId, searchText) {
  const tbody = document.getElementById(tbodyId);
  const rows = tbody.querySelectorAll("tr");
  rows.forEach((row) => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchText.toLowerCase()) ? "" : "none";
  });
}

// Add animation for alerts
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);
