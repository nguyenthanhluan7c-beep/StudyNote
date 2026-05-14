//API này chỉ đc sử dụng cho phần thông tin đăng nhập
//Biến ko chạm vào
//==============================
let response
let data
//==============================
//Các hàm làm việc với mock api 
//==============================
async function get() {
    response = await fetch("https://69ff073c8c70b15fa3cafc5c.mockapi.io/api/v1/loggin");
    data = await response.json();
    return data
}
//hàm get để lấy thông tin từ fake database về. Sử dụng get()
async function getPersonalInfo(id) {
    response = await fetch(`https://69ff073c8c70b15fa3cafc5c.mockapi.io/api/v1/loggin/${id}`);
    data = await response.json();
    return data
}
//hàm getPersonalInfo dùng khi lấy thông tin của 1 người . Cách dùng getPersonalInfo(id của người muốn lấy)
async function post(info) {
    response = await fetch("https://69ff073c8c70b15fa3cafc5c.mockapi.io/api/v1/loggin",{
        method: "POST",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(info)
    });
    data = await response.json();
}
//hàm post để đăng TOÀN BỘ thông tin lên fake database về. Sử dụng post(thông tin cần đăng viết theo cấu trúc json)
async function put(info, id) {
    response = await fetch(`https://69ff073c8c70b15fa3cafc5c.mockapi.io/api/v1/loggin/${id}`,{
        method: "PUT",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(info)
    });
    data = await response.json();
}
//hàm put để SỬA thông tin của một fake database có sẵn. Sử dụng put(thông tin cần sửa viết theo cấu trúc json, id của thông tin càn sửa)
//==============================
