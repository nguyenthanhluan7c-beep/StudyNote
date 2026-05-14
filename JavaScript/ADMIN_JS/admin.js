/* ============================================================
   ADMIN.JS — Bảng điều khiển quản trị viên StudyNote
   ============================================================ */
/* ---------- 1. BẢO VỆ XÁC THỰC ---------- */
(function authGuard() {
  const user = JSON.parse(localStorage.getItem("loggedInUser") || "null");
  if (!user || user.role !== "admin") {
    // window.location.href = "index.html"; // Tạm thời tắt chuyển hướng để dev
  }
})();

/* ---------- 2. DOM SẴN SÀNG ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSidebar();
  initHamburger();
  initProfileMenu();
  initSearch();
  initLiveClock();
  initCharts();
  initNotifications();
  initStatCounters();
});

/* ============================================================
   CHUYỂN ĐỔI GIAO DIỆN (Tối / Sáng)
   ============================================================ */
function initTheme() {
  const btn = document.getElementById("themeToggleBtn");
  if (!btn) return;

  const saved = localStorage.getItem("adminTheme") || "dark";
  applyTheme(saved);

  btn.addEventListener("click", () => {
    const current = document.body.dataset.theme || "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
    localStorage.setItem("adminTheme", next);
  });
}

function applyTheme(theme) {
  document.body.dataset.theme = theme;
  const btn = document.getElementById("themeToggleBtn");
  if (!btn) return;
  const icon = btn.querySelector("i");
  if (theme === "light") {
    icon.className = "fas fa-sun";
    btn.title = "Chuyển sang nền tối";
  } else {
    icon.className = "fas fa-moon";
    btn.title = "Chuyển sang nền sáng";
  }
}

/* ============================================================
   ĐIỀU HƯỚNG THANH BÊN — trạng thái hoạt động
   ============================================================ */
function initSidebar() {
  const items = document.querySelectorAll(".nav-item");
  items.forEach((item) => {
    item.addEventListener("click", () => {
      items.forEach((i) => i.classList.remove("active"));
      item.classList.add("active");

      // đóng thanh bên trên thiết bị di động sau khi nhấp
      const sidebar = document.querySelector(".sidebar");
      if (window.innerWidth <= 768) {
        sidebar.classList.remove("open");
        document.getElementById("sidebarOverlay")?.classList.remove("active");
      }
    });
  });

  // Mục điều hướng đăng xuất
  const logoutItem = document.querySelector('.nav-item[data-action="logout"]');
  if (logoutItem) {
    logoutItem.addEventListener("click", handleLogout);
  }
}

/* ============================================================
   MENU HAMBURGER (di động)
   ============================================================ */
function initHamburger() {
  const btn = document.getElementById("hamburgerBtn");
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebarOverlay");

  if (!btn) return;

  btn.addEventListener("click", () => {
    sidebar.classList.toggle("open");
    overlay?.classList.toggle("active");
  });

  overlay?.addEventListener("click", () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("active");
  });
}

/* ============================================================
   MENU TRẢ XUỐNG HỒ SƠ
   ============================================================ */
function initProfileMenu() {
  const profile = document.querySelector(".admin-profile");
  const dropdown = document.getElementById("profileDropdown");
  if (!profile || !dropdown) return;

  profile.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdown.classList.toggle("show");
  });

  document.addEventListener("click", () => {
    dropdown.classList.remove("show");
  });

  // Đăng xuất từ menu thả xuống
  const logoutDropBtn = document.getElementById("dropdownLogout");
  if (logoutDropBtn) {
    logoutDropBtn.addEventListener("click", handleLogout);
  }
}

function handleLogout() {
  if (confirm("Bạn có chắc muốn đăng xuất không?")) {
    localStorage.removeItem("isLoggedIn");
    window.location.href = "index.html";
  }
}

/* ============================================================
   TÌM KIẾM
   ============================================================ */
function initSearch() {
  const input = document.querySelector(".search-box input");
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && input.value.trim()) {
      showToast(`Đang tìm: "${input.value.trim()}"`);
    }
  });
}

/* ============================================================
   ĐỒNG HỒ TRỰC TIẾP trong phạm vi ngày
   ============================================================ */
function initLiveClock() {
  const el = document.getElementById("liveClock");
  if (!el) return;

  function updateClock() {
    const now = new Date();
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    el.textContent = now.toLocaleDateString("vi-VN", options);
  }
  updateClock();
  setInterval(updateClock, 60000);
}

/* ============================================================
   THÔNG BÁO
   ============================================================ */
function initNotifications() {
  const btn = document.querySelector(".notification-btn");
  const badge = document.querySelector(".notification-badge");
  if (!btn) return;

  const notifications = [
    { title: "Người dùng mới đăng ký", time: "2 phút trước" },
    { title: "Ghi chú mới được tải lên", time: "15 phút trước" },
    { title: "Hệ thống sao lưu thành công", time: "2 giờ trước" },
  ];

  let count = notifications.length;
  if (badge) badge.textContent = count;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    showNotificationPanel(notifications);
    count = 0;
    if (badge) badge.textContent = "";
  });
}

function showNotificationPanel(notifications) {
  // Xóa bảng hiện tại
  document.getElementById("notifPanel")?.remove();

  const panel = document.createElement("div");
  panel.id = "notifPanel";
  panel.className = "notif-panel";
  panel.innerHTML = `
        <div class="notif-header">
            <h3>Thông báo</h3>
            <button onclick="document.getElementById('notifPanel').remove()" class="notif-close">✕</button>
        </div>
        <div class="notif-list">
            ${notifications
              .map(
                (n) => `
                <div class="notif-item">
                    <i class="fas fa-bell notif-icon"></i>
                    <div>
                        <p class="notif-title">${n.title}</p>
                        <p class="notif-time">${n.time}</p>
                    </div>
                </div>
            `,
              )
              .join("")}
        </div>
    `;
  document.body.appendChild(panel);

  setTimeout(() => {
    document.addEventListener("click", function closePanel(e) {
      if (!panel.contains(e.target)) {
        panel.remove();
        document.removeEventListener("click", closePanel);
      }
    });
  }, 100);
}

/* ============================================================
   BỘ ĐẾM THỐNG KÊ (hoạt ảnh)
   ============================================================ */
function initStatCounters() {
  const stats = {
    totalUsers: {
      el: document.querySelector(".stat-card:nth-child(1) .stat-value"),
      target: 12847,
      suffix: "",
    },
    totalNotes: {
      el: document.querySelector(".stat-card:nth-child(2) .stat-value"),
      target: 45231,
      suffix: "",
    },
    uploads: {
      el: document.querySelector(".stat-card:nth-child(3) .stat-value"),
      target: 8549,
      suffix: "",
    },
    downloads: {
      el: document.querySelector(".stat-card:nth-child(4) .stat-value"),
      target: 93210,
      suffix: "",
    },
    active: {
      el: document.querySelector(".stat-card:nth-child(5) .stat-value"),
      target: 1243,
      suffix: "",
    },
    storage: {
      el: document.querySelector(".stat-card:nth-child(6) .stat-value"),
      target: 642,
      suffix: " GB",
    },
  };

  Object.values(stats).forEach(({ el, target, suffix }) => {
    if (!el) return;
    animateCounter(el, 0, target, 1500, suffix);
  });

  // Thanh tiến trình lưu trữ
  const progressFill = document.querySelector(".progress-fill");
  const progressText = document.querySelector(".progress-text");
  if (progressFill) {
    setTimeout(() => {
      progressFill.style.width = "64%";
      if (progressText) progressText.textContent = "64%";
    }, 300);
  }

  // Nhãn thay đổi thống kê
  const changes = [
    "+8.2% tuần này",
    "+12.5% tuần này",
    "+5.1% tuần này",
    "+18.3% tuần này",
    "+3.7% hôm nay",
    "",
  ];
  document.querySelectorAll(".stat-change").forEach((el, i) => {
    if (changes[i])
      el.innerHTML = `<i class="fas fa-arrow-up"></i> ${changes[i]}`;
  });

  // Số lượng danh mục
  const categoryCounts = [
    "2,341 ghi chú",
    "1,892 ghi chú",
    "3,120 ghi chú",
    "1,540 ghi chú",
    "2,780 ghi chú",
  ];
  document.querySelectorAll(".category-count").forEach((el, i) => {
    if (categoryCounts[i]) el.textContent = categoryCounts[i];
  });

  // Giá trị chú giải
  const legendValues = [
    " Người dùng hoạt động: 8,923",
    " Người dùng không hoạt động: 2,681",
    " Người dùng mới: 1,243",
  ];
  document.querySelectorAll(".legend-item span:last-child").forEach((el, i) => {
    if (legendValues[i]) el.textContent = legendValues[i];
  });
}

function animateCounter(el, start, end, duration, suffix = "") {
  const range = end - start;
  const startTime = performance.now();
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(start + range * eased);
    el.textContent = value.toLocaleString("vi-VN") + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

/* ============================================================
   BIỂU ĐỒ (Chart.js)
   ============================================================ */
function initCharts() {
  initOverviewChart();
  initUserActivityChart();
  initStorageChart();
  initUploadChart();
  initDownloadChart();
}

function getChartColors() {
  const isLight = document.body.dataset.theme === "light";
  return {
    gridColor: isLight ? "rgba(0,0,0,0.06)" : "rgba(255,255,255,0.06)",
    textColor: isLight ? "#555" : "#a8b2ba",
    tooltipBg: isLight ? "#fff" : "#1e2836",
    tooltipText: isLight ? "#333" : "#fff",
  };
}

let overviewChartInstance,
  userActivityChartInstance,
  storageChartInstance,
  uploadChartInstance,
  downloadChartInstance;

function initOverviewChart() {
  const ctx = document.getElementById("overviewChart");
  if (!ctx) return;
  const c = getChartColors();

  const labels = [
    "Th1",
    "Th2",
    "Th3",
    "Th4",
    "Th5",
    "Th6",
    "Th7",
    "Th8",
    "Th9",
    "Th10",
    "Th11",
    "Th12",
  ];
  const data = [
    820, 1200, 950, 1540, 1320, 1890, 2100, 1750, 2340, 2560, 2100, 2847,
  ];

  overviewChartInstance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Người dùng",
          data,
          borderColor: "#7ec041",
          backgroundColor: "rgba(126, 192, 65, 0.1)",
          borderWidth: 2.5,
          pointBackgroundColor: "#7ec041",
          pointRadius: 4,
          pointHoverRadius: 6,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: c.tooltipBg,
          titleColor: c.tooltipText,
          bodyColor: c.tooltipText,
          borderColor: "rgba(126,192,65,0.3)",
          borderWidth: 1,
        },
      },
      scales: {
        x: {
          grid: { color: c.gridColor },
          ticks: { color: c.textColor, font: { size: 11 } },
        },
        y: {
          grid: { color: c.gridColor },
          ticks: { color: c.textColor, font: { size: 11 } },
        },
      },
    },
  });

  // Lọc vùng chọn
  const select = document.querySelector(".chart-filter select");
  if (select) {
    select.addEventListener("change", () => {
      const datasets = {
        "Người dùng": [
          820, 1200, 950, 1540, 1320, 1890, 2100, 1750, 2340, 2560, 2100, 2847,
        ],
        "Ghi chú": [
          1200, 1800, 1400, 2100, 1900, 2600, 3000, 2400, 3200, 3500, 2900,
          3800,
        ],
        "Hoạt động": [
          3000, 4200, 3600, 5100, 4700, 6200, 7100, 5900, 7800, 8500, 7100,
          9300,
        ],
      };
      overviewChartInstance.data.datasets[0].data =
        datasets[select.value] || datasets["Người dùng"];
      overviewChartInstance.data.datasets[0].label = select.value;
      overviewChartInstance.update();
    });
  }
}

function initUserActivityChart() {
  const ctx = document.getElementById("userActivityChart");
  if (!ctx) return;

  userActivityChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Hoạt động", "Không hoạt động", "Mới"],
      datasets: [
        {
          data: [8923, 2681, 1243],
          backgroundColor: ["#7ec041", "#6c757d", "#1e96f3"],
          borderColor: "transparent",
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "70%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) =>
              ` ${ctx.label}: ${ctx.parsed.toLocaleString("vi-VN")}`,
          },
        },
      },
    },
  });
}

function initStorageChart() {
  const ctx = document.getElementById("storageChart");
  if (!ctx) return;

  storageChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: ["Ghi chú", "Tải lên", "Khác"],
      datasets: [
        {
          data: [256, 256, 130],
          backgroundColor: ["#7ec041", "#1e96f3", "#ffc107"],
          borderColor: "transparent",
          borderWidth: 0,
          hoverOffset: 8,
        },
      ],
    },
    options: {
      responsive: true,
      cutout: "65%",
      plugins: {
        legend: { display: false },
      },
    },
  });
}

function initUploadChart() {
  const ctx = document.getElementById("uploadChart");
  if (!ctx) return;
  const c = getChartColors();
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  uploadChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Tải lên",
          data: [120, 190, 80, 250, 170, 310, 95],
          backgroundColor: "rgba(126, 192, 65, 0.7)",
          borderRadius: 5,
          hoverBackgroundColor: "#7ec041",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: c.gridColor },
          ticks: { color: c.textColor, font: { size: 11 } },
        },
        y: {
          grid: { color: c.gridColor },
          ticks: { color: c.textColor, font: { size: 11 } },
        },
      },
    },
  });
}

function initDownloadChart() {
  const ctx = document.getElementById("downloadChart");
  if (!ctx) return;
  const c = getChartColors();
  const labels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  downloadChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Tải xuống",
          data: [340, 520, 290, 680, 410, 870, 250],
          backgroundColor: "rgba(30, 150, 243, 0.7)",
          borderRadius: 5,
          hoverBackgroundColor: "#1e96f3",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: {
        x: {
          grid: { color: c.gridColor },
          ticks: { color: c.textColor, font: { size: 11 } },
        },
        y: {
          grid: { color: c.gridColor },
          ticks: { color: c.textColor, font: { size: 11 } },
        },
      },
    },
  });
}

/* ============================================================
   THÔNG BÁO TOAST
   ============================================================ */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 10);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 400);
  }, 3000);
}
