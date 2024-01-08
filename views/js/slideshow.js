const slides = document.getElementsByClassName("mySlides");
const dots = document.getElementsByClassName("dot");
const dotsContainer = document.getElementById("dots");
const slider = document.querySelector(".slideshow-container");
const hammer = new Hammer(slider);

// Dynamically generate dots
const generateDots = (() => {
  for (let i = 0; i < slides.length; i++) {
    let dot = document.createElement("span");
    dot.className = "dot";
    dot.setAttribute("onclick", "currentSlide(" + (i + 1) + ")");
    dotsContainer.appendChild(dot);
  }
})();

let slideIndex = 1;
showSlides(slideIndex);

// Next/previous controls
function plusSlides(n) {
  showSlides(slideIndex += n);
}

// Thumbnail image controls
function currentSlide(n) {
  showSlides(slideIndex = n);
}

function showSlides(n) {

  if (n > slides.length) {
    slideIndex = 1;
  }
  else if (n < 1) {
    slideIndex = slides.length;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  for (let i = 0; i < dots.length; i++) {
    dots[i].className = dots[i].className.replace(" active", "");
  }

  slides[slideIndex - 1].style.display = "flex";
  dots[slideIndex - 1].className += " active";
}


// Automatic slideshow

var slideInterval;

function startAutoSlide() {
  slideInterval = setInterval(function () {
    plusSlides(1);
  }, 5000); // Change slide every 5 seconds
}

function stopAutoSlide() {
  clearInterval(slideInterval);
}

// Call the auto slide function when the page loads
window.addEventListener("load", startAutoSlide);

// Pause auto slide when the user interacts with the slider
var sliderContainer = document.querySelector(".slideshow-container");
sliderContainer.addEventListener("mouseenter", stopAutoSlide);
sliderContainer.addEventListener("mouseleave", startAutoSlide);

// Initialize Hammer.js for swipe gestures

hammer.on("swipeleft", function () {
  plusSlides(1);
});

hammer.on("swiperight", function () {
  plusSlides(-1);
});

window.addEventListener('DOMContentLoaded', function () {
  var videos = document.querySelectorAll('.imgslider-content');

  videos.forEach(function (video) {
    if (window.matchMedia('(max-width: 650px)').matches) {
      // For mobile
      video.src = video.getAttribute('data-mobile-src');
    } else {
      // For desktop and tablets
      video.src = video.getAttribute('data-desktop-src');
    }
  });
});