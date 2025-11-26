let menu = document.querySelector('#menu-bars');
let navbar = document.querySelector('.navbar');

menu.onclick = () =>{
    menu.classList.toggle('fa-times');
    navbar.classList.toggle('active');
}
window.onscroll = () =>{
    menu.classList.remove('fa-times');
    navbar.classList.remove('active');
}
document.querySelector('#search-icon').onclick = () =>{
    document.querySelector('#search-form').classList.toggle('active');
}

document.querySelector('#close').onclick = () =>{
    document.querySelector('#search-form').classList.remove('active');
}


// swiper part taken from swiper.js
var swiper = new Swiper(".home-slider", {
    spaceBetween: 30,
    centeredSlides: true,
    autoplay: {
      delay: 4500,
      disableOnInteraction: false,
    },
    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },
    loop:true,
  });


// cuisine dropdown
// Dropdown toggle for keyboard support
document.querySelectorAll(".dropdown-toggle").forEach(toggle => {
  toggle.addEventListener("click", (e) => {
      const dropdownMenu = e.target.nextElementSibling;
      dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
  });
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  document.querySelectorAll(".dropdown-menu").forEach(menu => {
      if (!menu.contains(e.target) && !menu.previousElementSibling.contains(e.target)) {
          menu.style.display = "none";
      }
  });
});



