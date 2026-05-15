//API chứa những hàm sử dụng nhiều 
//========================================================
//  kho chứa biến 
const default_img = [
    "linear-gradient(135deg,rgb(195, 82, 82), rgb(75, 126, 162))",
    "linear-gradient(135deg,rgb(145, 214, 216), rgb(33, 107, 159))",
    "linear-gradient(135deg,rgb(82, 184, 195), rgb(75, 126, 162))",
    "linear-gradient(135deg,rgb(195, 82, 82), rgb(75, 162, 97))",
    "linear-gradient(135deg,rgb(247, 247, 247), rgb(0, 0, 0))",
    "linear-gradient(135deg,rgb(255, 0, 0), rgb(158, 162, 75))",
    "linear-gradient(135deg,rgb(195, 82, 120), rgb(159, 75, 162))",
    "linear-gradient(135deg,rgb(99, 195, 82), rgb(162, 123, 75))",
    "linear-gradient(135deg,rgb(195, 82, 171), rgb(87, 75, 162))",
    "linear-gradient(135deg,rgb(108, 82, 195), rgb(152, 162, 75))",
]
//========================================================
//hàm dùng để load hình ảnh + thông tin người dùng từ data
function loadAdminImage(adminData, imgELement) {
    const imgWrapper = document.getElementById(imgELement);
    if (adminData.user_image === "default_img"){
        imgWrapper.className = "admin-avatar";
        imgWrapper.style.backgroundImage = default_img[adminData.id % 10];
        imgWrapper.innerText = adminData.username[0].toUpperCase();
    }
}
