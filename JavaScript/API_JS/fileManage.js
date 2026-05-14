//=====Dùng để quản lý file==========
//===========ĐĂNG FILE LÊN CLOUD=====

// TODO: Thêm URL upload API của bạn vào đây
const UPLOAD_API_URL = "";

async function uploadFile(formData) {
    const response = await fetch(UPLOAD_API_URL,{
        method: "POST",
        body: formData
    }); 
    const data = await response.json();   
    console.log(data.secure_url);
    return data.secure_url;
}
//lưu ý phải tạo formData trước khi upload

//==========HÀM TẠO FILE CHUẨN FORM==
//Sử dụng để tạo formData trước khi upload

// TODO: Thêm tên upload preset của bạn vào đây (nếu dùng Cloudinary)
function createFormData(file, storage) {
  const formData = new FormData();
  formData.append(
      "file",
      file
    );
    formData.append(
      "upload_preset",
      storage
    );
    return formData;
}