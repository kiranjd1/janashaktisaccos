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


  const menuToggle = document.querySelector('.menu-toggle');
  const navMenu = document.querySelector('.menu');

  menuToggle.addEventListener('click', function() {
    // Toggles the 'active' class which triggers the CSS display: flex
    navMenu.classList.toggle('active');
    
    // Optional: Change icon from bars to 'X' if using FontAwesome
    const icon = menuToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.classList.replace('fa-bars', 'fa-times');
    } else {
      icon.classList.replace('fa-times', 'fa-bars');
    }
  });

  const langButtons = document.querySelectorAll(".lang-btn");
  const translatableElements = document.querySelectorAll("[data-en][data-ne]");

  langButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const selectedLang = button.getAttribute("data-lang");

      // Update the content for each translatable element
      translatableElements.forEach((element) => {
        if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
          element.placeholder = element.getAttribute(`data-${selectedLang}`);
        } else {
          element.innerText = element.getAttribute(`data-${selectedLang}`);
        }
      });

      // Remove .active from all buttons
      langButtons.forEach((btn) => btn.classList.remove("active"));

      // Add .active to the clicked button
      button.classList.add("active");
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, {
    threshold: 0.1
  });

  // Target all elements with the class
  const elements = document.querySelectorAll('.scroll-underline');
  elements.forEach((el) => observer.observe(el));

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


