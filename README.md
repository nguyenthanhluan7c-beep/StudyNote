# StudyHub - Free Learning Community

StudyHub là website chia sẻ tài liệu học tập miễn phí kết hợp diễn đàn hỏi đáp. Dự án được xây dựng bằng HTML, CSS, Bootstrap, JavaScript, jQuery, Fetch API, MockAPI và Cloudinary.

## Mục tiêu dự án

StudyHub giúp người dùng:

* Đăng ký, đăng nhập tài khoản.
* Chia sẻ tài liệu học tập miễn phí.
* Tìm kiếm, lọc và sắp xếp tài liệu.
* Xem chi tiết tài liệu, mở file, ghi nhận lượt xem và lượt tải.
* Đánh giá, bình luận và phản hồi bình luận.
* Tạo chủ đề thảo luận trong diễn đàn.
* Bình luận và phản hồi trong chủ đề diễn đàn.
* Quản lý tài liệu cá nhân.
* Quản trị dữ liệu thông qua trang Admin demo.

## Công nghệ sử dụng

* HTML5
* CSS3
* Bootstrap 5
* Bootstrap Icons
* JavaScript
* jQuery
* Fetch API
* LocalStorage
* MockAPI
* Cloudinary
* Git / GitHub

## Chức năng chính

### Người dùng

* Đăng ký tài khoản.
* Đăng nhập / đăng xuất.
* Lưu trạng thái đăng nhập bằng LocalStorage.
* Cập nhật avatar cá nhân.
* Upload và crop avatar.
* Xem thống kê tài liệu cá nhân.
* Quản lý tài liệu đã đăng.

### Tài liệu

* Xem danh sách tài liệu.
* Tìm kiếm tài liệu theo tiêu đề, mô tả, tác giả.
* Lọc tài liệu theo môn học.
* Sắp xếp theo:

  * Mới nhất
  * Lượt xem
  * Lượt tải
  * Đánh giá cao nhất
  * Tên A-Z
* Phân trang danh sách tài liệu.
* Xem chi tiết tài liệu.
* Mở file tài liệu từ Cloudinary.
* Ghi nhận lượt xem.
* Ghi nhận lượt tải.
* Đăng tài liệu mới.
* Upload file tài liệu lên Cloudinary.
* Upload ảnh preview tài liệu.
* Sửa tài liệu của chính người đăng.
* Xóa tài liệu của chính người đăng.

### Đánh giá và bình luận

* Đánh giá tài liệu bằng sao.
* Tính điểm đánh giá trung bình.
* Bình luận tài liệu.
* Trả lời bình luận tài liệu.
* Bình luận và reply được lưu trên MockAPI.

### Diễn đàn

* Xem danh sách chủ đề.
* Tìm kiếm chủ đề.
* Lọc chủ đề theo môn học và trạng thái.
* Tạo chủ đề mới.
* Like chủ đề.
* Xem chi tiết chủ đề.
* Bình luận trong chủ đề.
* Trả lời bình luận trong chủ đề.
* Chủ topic có thể đổi trạng thái:

  * Đang hỏi
  * Thảo luận
  * Đã giải quyết

### Trang chủ

* Hiển thị thống kê tổng quan.
* Hiển thị tài liệu nổi bật.
* Hiển thị chủ đề mới nhất.
* Hiển thị hoạt động mới nhất từ:

  * Tài liệu
  * Chủ đề
  * Bình luận
  * Đánh giá

### Admin demo

Trang Admin mô phỏng chức năng quản trị dữ liệu:

* Xem dashboard thống kê.
* Quản lý tài liệu.
* Quản lý người dùng.
* Đổi role người dùng.
* Quản lý chủ đề.
* Đổi trạng thái chủ đề.
* Quản lý bình luận.
* Quản lý đánh giá.
* Tìm kiếm dữ liệu theo từng tab.

> Lưu ý: Trang Admin trong dự án này chỉ mô phỏng phân quyền bằng Front-end và MockAPI. Đây không phải cơ chế bảo mật thật như hệ thống Backend production.

## Cấu trúc thư mục

```txt
StudyHub/
├── index.html
├── documents.html
├── document-detail.html
├── upload.html
├── login.html
├── profile.html
├── forum.html
├── topic-detail.html
├── admin.html
├── README.md
└── assets/
    ├── css/
    │   ├── base.css
    │   ├── components.css
    │   ├── home.css
    │   ├── documents.css
    │   ├── document-detail.css
    │   ├── upload.css
    │   ├── login.css
    │   ├── profile.css
    │   ├── forum.css
    │   ├── topic-detail.css
    │   ├── admin.css
    │   └── responsive.css
    └── js/
        ├── config.js
        ├── api.js
        ├── auth.js
        ├── cloudinary.js
        ├── ui.js
        ├── main.js
        ├── documents.js
        ├── document-detail.js
        ├── upload.js
        ├── login.js
        ├── profile.js
        ├── forum.js
        ├── topic-detail.js
        └── admin.js
```

## Cấu hình MockAPI

Dự án sử dụng MockAPI để lưu dữ liệu. Cần tạo các resource sau:

```txt
documents
users
reviews
comments
topics
categories
```

Ví dụ cấu hình trong `assets/js/config.js`:

```js
const CONFIG = {
  appName: "StudyHub",
  themeKey: "studyhub-theme",

  api: {
    documents: "/documents",
    users: "/users",
    reviews: "/reviews",
    comments: "/comments",
    topics: "/topics",
    categories: "/categories",

    baseUrls: {
      documents: "https://YOUR_MOCKAPI_URL/api/v1",
      users: "https://YOUR_MOCKAPI_URL/api/v1",
      reviews: "https://YOUR_MOCKAPI_URL/api/v1",
      comments: "https://YOUR_MOCKAPI_URL/api/v1",
      topics: "https://YOUR_MOCKAPI_URL/api/v1",
      categories: "https://YOUR_MOCKAPI_URL/api/v1",
    },
  },

  cloudinary: {
    cloudName: "YOUR_CLOUDINARY_CLOUD_NAME",
    uploadPreset: "YOUR_UNSIGNED_UPLOAD_PRESET",
    avatarFolder: "studyhub/avatars",
    documentFolder: "studyhub/documents",
    coverFolder: "studyhub/covers",
  },
};
```

## Cấu hình Cloudinary

Dự án sử dụng Cloudinary để upload:

* Avatar người dùng
* Ảnh preview tài liệu
* File tài liệu

Cần bật unsigned upload preset trong Cloudinary.

Nếu muốn mở file PDF trực tiếp từ Cloudinary, cần bật:

```txt
Settings → Security → Allow delivery of PDF and ZIP files
```

Không được đưa API Secret của Cloudinary vào Front-end.

## Cách chạy dự án

Vì đây là dự án Front-end thuần, có thể mở trực tiếp bằng trình duyệt hoặc dùng Live Server.

Cách khuyến nghị:

1. Mở project bằng VS Code.
2. Cài extension Live Server.
3. Chuột phải `index.html`.
4. Chọn `Open with Live Server`.

## Tài khoản Admin

Để dùng trang Admin, vào MockAPI resource `users` và sửa user cần cấp quyền:

```js
role: "admin"
```

User thường:

```js
role: "student"
```

Sau khi đổi role, đăng xuất và đăng nhập lại để cập nhật quyền.

## Ghi chú bảo mật

Dự án này phục vụ mục đích học tập Front-end. Một số chức năng như đăng nhập, phân quyền admin, lưu mật khẩu và kiểm tra quyền chỉ mang tính mô phỏng.

Trong hệ thống thật, cần có Backend để xử lý:

* Xác thực người dùng
* Mã hóa mật khẩu
* Phân quyền bảo mật
* Xóa file Cloudinary bằng API Secret
* Kiểm tra dữ liệu phía server
* Chống chỉnh sửa dữ liệu trái phép

## Hướng phát triển thêm

* Thêm Backend thật bằng Node.js, PHP hoặc Java Spring Boot.
* Thêm database thật như MySQL hoặc MongoDB.
* Thêm xác thực JWT.
* Thêm gửi email xác minh.
* Thêm upload nhiều file cho một tài liệu.
* Thêm báo cáo vi phạm tài liệu hoặc bình luận.
* Thêm dashboard biểu đồ cho Admin.
* Thêm phân quyền chi tiết hơn.

## Tác giả

Dự án được thực hiện bởi sinh viên trong quá trình học và thực hành xây dựng website Front-end.

```txt
StudyHub - Free Learning Community
```
