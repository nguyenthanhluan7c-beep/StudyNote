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
document.querySelectorAll(".course-overlay button").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    this.classList.toggle("liked");
    const icon = this.querySelector("i");
    if (this.classList.contains("liked")) {
      icon.classList.remove("bi-heart");
      icon.classList.add("bi-heart-fill");
    } else {
      icon.classList.add("bi-heart");
      icon.classList.remove("bi-heart-fill");
    }
  });
});

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
// ============ LOGIN SWITCH ==================
$("#loginBtn").click(function(){
    window.location.href = "login.html";
});