// ============ NAVBAR SHADOW ON SCROLL ============
const navbar = document.getElementById("navbar");
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

// ============ SMOOTH SCROLL ============
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// ============ HEART BUTTON TOGGLE ============
// Course data for favorites
const courseData = {
  1: {
    id: 1,
    title: "C++ nâng cao",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/C___Advance_1c572a2e59e5405cb057e864d3590d34.png",
  },
  2: {
    id: 2,
    title: "Cấu trúc dữ liệu và giải thuật",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/cau-truc-du-lieu-va-giai-thuat_ef33392c074c4cd29a9892f11abbc2bc.png",
  },
  3: {
    id: 3,
    title: "Làm quen với SQL",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/lam-quen-voi-sql_2f374a8d41f34eceab306830d4aea433.png",
  },
  4: {
    id: 4,
    title: "C# cơ bản",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/csharp-co-ban_96ca03bee27f454eb1f1c86e1fc5ef74.png",
  },
  5: {
    id: 5,
    title: "JavaScript cơ bản",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/Javascript-co-ban__2__be74112f409f47e9874f0da758c1d7cb.png",
  },
  6: {
    id: 6,
    title: "Lập trình hướng đối tượng trong C++",
    image:
      "https://s3-hfx03.fptcloud.com/codelearnstorage/files/thumbnails/lap-trinh-huong-doi-tuong-trong-cpp_653cb309970b492ca7f69162384814f8.png",
  },
};

// Initialize favorite buttons
function initFavoriteButtons() {
  document.querySelectorAll(".course-overlay button").forEach((btn) => {
    const courseCard = btn.closest(".course-card");
    const courseIndex =
      Array.from(document.querySelectorAll(".course-card")).indexOf(
        courseCard,
      ) + 1;

    btn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      toggleFavorite(courseIndex, btn);
    });

    // Check if course is already in favorites
    if (isCourseInFavorites(courseIndex)) {
      btn.classList.add("liked");
      const icon = btn.querySelector("i");
      icon.classList.remove("bi-heart");
      icon.classList.add("bi-heart-fill");
    }
  });
}

// Get favorites from localStorage
function getFavorites() {
  const favorites = localStorage.getItem("favoritesCourses") || "[]";
  return JSON.parse(favorites);
}

// Save favorites to localStorage
function saveFavorites(favorites) {
  localStorage.setItem("favoritesCourses", JSON.stringify(favorites));
}

// Check if course is in favorites
function isCourseInFavorites(courseId) {
  const favorites = getFavorites();
  return favorites.some((fav) => fav.id === courseId);
}

// Toggle favorite
function toggleFavorite(courseId, btn) {
  let favorites = getFavorites();
  const course = courseData[courseId];

  if (isCourseInFavorites(courseId)) {
    // Remove from favorites
    favorites = favorites.filter((fav) => fav.id !== courseId);
    btn.classList.remove("liked");
    const icon = btn.querySelector("i");
    icon.classList.add("bi-heart");
    icon.classList.remove("bi-heart-fill");
  } else {
    // Add to favorites
    favorites.push({
      id: courseId,
      title: course.title,
      image: course.image,
    });
    btn.classList.add("liked");
    const icon = btn.querySelector("i");
    icon.classList.remove("bi-heart");
    icon.classList.add("bi-heart-fill");
  }

  saveFavorites(favorites);
}

// ============ COURSE CARD ANIMATION ON SCROLL ============
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry, index) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add("visible");
      }, index * 100);
      observer.unobserve(entry.target);
    }
  });
}, observerOptions);

document.querySelectorAll(".course-card").forEach((card) => {
  observer.observe(card);
});

// ============ FILTER INTERACTION ============
document
  .querySelectorAll('.filter-group input[type="checkbox"]')
  .forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      console.log(`${this.id} is ${this.checked ? "checked" : "unchecked"}`);
      // Apply filter logic here
    });
  });
// ============ VIEW COURSE DETAIL ============
function viewCourseDetail(id, title, image) {
  const courseData = {
    id: id,
    title: title,
    image: image,
  };
  localStorage.setItem("selectedCourse", JSON.stringify(courseData));
  window.location.href = "./chitiet.html";
}

// ============ LOGOUT ============
function handleLogout() {
  localStorage.removeItem("isLoggedIn");
  window.location.href = "login.html";
}
// Check auth on page load
document.addEventListener("DOMContentLoaded", () => {
  const logged = localStorage.getItem("isLoggedIn");
  const role = localStorage.getItem("role");
  if(logged !== "true") {
    window.location.href = "login.html";
    return;
  }
  if(role === "admin") {
    window.location.href = "admin.html";
  }
});
