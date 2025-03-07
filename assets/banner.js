document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".nav");

  menuToggle.addEventListener("click", function () {
    document
      .querySelector(".banner-head")
      .classList.toggle("banner-head-mobile");
    document
      .querySelector(".banner-body")
      .classList.toggle("banner-body-mobile");
    nav.classList.toggle("active");
    menuToggle.classList.toggle("active");
  });
});
