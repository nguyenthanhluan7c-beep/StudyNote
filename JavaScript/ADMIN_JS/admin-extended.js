/* ============================================================
   ADMIN EXTENDED — jQuery + AJAX Management System
   ============================================================ */

// Auth Guard
(function () {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (!user || user.role !== "admin") {
    window.location.href = "index.html";
  }
})();

// Global Variables
let currentEditingUserId = null;
let currentEditingNoteId = null;
let uploadedFiles = [];

/* ============================================================
   DOM READY
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
   TAB NAVIGATION
   ============================================================ */
function initTabNavigation() {
  $(".nav-item[data-tab]").on("click", function () {
    const tab = $(this).data("tab");

    // Update active nav
    $(".nav-item").removeClass("active");
    $(this).addClass("active");

    // Update active content
    $(".content-tab").removeClass("active");
    $("#" + tab + "-tab").addClass("active");
    $("#dashboard").removeClass("active");

    if (tab === "dashboard") {
      $("#dashboard").addClass("active");
      $(".content-tab").removeClass("active");
    }

    // Load data based on tab
    if (tab === "users") loadUsers();
    if (tab === "notes") loadNotes();
    if (tab === "downloads") loadDownloads();
  });

  // Logout
  $(".nav-item[data-action='logout']").on("click", function () {
    if (confirm("Bạn có chắc muốn đăng xuất?")) {
      localStorage.removeItem("loggedInUser");
      window.location.href = "index.html";
    }
  });
}

/* ============================================================
   USER MANAGEMENT
   ============================================================ */
function initUserManagement() {
  // Add User Button
  $("#addUserBtn").on("click", function () {
    currentEditingUserId = null;
    $("#userDialog").dialog("option", "title", "Thêm Người dùng");
    $("#userForm")[0].reset();
    $("#userDialog").dialog("open");
  });

  // Search Users
  $("#userSearch").on("keyup", function () {
    const searchText = $(this).val().toLowerCase();
    $("#usersTableBody tr").each(function () {
      const text = $(this).text().toLowerCase();
      $(this).toggle(text.includes(searchText));
    });
  });

  // Load initial users
  loadUsers();
}

function loadUsers() {
  $.ajax({
    url: api_url.LOGIN_API_URL,
    type: "GET",
    dataType: "json",
    success: function (data) {
      renderUsersTable(data);
    },
    error: function () {
      $("#usersTableBody").html(
        '<tr><td colspan="6" class="no-data">Lỗi tải dữ liệu</td></tr>'
      );
    },
  });
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
      <td>${user.name || "N/A"}</td>
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

  // Edit button
  $(document).on("click", ".manage-table .btn-edit", function () {
    const userId = $(this).data("id");
    editUser(userId);
  });

  // Delete button
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

function deleteUser(userId) {
  if (!confirm("Bạn chắc chắn muốn xóa người dùng này?")) return;

  $.ajax({
    url: api_url.LOGIN_API_URL + "/" + userId,
    type: "DELETE",
    success: function () {
      alert("Xóa người dùng thành công!");
      loadUsers();
    },
    error: function () {
      alert("Lỗi xóa người dùng");
    },
  });
}

/* ============================================================
   NOTE MANAGEMENT
   ============================================================ */
function initNoteManagement() {
  // Add Note Button
  $("#addNoteBtn").on("click", function () {
    currentEditingNoteId = null;
    $("#noteDialog").dialog("option", "title", "Thêm Ghi chú");
    $("#noteForm")[0].reset();
    $("#noteDialog").dialog("open");
  });

  // Search Notes
  $("#noteSearch").on("keyup", function () {
    const searchText = $(this).val().toLowerCase();
    $("#notesTableBody tr").each(function () {
      const text = $(this).text().toLowerCase();
      $(this).toggle(text.includes(searchText));
    });
  });

  // Load initial notes
  loadNotes();
}

function loadNotes() {
  $.ajax({
    url: api_url.DOCUMENT_API_URL,
    type: "GET",
    dataType: "json",
    success: function (data) {
      renderNotesTable(data);
    },
    error: function () {
      $("#notesTableBody").html(
        '<tr><td colspan="7" class="no-data">Lỗi tải dữ liệu</td></tr>'
      );
    },
  });
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

  // Edit button
  $(document).on("click", ".note-edit", function () {
    const noteId = $(this).data("id");
    editNote(noteId);
  });

  // Delete button
  $(document).on("click", ".note-delete", function () {
    const noteId = $(this).data("id");
    deleteNote(noteId);
  });
}

function editNote(noteId) {
  $.ajax({
    url: api_url.DOCUMENT_API_URL + "/" + noteId,
    type: "GET",
    dataType: "json",
    success: function (note) {
      currentEditingNoteId = noteId;
      $("#noteDialog").dialog("option", "title", "Sửa Ghi chú");
      $("#noteTitle").val(note.title);
      $("#noteContent").val(note.content);
      $("#noteCategory").val(note.category || "");
      $("#noteAuthor").val(note.author || "");
      $("#noteDialog").dialog("open");
    },
  });
}

function deleteNote(noteId) {
  if (!confirm("Bạn chắc chắn muốn xóa ghi chú này?")) return;

  $.ajax({
    url: api_url.DOCUMENT_API_URL + "/" + noteId,
    type: "DELETE",
    success: function () {
      alert("Xóa ghi chú thành công!");
      loadNotes();
    },
    error: function () {
      alert("Lỗi xóa ghi chú");
    },
  });
}

/* ============================================================
   UPLOAD MANAGEMENT
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

  // Load stored files
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
   DOWNLOAD MANAGEMENT
   ============================================================ */
function initDownloadManagement() {
  loadDownloads();
}

function loadDownloads() {
  $.ajax({
    url: api_url.DOCUMENT_API_URL,
    type: "GET",
    dataType: "json",
    success: function (data) {
      renderDownloadsTable(data);
    },
    error: function () {
      $("#downloadsTableBody").html(
        '<tr><td colspan="6" class="no-data">Lỗi tải dữ liệu</td></tr>'
      );
    },
  });
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
   DIALOG MANAGEMENT
   ============================================================ */
function initDialogs() {
  // User Dialog
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

  // Note Dialog
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

  // User Form Submit
  $("#userForm").on("submit", function (e) {
    e.preventDefault();
    saveUser();
  });

  // Note Form Submit
  $("#noteForm").on("submit", function (e) {
    e.preventDefault();
    saveNote();
  });
}

function saveUser() {
  const email = $("#userEmail").val();
  const name = $("#userName").val();
  const password = $("#userPassword").val();
  const role = $("#userRole").val();

  if (!email || !name) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const userData = { email, name, password, role };

  if (currentEditingUserId) {
    // Update
    $.ajax({
      url: api_url.LOGIN_API_URL + "/" + currentEditingUserId,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(userData),
      success: function () {
        alert("Cập nhật người dùng thành công!");
        $("#userDialog").dialog("close");
        loadUsers();
      },
      error: function () {
        alert("Lỗi cập nhật người dùng");
      },
    });
  } else {
    // Create
    $.ajax({
      url: api_url.LOGIN_API_URL,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(userData),
      success: function () {
        alert("Thêm người dùng thành công!");
        $("#userDialog").dialog("close");
        loadUsers();
      },
      error: function () {
        alert("Lỗi thêm người dùng");
      },
    });
  }
}

function saveNote() {
  const title = $("#noteTitle").val();
  const content = $("#noteContent").val();
  const category = $("#noteCategory").val();
  const author = $("#noteAuthor").val();

  if (!title || !content) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const noteData = { title, content, category, author };

  if (currentEditingNoteId) {
    // Update
    $.ajax({
      url: api_url.DOCUMENT_API_URL + "/" + currentEditingNoteId,
      type: "PUT",
      contentType: "application/json",
      data: JSON.stringify(noteData),
      success: function () {
        alert("Cập nhật ghi chú thành công!");
        $("#noteDialog").dialog("close");
        loadNotes();
      },
      error: function () {
        alert("Lỗi cập nhật ghi chú");
      },
    });
  } else {
    // Create
    $.ajax({
      url: api_url.DOCUMENT_API_URL,
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(noteData),
      success: function () {
        alert("Thêm ghi chú thành công!");
        $("#noteDialog").dialog("close");
        loadNotes();
      },
      error: function () {
        alert("Lỗi thêm ghi chú");
      },
    });
  }
}
