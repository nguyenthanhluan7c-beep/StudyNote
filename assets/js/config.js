// ===============================
// CONFIG CHUNG CỦA PROJECT
// ===============================
// Sang phần MockAPI mình sẽ thay BASE_URL bằng link API thật.
const CONFIG = {
  appName: "StudyHub",
  themeKey: "studyhub-theme",
  api: {
    // Resource path
    documents: "/documents",
    users: "/users",
    reviews: "/reviews",
    comments: "/comments",
    topics: "/topics",
    categories: "/categories",

    // Mỗi nhóm resource có thể dùng một account MockAPI riêng
    baseUrls: {
      documents: "https://69ff073c8c70b15fa3cafc5c.mockapi.io/api/v1",
      users: "https://69ff073c8c70b15fa3cafc5c.mockapi.io/api/v1",

      reviews: "https://6a058a9faa826ca75c0a164c.mockapi.io/api/v1",
      comments: "https://6a058a9faa826ca75c0a164c.mockapi.io/api/v1",

      topics: "https://69fd352030ad0a6fd1c0936d.mockapi.io/api/v1",
      categories: "https://69fd352030ad0a6fd1c0936d.mockapi.io/api/v1",
    },
  },

  cloudinary: {
    cloudName: "dngjmqa1q",
    uploadPreset: "studyhub_unsigned",

    avatarFolder: "studyhub/avatars",
    documentFolder: "studyhub/documents",
    coverFolder: "studyhub/covers",
  },
};
