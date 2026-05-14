//API này chỉ đc sử dụng cho phần thông tin đăng nhập
//Biến ko chạm vào
//==============================
let response
let data
//==============================
//Các hàm làm việc với api 
//==============================

// TODO: Thêm base URL API của bạn vào đây
const API_BASE_URL = "";

async function get() {
    response = await fetch(`${API_BASE_URL}/`);
    data = await response.json();
    return data
}
//hàm get để lấy thông tin từ database về. Sử dụng get()

async function getPersonalInfo(id) {
    response = await fetch(`${API_BASE_URL}/${id}`);
    data = await response.json();
    return data
}
//hàm getPersonalInfo dùng khi lấy thông tin của 1 người . Cách dùng getPersonalInfo(id của người muốn lấy)

async function post(info) {
    response = await fetch(`${API_BASE_URL}/`,{
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(info)
    });
    data = await response.json();
}
//hàm post để đăng TOÀN BỘ thông tin lên database. Sử dụng post(thông tin cần đăng viết theo cấu trúc json)

async function put(info, id) {
    response = await fetch(`${API_BASE_URL}/${id}`,{
        method: "PUT",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(info)
    });
    data = await response.json();
}
//hàm put để SỬA thông tin của một bản ghi có sẵn. Sử dụng put(thông tin cần sửa viết theo cấu trúc json, id của thông tin cần sửa)
//==============================
