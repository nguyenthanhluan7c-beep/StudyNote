// ===============================
// CLOUDINARY.JS
// Upload file/image lên Cloudinary dùng chung
// ===============================

async function uploadToCloudinary(file, resourceType = "auto") {
  const cloudName = CONFIG.cloudinary.cloudName;
  const uploadPreset = CONFIG.cloudinary.uploadPreset;

  if (!cloudName || !uploadPreset) {
    throw new Error("Thiếu cloudName hoặc uploadPreset trong config.js");
  }

  const formData = new FormData();

  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);

  const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });

  const data = await response.json();

  console.log("Cloudinary upload response:", data);

  if (!response.ok) {
    const message =
      data.error && data.error.message
        ? data.error.message
        : "Upload Cloudinary thất bại.";

    throw new Error(message);
  }

  return data;
}

// Tạo ảnh preview từ trang đầu PDF đã upload lên Cloudinary
function buildPdfFirstPagePreview(publicId) {
  return `https://res.cloudinary.com/${CONFIG.cloudinary.cloudName}/image/upload/pg_1,w_1200,h_700,c_fill,q_auto,f_jpg/${publicId}.jpg`;
}

// Ảnh mặc định theo môn học nếu không lấy được preview từ file
function getDefaultCoverBySubject(subject) {
  const covers = {
    "Lập trình Web":
      "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=1200",
    "Thiết kế Web":
      "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200",
    "Toán cao cấp":
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200",
    "Tiếng Anh":
      "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1200",
    "Kinh tế":
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=1200",
    Khác: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1200",
  };

  return covers[subject] || covers["Khác"];
}
