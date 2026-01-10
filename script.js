document.addEventListener("DOMContentLoaded", () => {

  // Loader
  function initLoader() {
    const loader = document.getElementById("preloader");
    if (!loader) return;

    window.addEventListener("load", () => {
      loader.classList.add("loader-hidden");

      loader.addEventListener("transitionend", () => {
        // loader.remove();
      });

      setTimeout(() => {
        loader.classList.add("loader-hidden");
      }, 5000);
    });
  }

  // Banner slideshow
  function initBannerSlideshow() {
    const images = document.querySelectorAll(".banners-home img");
    if (!images.length) return;

    let currentIndex = 0;
    setInterval(() => {
      images[currentIndex].classList.remove("active");
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add("active");
    }, 5000);
  }

  // Mobile menu
  function initMenu() {
    const menuToggle = document.querySelector(".menu-toggle");
    const menu = document.querySelector(".menu");
    const hasDropdowns = document.querySelectorAll(".has-dropdown");

    if (!menuToggle || !menu) return;

    menuToggle.addEventListener("click", () => {
      menu.classList.toggle("active");
      const icon = menuToggle.querySelector("i");
      if (icon) {
        if (menu.classList.contains("active")) {
          icon.classList.replace("fa-bars", "fa-times");
        } else {
          icon.classList.replace("fa-times", "fa-bars");
        }
      }
    });

    hasDropdowns.forEach(dropdown => {
      dropdown.addEventListener("click", function (e) {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          this.classList.toggle("active");
        }
      });
    });
  }

  // Language switcher
  function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll(".lang-btn");
    const translatableElements = document.querySelectorAll("[data-en][data-ne]");
    if (!langButtons.length || !translatableElements.length) return;

    langButtons.forEach(button => {
      button.addEventListener("click", () => {
        const selectedLang = button.getAttribute("data-lang");
        translatableElements.forEach(element => {
          if (element.tagName === "INPUT" || element.tagName === "TEXTAREA") {
            element.placeholder = element.getAttribute(`data-${selectedLang}`);
          } else {
            element.innerText = element.getAttribute(`data-${selectedLang}`);
          }
        });
        langButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }

  // Scroll underline animation
  function initScrollUnderline() {
    const elements = document.querySelectorAll(".scroll-underline");
    if (!elements.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
        } else {
          entry.target.classList.remove("active");
        }
      });
    }, { threshold: 0.1 });

    elements.forEach(el => observer.observe(el));
  }

  // Navbar scroll effect
  function initNavbarScroll() {
    const nav = document.getElementById("mainNav");
    if (!nav) return;

    const threshold = 120;
    function updateScroll() {
      if (window.scrollY > threshold) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    }
    window.addEventListener("scroll", updateScroll, { passive: true });
    updateScroll();
  }

  // Modal slideshow
  function initModal() {
    const modal = document.getElementById("modal");
    const closeBtn = document.querySelector(".modal-close");
    const slides = document.querySelectorAll(".modal-img");
    if (!modal || !closeBtn || !slides.length) return;

    let current = 0;

    function initStack() {
      slides.forEach((img, i) => {
        img.style.zIndex = slides.length - i;
      });
    }

    modal.style.display = "flex";
    initStack();

    closeBtn.onclick = function () {
      if (current < slides.length) {
        slides[current].classList.add("hidden");
        current++;
        if (current === slides.length) {
          modal.style.display = "none";
        }
      }
    };

    modal.onclick = function (e) {
      if (e.target === modal) {
        modal.style.display = "none";
      }
    };
  }

  // Smooth scroll
  function initSmoothScroll() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    if (!anchors.length) return;

    function scrollToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (element) {
        const navHeight = 116;
        const extraPadding = 14;
        const targetPosition = element.offsetTop - (navHeight + extraPadding);
        window.scrollTo({ top: targetPosition, behavior: "smooth" });
      }
    }

    anchors.forEach(anchor => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const targetId = this.getAttribute("href").substring(1);
        scrollToSection(targetId);
      });
    });
  }

  // --- Show Board ---
  function initShowBoard() {
    const boardSelect = document.getElementById("board-select");
    if (!boardSelect) return;

    function showBoard(boardId) {
      // Reset content
      document.querySelectorAll(".board-content").forEach(section => {
        section.classList.remove("active-content");
      });

      // Show new content
      const targetBoard = document.getElementById("board-" + boardId);
      if (targetBoard) {
        targetBoard.classList.add("active-content");
      }
    }

    // Attach change listener
    boardSelect.addEventListener("change", () => {
      const boardId = boardSelect.value;
      showBoard(boardId);
    });

    // Initialize default state
    showBoard(boardSelect.value);
  }


  function initHighlighting() {
    const mapGroups = document.querySelectorAll(".palika-group");
    const listItems = document.querySelectorAll(".palika-list li");
    if (!mapGroups.length && !listItems.length) return;

    function reset() {
      mapGroups.forEach(g => g.classList.remove("active"));
      listItems.forEach(li => li.classList.remove("active-list"));
    }

    function highlight(id) {
      reset(); // Clear old highlights

      const mapGroup = document.getElementById("group-" + id);
      if (mapGroup) mapGroup.classList.add("active");

      const listItem = document.getElementById("list-" + id);
      if (listItem) listItem.classList.add("active-list");
    }

    // Attach listeners for list items
    listItems.forEach(li => {
      const id = li.getAttribute("data-id");

      li.addEventListener("mouseover", () => highlight(id));
      li.addEventListener("mouseout", reset);
      li.addEventListener("click", () => highlight(id));
    });

    // Attach listeners for map groups (bi-directional)
    mapGroups.forEach(group => {
      // Assuming your group IDs are like "group-birtamod"
      const id = group.id.replace("group-", "");

      group.addEventListener("mouseover", () => highlight(id));
      group.addEventListener("mouseout", reset);
      group.addEventListener("click", () => highlight(id));
    });
  }

  // --- Smooth Scroll Helper (shared) ---
  function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
      const navHeight = 116;
      const extraPadding = 14;
      const targetPosition = element.offsetTop - (navHeight + extraPadding);

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
      });
    }
  }

  // Initialize only if elements exist
  initShowBoard();
  initHighlighting();
  initLoader();
  initBannerSlideshow();
  initMenu();
  initLanguageSwitcher();
  initScrollUnderline();
  initNavbarScroll();
  initModal();
  initSmoothScroll();

});
