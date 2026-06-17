const API_URL = "https://69fd352830ad0a6fd1c093f8.mockapi.io/api/v1/courses";

function getCurrentUser() {
  const raw = localStorage.getItem("currentUser");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (error) {
      console.warn("Không thể phân tích currentUser:", error);
    }
  }
  const id = localStorage.getItem("userId");
  const username = localStorage.getItem("username");
  const role = localStorage.getItem("role");
  return id ? { id, username, role } : null;
}

function handleAddDocumentClick(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }
  const modalElement = document.getElementById("addCourseModal");
  const modal = bootstrap.Modal.getOrCreateInstance(modalElement);
  modal.show();
}

// Hàm thêm tài liệu
async function addCourse() {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const name = document.getElementById("courseName").value;
  const price = document.getElementById("coursePrice").value;
  const image = document.getElementById("courseImage").value;
  const detail = document.getElementById("courseDetail").value;

  if (name === "" || price === "" || image === "" || detail === "") {
    alert("Vui lòng nhập đầy đủ thông tin");
    return;
  }

  const newCourse = {
    name: name,
    price: price,
    image: image,
    detail: detail,
    status: "pending",
    userId: currentUser.id,
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCourse),
    });

    if (!response.ok) throw new Error("Không thể thêm tài liệu lên API");

    alert(
      "Thêm tài liệu thành công! Tài liệu sẽ xuất hiện sau khi admin duyệt.",
    );

    // Reset dữ liệu trong các ô input
    document.getElementById("courseName").value = "";
    document.getElementById("coursePrice").value = "";
    document.getElementById("courseImage").value = "";
    document.getElementById("courseDetail").value = "";

    // Kiểm tra an toàn trước khi ẩn modal
    const modalElement = document.getElementById("addCourseModal");
    let modal = bootstrap.Modal.getInstance(modalElement);
    if (!modal) {
      modal = new bootstrap.Modal(modalElement); // Tự tạo thực thể mới nếu chưa có
    }
    modal.hide();

    // Tải lại danh sách ngay lập tức
    await getCourses();
  } catch (error) {
    console.error("Lỗi tại hàm addCourse:", error);
    alert("Lỗi khi thêm tài liệu, vui lòng kiểm tra Console!");
  }
}

// Hàm lấy và hiển thị tài liệu
async function getCourses() {
  const courseList = document.getElementById("courseList");

  // Kiểm tra nếu HTML chưa sẵn sàng
  if (!courseList) {
    console.error("Lỗi: Không tìm thấy thẻ HTML có id='courseList'");
    return;
  }

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Lỗi kết nối server");

    const data = await response.json();
    console.log("Dữ liệu nhận về từ API:", data);

    courseList.innerHTML = "";

    // Kiểm tra nếu API trả về lỗi hoặc không phải mảng
    if (!Array.isArray(data)) {
      courseList.innerHTML = `
        <div class="alert alert-danger w-100 text-center">
          Lỗi: API không trả về một danh sách hợp lệ!
        </div>`;
      return;
    }

    // Lọc tài liệu chỉ của người dùng hiện tại
    const currentUser = getCurrentUser();
    const userCourses = Array.isArray(data)
      ? data.filter(
          (course) => String(course.userId) === String(currentUser?.id),
        )
      : [];

    if (userCourses.length === 0) {
      courseList.innerHTML = `
        <div class="text-center w-100 py-5 text-muted">
          <i class="bi bi-box-open fs-1 d-block mb-2"></i>
          Bạn chưa đăng tài liệu nào.
        </div>`;
      return;
    }

    // Đổ dữ liệu ra HTML
    userCourses.forEach((course) => {
      // Cơ chế phòng vệ nếu trường dữ liệu bị rỗng (undefined)
      const cName = course.name || "Tài liệu không tên";
      const cDetail =
        course.detail || "Chưa có mô tả chi tiết cho tài liệu này.";
      const cPrice = course.price || "0";
      const cImage =
        course.image || "https://via.placeholder.com/300x220?text=Anh+Trong";
      const status = course.status || "pending";
      const statusBadge =
        status === "approved"
          ? '<span class="badge bg-success">Đã duyệt</span>'
          : status === "rejected"
            ? '<span class="badge bg-danger">Bị từ chối</span>'
            : '<span class="badge bg-warning">Chờ duyệt</span>';

      courseList.innerHTML += `
        <div class="col-md-6 col-lg-4">
          <div class="course-card visible h-100 bg-white">
            <img
              src="${cImage}"
              alt="${cName}"
              onerror="this.src='https://via.placeholder.com/300x220?text=Loi+Lien+Ket+Anh'"
            />
            <div class="course-content">
              <h5 class="course-title">${cName}</h5>
              <p class="course-desc">${cDetail}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="course-price">${cPrice}đ</span>
                ${statusBadge}
              </div>
            </div>
          </div>
        </div>
      `;
    });
  } catch (error) {
    console.error("Lỗi tại hàm getCourses:", error);
    courseList.innerHTML = `
      <div class="alert alert-danger w-100 text-center">
        Không thể kết nối tới API. Vui lòng bấm F12 xem tab Console.
      </div>`;
  }
}

// Đảm bảo HTML được dựng xong hoàn toàn mới chạy hàm lấy dữ liệu
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  const addBtn = document.getElementById("addDocumentBtn");
  if (addBtn) {
    addBtn.addEventListener("click", handleAddDocumentClick);
  }

  getCourses(currentUser);
});
