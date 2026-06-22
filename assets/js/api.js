// ===============================
// API.JS
// Hỗ trợ nhiều account MockAPI cho nhiều resource
// ===============================

// Xác định resource key từ path truyền vào
// Ví dụ:
// "/documents"     -> "documents"
// "/documents/123" -> "documents"
function getResourceKey(resource) {
  if (resource.startsWith(CONFIG.api.documents)) {
    return "documents";
  }

  if (resource.startsWith(CONFIG.api.users)) {
    return "users";
  }

  if (resource.startsWith(CONFIG.api.reviews)) {
    return "reviews";
  }

  if (resource.startsWith(CONFIG.api.comments)) {
    return "comments";
  }

  if (resource.startsWith(CONFIG.api.topics)) {
    return "topics";
  }

  if (resource.startsWith(CONFIG.api.categories)) {
    return "categories";
  }

  throw new Error("Không xác định được resource: " + resource);
}

// Lấy baseUrl đúng theo resource
function getBaseUrlByResource(resource) {
  const resourceKey = getResourceKey(resource);
  const baseUrl = CONFIG.api.baseUrls[resourceKey];

  if (!baseUrl) {
    throw new Error("Chưa cấu hình baseUrl cho resource: " + resourceKey);
  }

  return baseUrl;
}

// Tạo URL hoàn chỉnh
function buildApiUrl(resource, params = {}) {
  const baseUrl = getBaseUrlByResource(resource);

  const url = new URL(baseUrl + resource);

  Object.keys(params).forEach(function (key) {
    if (
      params[key] !== undefined &&
      params[key] !== null &&
      params[key] !== ""
    ) {
      url.searchParams.append(key, params[key]);
    }
  });

  return url.toString();
}

// GET
async function apiGet(resource, params = {}) {
  const url = buildApiUrl(resource, params);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("GET API thất bại: " + url);
  }

  return await response.json();
}

// POST
async function apiPost(resource, data) {
  const url = buildApiUrl(resource);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("POST API thất bại: " + url);
  }

  return await response.json();
}

// PUT
async function apiPut(resource, id, data) {
  const url = buildApiUrl(`${resource}/${id}`);

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("PUT API thất bại: " + url);
  }

  return await response.json();
}

// DELETE
async function apiDelete(resource, id) {
  const url = buildApiUrl(`${resource}/${id}`);

  const response = await fetch(url, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("DELETE API thất bại: " + url);
  }

  return await response.json();
}
