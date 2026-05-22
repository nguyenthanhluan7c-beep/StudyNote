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
    image: image,
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
    const response = await fetch(API_URL);

    const data = await response.json();

    console.log(data);

    const courseList = document.getElementById("courseList");

    courseList.innerHTML = "";

    data.forEach((course) => {
      courseList.innerHTML += `
      
        <div class="col-md-6 col-lg-4">

          <div class="course-card">

            <img
              src="${course.image}"
              alt="${course.name}"
            />

            <div class="course-content">

              <h5 class="course-title">
                ${course.name}
              </h5>

              <p class="course-desc">
                ${course.detail}
              </p>

              <div class="d-flex justify-content-between align-items-center">

                <span class="course-price">
                  ${course.price}đ
                </span>

                <span class="badge bg-warning">
                  Chờ duyệt
                </span>

              </div>

            </div>

          </div>

        </div>

      `;
    });
  } catch (error) {
    console.log(error);
  }
}
getCourses();
