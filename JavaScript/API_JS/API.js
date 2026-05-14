//api tổng hợp
//url api cố định
const api_url = {
  LOGIN_API_URL: "https://69ff073c8c70b15fa3cafc5c.mockapi.io/api/v1/loggin",
  DOCUMENT_API_URL: "https://69ff073c8c70b15fa3cafc5c.mockapi.io/api/v1/document",
  COMMENT_API_URL: "https://6a058a9faa826ca75c0a164c.mockapi.io/api/v1/comment",
  REVIEW_API_URL: "https://6a058a9faa826ca75c0a164c.mockapi.io/api/v1/review",
};
//hàm export api url
function getApiUrl() {
  return api_url
}
//hàm lấy tất cả thông tin
async function get(api_url) {
  const response = await fetch(api_url);
  const data = await response.json();
  return data;
}
//hàm lấy thông tin của 1 phần tử thông qua id của phần tử
async function getOneById(api_url, id) {
  const response = await fetch(`${api_url}/${id}`);
  const data = await response.json();
  return data;
}
//hàm lấy thông tin của 1 phần tử thông qua 1 dữ kiện
async function getOneByElement(api_url, elementName, elementValue) {
  const response = await fetch(`${api_url}?${elementName}=${elementValue}`);
  const data = await response.json();
  return data;
}
//hàm gửi toàn bộ thông tin lên api
async function post(api_url, info) {
  const response = await fetch(api_url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(info),
  });
  const data = await response.json();
}
//hàm gửi 1 phần thông tin lên api
async function put(api_url, info, id) {
  const response = await fetch(`${api_url}/${id}`, {
    method: "PUT",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify(info),
  });
  const data = await response.json();
}
//hàm xóa 1 phần tử thông qua id
async function remove(api_url, id) {
  const response = await fetch(`${api_url}/${id}`, {
    method: "DELETE",
  });
  const data = await response.json();
}