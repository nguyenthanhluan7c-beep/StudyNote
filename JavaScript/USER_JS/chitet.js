// ============ MOCK API URL ============
const COURSE_API_URL = "https://69fd352830ad0a6fd1c093f8.mockapi.io/api/v1/courses";

// Chạy ngay khi trang web HTML vừa load xong
document.addEventListener("DOMContentLoaded", () => {
  // Lấy thông tin ID khóa học đã được lưu vào localStorage từ trang chủ
  const selectedCourseStr = localStorage.getItem("selectedCourse");
  
  if (!selectedCourseStr) {
    alert("Không tìm thấy thông tin khóa học. Sẽ quay lại trang chủ!");
    window.location.href = "index.html"; // Trả về trang chủ nếu không có ID
    return;
  }

  const selectedCourse = JSON.parse(selectedCourseStr);
  const courseId = selectedCourse.id;

  // Gọi hàm fetch API để lấy thông tin chi tiết bằng ID
  fetchAndRenderCourseDetail(courseId);
});

// ============ HÀM GỌI API VÀ HIỂN THỊ ============
async function fetchAndRenderCourseDetail(id) {
  // Tìm thẻ div chứa nội dung chi tiết trên trang HTML
// Thay đổi dòng này trong hàm fetchAndRenderCourseDetail
const container = document.getElementById("courseContainer"); 
  if (!container) return;
  
  try {
    // 1. Hiển thị trạng thái loading trong lúc chờ API trả dữ liệu
    container.innerHTML = `
      <div class="text-center my-5">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-2">Đang tải thông tin khóa học...</p>
      </div>
    `;

    // 2. Gọi API đến endpoint của mockapi kèm theo ID khóa học
    const response = await fetch(`${COURSE_API_URL}/${id}`);
    
    if (!response.ok) {
      throw new Error("Không thể tải chi tiết khóa học từ máy chủ.");
    }
    
    // 3. Chuyển đổi dữ liệu trả về sang JSON
    const course = await response.json();
    
    // 4. Vẽ dữ liệu ra giao diện (Render)
    renderCourse(course, container);
    
  } catch (error) {
    console.error("Lỗi:", error);
    container.innerHTML = `
      <div class="alert alert-danger text-center my-5" role="alert">
        Đã xảy ra lỗi: ${error.message} <br> Vui lòng thử lại sau.
      </div>
    `;
  }
}

// ============ HÀM RENDER HTML ============
function renderCourse(course, container) {
  // Xử lý các dữ liệu trống (fallback data) đề phòng API trả về null
  const courseTitle = course.name || "Khóa học không tên";
  const courseImage = course.image || "https://via.placeholder.com/600x400?text=Khóa+học";
  const courseDetail = course.detail || "Chưa có bài viết mô tả chi tiết cho khóa học này.";
  const coursePrice = course.price ? `${course.price}đ` : "Miễn phí";
  const courseStatus = course.status === "approved" ? "Đã duyệt" : "Chờ duyệt";

  // Tạo cấu trúc HTML hiển thị
  container.innerHTML = `
    <div class="row mt-4">
      <div class="col-md-6 mb-4">
        <img src="${escapeStringForHtml(courseImage)}" alt="${escapeStringForHtml(courseTitle)}" class="img-fluid rounded shadow w-100">
      </div>
      
      <div class="col-md-6">
        <span class="badge bg-primary mb-2">${escapeStringForHtml(courseStatus)}</span>
        <h1 class="mb-3 fw-bold">${escapeStringForHtml(courseTitle)}</h1>
        <h3 class="text-danger mb-4 fw-bold">${escapeStringForHtml(coursePrice)}</h3>
        
        <div class="course-description mb-4">
          <h5 class="fw-bold border-bottom pb-2">Mô tả khóa học</h5>
          <p class="text-muted mt-3 lh-lg">${escapeStringForHtml(courseDetail)}</p>
        </div>
        
        <div class="d-grid gap-2">
          <button class="btn btn-success btn-lg rounded-pill" onclick="enrollCourse()">
            <i class="bi bi-cart-plus me-2"></i>Đăng ký học ngay
          </button>
        </div>
      </div>
    </div>
  `;
}

// ============ HÀM TIỆN ÍCH ============
// Hàm bảo vệ chống tấn công XSS khi render chuỗi ra HTML
function escapeStringForHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// Hàm giả lập đăng ký học
function enrollCourse() {
  alert("Cảm ơn bạn! Chức năng đăng ký đang được tích hợp.");
}