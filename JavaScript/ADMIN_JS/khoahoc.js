const API_URL =
  "https://69fd352830ad0a6fd1c093f8.mockapi.io/api/v1/themthongtin";

async function addCourse() {
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
    img: image,
    detail: detail,
    status: "pending",
  };

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newCourse),
    });

    const data = await response.json();

    console.log(data);

    alert("Thêm khóa học thành công!");

    // reset input
    document.getElementById("courseName").value = "";
    document.getElementById("coursePrice").value = "";
    document.getElementById("courseImage").value = "";
    document.getElementById("courseDetail").value = "";

    // đóng modal
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("addCourseModal"),
    );

    modal.hide();

    // Gọi getCourses() để refresh danh sách
    setTimeout(() => {
      getCourses();
    }, 300);
  } catch (error) {
    console.log(error);

    alert("Lỗi khi thêm khóa học");
  }
}
async function getCourses() {
  try {
    console.log("Fetching courses from:", API_URL);
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("API Response:", data);
    console.log("Data length:", data?.length);

    const courseList = document.getElementById("courseList");

    if (!courseList) {
      console.error("courseList element not found!");
      alert("Lỗi: Không tìm thấy phần tử courseList");
      return;
    }

    if (!data || data.length === 0) {
      console.log("No courses found");
      courseList.innerHTML = "<p class='text-center'>Chưa có khóa học nào</p>";
      return;
    }

    let html = "";

    data.forEach((course) => {
      console.log("Processing course:", course);

      html += `
        <div class="col-md-6 col-lg-4">
          <div class="course-card">
            <img src="${course.img || ""}" alt="${course.name || "Khóa học"}" style="height: 220px; object-fit: cover;" />
            <div class="course-content">
              <h5 class="course-title">${course.name || "Chưa đặt tên"}</h5>
              <p class="course-desc">${course.detail || "Chưa có mô tả"}</p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="course-price">${course.price || "0"}đ</span>
                <span class="badge bg-warning">Chờ duyệt</span>
              </div>
            </div>
          </div>
        </div>
      `;
    });

    courseList.innerHTML = html;
    console.log("Rendered successfully");
  } catch (error) {
    console.error("Error fetching courses:", error);
    const courseList = document.getElementById("courseList");
    if (courseList) {
      courseList.innerHTML = `<p class='text-danger'>Lỗi khi tải danh sách: ${error.message}</p>`;
    }
  }
}

// Gọi getCourses khi DOM đã ready
document.addEventListener("DOMContentLoaded", () => {
  getCourses();
});
