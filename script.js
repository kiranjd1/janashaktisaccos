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
  const menu = document.querySelector('.menu');
  const hasDropdowns = document.querySelectorAll('.has-dropdown');

  // Toggle Mobile Menu
  menuToggle.addEventListener('click', () => {
      menu.classList.toggle('active');
      
      // Change icon from Bars to X
      const icon = menuToggle.querySelector('i');
      if (menu.classList.contains('active')) {
          icon.classList.replace('fa-bars', 'fa-times');
      } else {
          icon.classList.replace('fa-times', 'fa-bars');
      }
  });

  // Handle Mobile Dropdowns on Click
  hasDropdowns.forEach(dropdown => {
      dropdown.addEventListener('click', function(e) {
          if (window.innerWidth <= 768) {
              // If clicking the parent link, prevent navigation and toggle dropdown
              e.preventDefault();
              this.classList.toggle('active');
          }
      });
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

  function scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      
      if (element) {
          const navHeight = 116; 
          const extraPadding = 14;
          
          // offsetTop gets the position relative to the top of the whole document
          const targetPosition = element.offsetTop - (navHeight + extraPadding);

          window.scrollTo({
              top: targetPosition,
              behavior: "smooth"
          });
      }
  }

  // Updated showBoard to handle the event properly and center the view
  function showBoard(boardId, btnElement) {
    // 1. Reset content
    document.querySelectorAll('.board-content').forEach(section => {
        section.classList.remove('active-content');
    });

    // 2. Reset buttons
    document.querySelectorAll('.selector-btn').forEach(btn => {
        btn.classList.remove('active');
    });

    // 3. Show new content
    const targetBoard = document.getElementById('board-' + boardId);
    if (targetBoard) {
        targetBoard.classList.add('active-content');
    }

    // 4. Set active button (use btnElement instead of 'event')
    if (btnElement) {
        btnElement.classList.add('active');
    }

    // 5. Scroll to the section after a short delay (for the content to render)
    setTimeout(() => {
        scrollToSection('board-members-section');
    }, 100);
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault(); // Stop the jumping behavior
      
      const targetId = this.getAttribute('href').substring(1);
      scrollToSection(targetId);
    });
  });

});


