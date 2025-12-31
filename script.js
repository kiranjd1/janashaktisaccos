document.addEventListener("DOMContentLoaded", () => {
  const images = document.querySelectorAll(".banners-home img");
  let currentIndex = 0;

  setInterval(() => {
    // Remove the 'active' class from the current image
    images[currentIndex].classList.remove("active");

    // Move to the next image (loop back to the first if at the end)
    currentIndex = (currentIndex + 1) % images.length;

    // Add the 'active' class to the new current image
    images[currentIndex].classList.add("active");
  }, 5000); // Change image every 5 seconds

  const menuToggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".menu");

  menuToggle.addEventListener("click", () => {
    menu.classList.toggle("show"); // Toggle the 'show' class
  });

  const langButtons = document.querySelectorAll(".lang-btn");
  const translatableElements = document.querySelectorAll("[data-en][data-ne]");

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedLang = button.getAttribute("data-lang");

      // Update the content for each translatable element
      translatableElements.forEach((element) => {
          element.textContent = element.getAttribute(`data-${selectedLang}`);
      });
    });
  });

  const nav = document.getElementById('mainNav');
  const threshold = 120;

  function updateScroll() {
    if (window.scrollY > threshold) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateScroll, { passive: true });
  // Run once on load
  updateScroll();

  var modal = document.getElementById("stackImageModal");
  var closeBtn = document.querySelector(".stack-image-close");
  var slides = document.querySelectorAll(".stack-image");
  var current = 0;

  function showSlide(idx) {
      slides.forEach((img, i) => {
          img.classList.toggle("active", i === idx);
      });
  }

  // Show modal and first image on page load
  modal.style.display = "flex";
  showSlide(current);

  closeBtn.onclick = function() {
      current++;
      if (current < slides.length) {
          showSlide(current);
      } else {
          modal.style.display = "none";
      }
  };

  // Optional: close modal if clicking outside the modal-inner
  modal.onclick = function(e) {
      if (e.target === modal) {
          modal.style.display = "none";
      }
  };
});


