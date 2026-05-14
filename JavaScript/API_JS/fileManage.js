//=====Dùng để quản lý file==========
//===========ĐĂNG FILE LÊN CLOUD=====
async function uploadFile(formData) {
    const response = await fetch("https://api.cloudinary.com/v1_1/dngjmqa1q/auto/upload",{
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
function createFormData(file, storage) {
  const formData = new FormData() ;
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