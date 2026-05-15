/* ============================================================
   MỞ RỘNG ADMIN — Hệ thống quản lý jQuery + AJAX
   ============================================================ */

// Bảo vệ xác thực
(function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (!user || user.role !== "admin") {
    // window.location.href = "index.html"; // Tạm thời tắt chuyển hướng để dev
  }
})();

// Biến toàn cục
let currentEditingUserId = null;
let currentEditingNoteId = null;
let uploadedFiles = [];

/* ============================================================
   DOM SẴN SÀNG
   ============================================================ */
$(document).ready(function () {
  initTabNavigation();
  initUserManagement();
  initNoteManagement();
  initUploadManagement();
  initDownloadManagement();
  initDialogs();
});

/* ============================================================
   ĐIỀU HƯỚNG TAB
   ============================================================ */
function initTabNavigation() {
  $(".nav-item[data-tab]").on("click", function () {
    const tab = $(this).data("tab");

    // Cập nhật điều hướng hoạt động
    $(".nav-item").removeClass("active");
    $(this).addClass("active");

    // Cập nhật nội dung hoạt động
    $(".content-tab").removeClass("active");
    $("#" + tab + "-tab").addClass("active");
    $("#dashboard").removeClass("active");

    if (tab === "dashboard") {
      $("#dashboard").addClass("active");
      $(".content-tab").removeClass("active");
    }

    // Tải dữ liệu dựa trên tab
    if (tab === "users") loadUsers();
    if (tab === "notes") loadNotes();
    if (tab === "downloads") loadDownloads();
  });

  // Đăng xuất
  $(".nav-item[data-action='logout']").on("click", function () {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    }
  });
}

/* ============================================================
   QUẢN LÝ NGƯỜI DÙNG
   ============================================================ */
function initUserManagement() {
  // Nút thêm người dùng
  $("#addUserBtn").on("click", function () {
    currentEditingUserId = null;
    $("#userDialog").dialog("option", "title", "Thêm Người dùng");
    $("#userForm")[0].reset();
    $("#userDialog").dialog("open");
  });

  // Tìm kiếm người dùng
  $("#userSearch").on("keyup", function () {
    const searchText = $(this).val().toLowerCase();
    $("#usersTableBody tr").each(function () {
      const text = $(this).text().toLowerCase();
      $(this).toggle(text.includes(searchText));
    });
  });

  // Tải người dùng ban đầu
  loadUsers();
}

async function loadUsers() {
  try {
    const users = await get(api_url.LOGIN_API_URL);
    renderUsersTable(users);
  } catch (error) {
    $("#usersTableBody").html(
      '<tr><td colspan="6" class="no-data">Lỗi tải dữ liệu</td></tr>'
    );
  }
}

function renderUsersTable(users) {
  const tbody = $("#usersTableBody");
  if (!users || users.length === 0) {
    tbody.html(
      '<tr><td colspan="6" class="no-data">Không có người dùng nào</td></tr>'
    );
    return;
  }

  let html = users
    .map(
      (user) => `
    <tr>
      <td>${user.id || "N/A"}</td>
      <td>${user.email || "N/A"}</td>
      <td>${user.username || "N/A"}</td>
      <td><span style="background: #7ec041; color: white; padding: 3px 8px; border-radius: 3px;">${user.role || "user"}</span></td>
      <td>${new Date(user.createdAt || Date.now()).toLocaleDateString("vi-VN")}</td>
      <td>
        <button class="btn-edit" data-id="${user.id}"><i class="fas fa-edit"></i></button>
        <button class="btn-delete" data-id="${user.id}"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `
    )
    .join("");

  tbody.html(html);

  // Nút sửa
  $(document).on("click", ".manage-table .btn-edit", function () {
    const userId = $(this).data("id");
    editUser(userId);
  });

  // Nút xóa
  $(document).on("click", ".manage-table .btn-delete", function () {
    const userId = $(this).data("id");
    deleteUser(userId);
  });
}

function editUser(userId) {
  const row = $(`.manage-table tr:has(td:contains("${userId}"))`);
  const cells = row.find("td");

  currentEditingUserId = userId;
  $("#userDialog").dialog("option", "title", "Sửa Người dùng");
  $("#userEmail").val($(cells[1]).text()).prop("disabled", true);
  $("#userName").val($(cells[2]).text());
  $("#userRole").val($(cells[3]).text().toLowerCase());
  $("#userPassword").val("").prop("disabled", true);

  $("#userDialog").dialog("open");
}

async function deleteUser(userId) {
  if (!confirm("Bạn chắc chắn muốn xóa người dùng này?")) return;
  try {
    await remove(api_url.LOGIN_API_URL, userId);
    alert("Xóa người dùng thành công!");
    loadUsers();
  } catch (error) {
    alert("Lỗi xóa người dùng");
  }
}

/* ============================================================
   QUẢN LÝ GHI CHÚ
   ============================================================ */
function initNoteManagement() {
  // Nút thêm ghi chú
  $("#addNoteBtn").on("click", function () {
    currentEditingNoteId = null;
    $("#noteDialog").dialog("option", "title", "Thêm Ghi chú");
    $("#noteForm")[0].reset();
    $("#noteDialog").dialog("open");
  });

  // Tìm kiếm ghi chú
  $("#noteSearch").on("keyup", function () {
    const searchText = $(this).val().toLowerCase();
    $("#notesTableBody tr").each(function () {
      const text = $(this).text().toLowerCase();
      $(this).toggle(text.includes(searchText));
    });
  });

  // Tải ghi chú ban đầu
  loadNotes();
}

async function loadNotes() {
  try {
    const notes = await get(api_url.DOCUMENT_API_URL);
    renderNotesTable(notes);
  } catch (error) {
    $("#notesTableBody").html(
      '<tr><td colspan="7" class="no-data">Lỗi tải dữ liệu</td></tr>'
    );
  }
}

function renderNotesTable(notes) {
  const tbody = $("#notesTableBody");
  if (!notes || notes.length === 0) {
    tbody.html(
      '<tr><td colspan="7" class="no-data">Không có ghi chú nào</td></tr>'
    );
    return;
  }

  let html = notes
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
        <button class="btn-edit note-edit" data-id="${note.id}"><i class="fas fa-edit"></i></button>
        <button class="btn-delete note-delete" data-id="${note.id}"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `
    )
    .join("");

  tbody.html(html);

  // Nút sửa
  $(document).on("click", ".note-edit", function () {
    const noteId = $(this).data("id");
    editNote(noteId);
  });

  // Nút xóa
  $(document).on("click", ".note-delete", function () {
    const noteId = $(this).data("id");
    deleteNote(noteId);
  });
}

async function editNote(noteId) {
  try {
    const note = await getOneById(api_url.DOCUMENT_API_URL, noteId);
    if (!note) return;
    
    currentEditingNoteId = noteId;
    $("#noteDialog").dialog("option", "title", "Sửa Ghi chú");
    $("#noteTitle").val(note.title);
    $("#noteContent").val(note.content);
    $("#noteCategory").val(note.category || "");
    $("#noteAuthor").val(note.author || "");
    $("#noteDialog").dialog("open");
  } catch (error) {
    alert("Lỗi lấy thông tin ghi chú");
  }
}

async function deleteNote(noteId) {
  if (!confirm("Bạn chắc chắn muốn xóa ghi chú này?")) return;
  try {
    await remove(api_url.DOCUMENT_API_URL, noteId);
    alert("Xóa ghi chú thành công!");
    loadNotes();
  } catch (error) {
    alert("Lỗi xóa ghi chú");
  }
}

/* ============================================================
   QUẢN LÝ TẢI LÊN
   ============================================================ */
function initUploadManagement() {
  const uploadZone = $("#uploadZone");
  const fileInput = $("#fileInput");

  uploadZone.on("click", function () {
    fileInput.click();
  });

  uploadZone.on("dragover", function (e) {
    e.preventDefault();
    $(this).css("background-color", "rgba(126, 192, 65, 0.2)");
  });

  uploadZone.on("dragleave", function () {
    $(this).css("background-color", "");
  });

  uploadZone.on("drop", function (e) {
    e.preventDefault();
    $(this).css("background-color", "");
    handleFileSelect(e.originalEvent.dataTransfer.files);
  });

  fileInput.on("change", function () {
    handleFileSelect(this.files);
  });

  // Tải tệp đã lưu
  loadUploadedFiles();
}

function handleFileSelect(files) {
  $.each(files, function (i, file) {
    const fileObj = {
      id: Date.now() + Math.random(),
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      uploadedAt: new Date().toLocaleDateString("vi-VN"),
    };
    uploadedFiles.push(fileObj);
  });
  localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
  loadUploadedFiles();
}

function loadUploadedFiles() {
  const stored = localStorage.getItem("uploadedFiles");
  uploadedFiles = stored ? JSON.parse(stored) : [];
  renderUploadedFiles();
}

function renderUploadedFiles() {
  const container = $("#filesList");
  if (uploadedFiles.length === 0) {
    container.html('<div class="no-data">Chưa có tệp nào</div>');
    return;
  }

  let html = uploadedFiles
    .map(
      (file) => `
    <div class="file-item">
      <div class="file-info">
        <div class="file-name"><i class="fas fa-file"></i> ${file.name}</div>
        <div class="file-size">${file.size} • ${file.uploadedAt}</div>
      </div>
      <div class="file-actions">
        <button class="btn-download" data-name="${file.name}"><i class="fas fa-download"></i></button>
        <button class="btn-delete" onclick="deleteUploadedFile(${file.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `
    )
    .join("");

  container.html(html);

  $(document).on("click", ".btn-download", function () {
    const name = $(this).data("name");
    alert(`Tệp "${name}" đang được tải xuống...`);
  });
}

function deleteUploadedFile(fileId) {
  uploadedFiles = uploadedFiles.filter((f) => f.id !== fileId);
  localStorage.setItem("uploadedFiles", JSON.stringify(uploadedFiles));
  loadUploadedFiles();
}

function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

/* ============================================================
   QUẢN LÝ TẢI XUỐNG
   ============================================================ */
function initDownloadManagement() {
  loadDownloads();
}

async function loadDownloads() {
  try {
    const notes = await get(api_url.DOCUMENT_API_URL);
    renderDownloadsTable(notes);
  } catch (error) {
    $("#downloadsTableBody").html(
      '<tr><td colspan="6" class="no-data">Lỗi tải dữ liệu</td></tr>'
    );
  }
}

function renderDownloadsTable(documents) {
  const tbody = $("#downloadsTableBody");
  if (!documents || documents.length === 0) {
    tbody.html(
      '<tr><td colspan="6" class="no-data">Không có tệp nào</td></tr>'
    );
    return;
  }

  let html = documents
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
        <button class="btn-download" onclick="downloadFile('${doc.title}')"><i class="fas fa-download"></i></button>
      </td>
    </tr>
  `
    )
    .join("");

  tbody.html(html);
}

function downloadFile(fileName) {
  alert(`Tệp "${fileName}" đang được tải xuống...`);
}

/* ============================================================
   QUẢN LÝ HỘP THOẠI
   ============================================================ */
function initDialogs() {
  // Hộp thoại người dùng
  $("#userDialog").dialog({
    autoOpen: false,
    modal: true,
    width: 500,
    buttons: {
      Lưu: function () {
        saveUser();
      },
      Hủy: function () {
        $(this).dialog("close");
      },
    },
  });

  // Hộp thoại ghi chú
  $("#noteDialog").dialog({
    autoOpen: false,
    modal: true,
    width: 600,
    buttons: {
      Lưu: function () {
        saveNote();
      },
      Hủy: function () {
        $(this).dialog("close");
      },
    },
  });

  // Hộp thoại hồ sơ
  $("#profileDialog").dialog({
    autoOpen: false,
    modal: true,
    width: 400,
    buttons: {
      Đóng: function () {
        $(this).dialog("close");
      },
    },
  });

  // Hộp thoại cài đặt
  $("#settingsDialog").dialog({
    autoOpen: false,
    modal: true,
    width: 450,
    buttons: {
      Lưu: function () {
        alert("Lưu cài đặt thành công!");
        $(this).dialog("close");
      },
      Hủy: function () {
        $(this).dialog("close");
      },
    },
  });

  // Trình đơn hồ sơ
  $("#dropdownProfile").on("click", function(e) {
      e.preventDefault();
      $("#profileDropdown").removeClass("show");
      $("#profileDialog").dialog("open");
  });

  // Trình đơn cài đặt
  $("#dropdownSettings").on("click", function(e) {
      e.preventDefault();
      $("#profileDropdown").removeClass("show");
      $("#settingsDialog").dialog("open");
  });

  // Gửi form người dùng
  $("#userForm").on("submit", function (e) {
    e.preventDefault();
    saveUser();
  });

  // Gửi form ghi chú
  $("#noteForm").on("submit", function (e) {
    e.preventDefault();
    saveNote();
  });
}

async function saveUser() {
  const email = $("#userEmail").val();
  const name = $("#userName").val();
  const password = $("#userPassword").val();
  const role = $("#userRole").val();

  if (!email || !name) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const userData = { email, name, password, role };

  try {
    if (currentEditingUserId) {
      // Cập nhật
      await put(api_url.LOGIN_API_URL, userData, currentEditingUserId);
      alert("Cập nhật người dùng thành công!");
    } else {
      // Tạo mới
      await post(api_url.LOGIN_API_URL, userData);
      alert("Thêm người dùng thành công!");
    }
    $("#userDialog").dialog("close");
    loadUsers();
  } catch (error) {
    alert("Lỗi khi lưu người dùng");
  }
}

async function saveNote() {
  const title = $("#noteTitle").val();
  const content = $("#noteContent").val();
  const category = $("#noteCategory").val();
  const author = $("#noteAuthor").val();

  if (!title || !content) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const noteData = { title, content, category, author };

  try {
    if (currentEditingNoteId) {
      // Cập nhật
      await put(api_url.DOCUMENT_API_URL, noteData, currentEditingNoteId);
      alert("Cập nhật ghi chú thành công!");
    } else {
      // Tạo mới
      await post(api_url.DOCUMENT_API_URL, noteData);
      alert("Thêm ghi chú thành công!");
    }
    $("#noteDialog").dialog("close");
    loadNotes();
  } catch (error) {
    alert("Lỗi khi lưu ghi chú");
  }
}
