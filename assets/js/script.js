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
          const topLink = this.querySelector(":scope > a");
          const clickedTopLink = e.target.closest("a") === topLink;
          const hasRealTopLink = topLink && topLink.getAttribute("href") && topLink.getAttribute("href") !== "#";

          if (clickedTopLink) {
            if (hasRealTopLink && !this.classList.contains("active")) {
              e.preventDefault();
              this.classList.add("active");
            } else if (!hasRealTopLink) {
              e.preventDefault();
              this.classList.toggle("active");
            }
            return;
          }

          if (e.target.closest(".dropdown")) return;
          e.preventDefault();
          this.classList.toggle("active");
        }
      });
    });
  }

  // Language switcher
  function initLanguageSwitcher() {
    const langButtons = document.querySelectorAll(".lang-btn");
    const translatableElements = document.querySelectorAll("[data-en][data-ne]:not(.lang-btn)");
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

    function setActiveSlide() {
      slides.forEach((img, i) => {
        img.classList.toggle("active", i === current && !img.classList.contains("hidden"));
      });
    }

    modal.style.display = "flex";
    initStack();
    setActiveSlide();

    closeBtn.onclick = function () {
      if (current < slides.length) {
        slides[current].classList.add("hidden");
        current++;
        if (current === slides.length) {
          modal.style.display = "none";
          return;
        }
        setActiveSlide();
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

  // --- Dynamic statistics loader with language support ---
  let currentLang = 'en'; // default
  let statsCache = null;
  let newsCache = [];
  let newsIndex = 0;
  let newsInterval = null;
  let newsAnimationBound = false;
  let counterAnimationStarted = false;

  // Currency-related stat keys
  const currencyKeys = ['shareCapital', 'totalSaving', 'totalLoan', 'totalAssets'];

  function normalizeDigitsToEnglish(text) {
    const nepaliToEnglish = {
      '०': '0', '१': '1', '२': '2', '३': '3', '४': '4',
      '५': '5', '६': '6', '७': '7', '८': '8', '९': '9'
    };
    return String(text).replace(/[०-९]/g, d => nepaliToEnglish[d] || d);
  }

  // Format numbers with proper currency and numbering system
  function formatStatValue(value, lang, key) {
    // Check if this stat key requires currency formatting
    if (currencyKeys.includes(key)) {
      const currencySymbol = lang === 'ne' ? 'रू. ' : 'Rs. ';
      
      if (lang === 'ne') {
        // Nepali numbering system: format with Hindi numerals and Nepali commas
        // Nepali system: groups of 2 digits after the first 3 digits (e.g., 10,00,000)
        const englishDigits = normalizeDigitsToEnglish(value);
        const cleanNum = englishDigits.replace(/[^0-9]/g, '');
        if (cleanNum.length === 0) return currencySymbol + value;
        
        // English to Devanagari numeral conversion
        const numMap = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' };
        let devanagariNum = cleanNum.replace(/./g, d => numMap[d]);
        
        // Apply Nepali numbering formatting: 10,00,000 pattern
        let reversed = devanagariNum.split('').reverse().join('');
        let formatted = '';
        for (let i = 0; i < reversed.length; i++) {
          if (i === 3 || (i > 3 && (i - 3) % 2 === 0)) {
            formatted += ',';
          }
          formatted += reversed[i];
        }
        devanagariNum = formatted.split('').reverse().join('');
        return currencySymbol + devanagariNum;
      } else {
        // English: International numbering system (1,000,000)
        const englishDigits = normalizeDigitsToEnglish(value);
        const cleanNum = englishDigits.replace(/[^0-9]/g, '');
        if (cleanNum.length === 0) return currencySymbol + value;
        const formatted = parseInt(cleanNum).toLocaleString('en-US');
        return currencySymbol + formatted;
      }
    }
    
    return value;
  }

  function applyStats(lang) {
    if (!statsCache) return;
    const statEls = document.querySelectorAll('[data-stat-key]');
    if (!statEls.length) return;

    statEls.forEach(el => {
      const key = el.getAttribute('data-stat-key');
      if (key && statsCache[key]) {
        const val = statsCache[key];
        if (typeof val === 'object' && val[lang] !== undefined) {
          const formatted = formatStatValue(val[lang], lang, key);
          el.textContent = formatted;
        } else if (typeof val === 'string') {
          const formatted = formatStatValue(val, lang, key);
          el.textContent = formatted;
        }
      }
    });
  }

  function initStats() {
    fetch('assets/data/stats.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load stats');
        return res.json();
      })
      .then(json => {
        statsCache = json;
        applyStats(currentLang);
        if (!counterAnimationStarted) {
          initCounterAnimation();
          counterAnimationStarted = true;
        }
      })
      .catch(err => console.error('Error loading statistics:', err));
  }

  function formatNewsDate(dateString, lang) {
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return '';

    const locale = lang === 'ne' ? 'ne-NP' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  function updateNewsBar() {
    const headlineEl = document.querySelector('[data-news-headline]');
    const dateEl = document.querySelector('[data-news-date]');
    const linkEl = document.querySelector('[data-news-link]');
    if (!headlineEl || !dateEl || !linkEl || !newsCache.length) return;

    const item = newsCache[newsIndex];
    const headline = currentLang === 'ne' && item.headline_ne ? item.headline_ne : item.headline;
    const targetLink = item.link || 'news.html';

    headlineEl.textContent = headline || 'Latest update';
    dateEl.textContent = formatNewsDate(item.publish_date, currentLang);
    linkEl.setAttribute('href', targetLink);
  }

  function initNewsBar() {
    const newsBar = document.querySelector('.news-bar-home');
    const headlineEl = document.querySelector('[data-news-headline]');
    if (!newsBar) return;

    fetch('assets/data/news.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load news items');
        return res.json();
      })
      .then(json => {
        if (!Array.isArray(json) || !json.length) return;

        newsCache = [...json].sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
        newsIndex = 0;
        updateNewsBar();

        if (headlineEl) {
          if (newsInterval) clearInterval(newsInterval);
          headlineEl.classList.remove('marquee-active');
          void headlineEl.offsetWidth;
          headlineEl.classList.add('marquee-active');

          if (!newsAnimationBound) {
            headlineEl.addEventListener('animationiteration', () => {
              if (!newsCache.length) return;
              newsIndex = (newsIndex + 1) % newsCache.length;
              updateNewsBar();
            });
            newsAnimationBound = true;
          }
        }
      })
      .catch(err => {
        const headlineEl = document.querySelector('[data-news-headline]');
        const dateEl = document.querySelector('[data-news-date]');
        if (headlineEl) headlineEl.textContent = 'Latest news updates are unavailable right now.';
        if (dateEl) dateEl.textContent = '';
        console.error('Error loading news bar:', err);
      });
  }

  function setupLanguageStatsSync() {
    // delegate clicks so replacement of buttons doesn't break us
    document.body.addEventListener('click', e => {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;
      const lang = btn.getAttribute('data-lang');
      if (lang) {
        currentLang = lang;
        console.log('language selected', currentLang);
        applyStats(currentLang);
        updateNewsBar();
      }
    });

    // also respond when header component triggers loaded event (preference may have applied)
    document.addEventListener('headerLoaded', () => {
      const active = document.querySelector('.lang-btn.active');
      if (active) {
        currentLang = active.getAttribute('data-lang') || currentLang;
        applyStats(currentLang);
        updateNewsBar();
      }
    });
  }

  // detect initial active language (before components may load)
  const activeLangBtn = document.querySelector('.lang-btn.active');
  if (activeLangBtn) {
    currentLang = activeLangBtn.getAttribute('data-lang');
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

  function project(lat, lon) {
    const lonMin = 87.63570897439074;
    const lonMax = 88.18798416951093;
    const latMin = 26.36118115968359;
    const latMax = 26.805970321180226;

    const svgWidth = 800;
    const svgHeight = 645;

    // Scale longitude to X
    const x = ((lon - lonMin) / (lonMax - lonMin)) * svgWidth;

    // Scale latitude to Y (flip so north is up)
    const y = (1 - (lat - latMin) / (latMax - latMin)) * svgHeight;

    return { x, y };
  }

  const offices = [
    { id: "birtamod", name: "Head Office", lat: 26.63114166340732, lon: 87.98913767046227 },
    { id: "haldibari", name: "Goldhap S.C.", lat: 26.554108077619485, lon: 87.96084823146204 },
    { id: "kankai", name: "Surunga S.C.", lat: 26.646280991878175, lon: 87.89204506560387 },
    { id: "barhadashi", name: "Rajgadh S.C.", lat: 26.510719513524027, lon: 87.93448461074684 },
    { id: "arjundhara", name: "Sanischare S.C.", lat: 26.68525031577208, lon: 87.99251046379676 }
  ];

/**
 * Plots office markers on an SVG map.
 * Safe for global JS files: includes null checks and scoped selectors.
*/
  function plotPlaces(svgSelector, places) {
    const svg = document.querySelector(svgSelector);
    
    if (!svg) return;

    let markerLayer = svg.querySelector(".marker-layer");
    if (!markerLayer) {
      markerLayer = document.createElementNS("http://www.w3.org/2000/svg", "g");
      markerLayer.classList.add("marker-layer");
      svg.appendChild(markerLayer); 
    }

    places.forEach(place => {
      // Check if project function exists (assumes it's available globally or in scope)
      if (typeof project !== "function") return;
      
      const { x, y } = project(place.lat, place.lon);

      const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
      group.setAttribute("class", "office-group"); 
      group.setAttribute("data-id", place.id); 

      // Marker icon
      const icon = document.createElementNS("http://www.w3.org/2000/svg", "text");
      icon.setAttribute("x", x);
      icon.setAttribute("y", y);
      icon.setAttribute("class", "fa-icon");
      icon.setAttribute("dominant-baseline", "middle");
      icon.setAttribute("text-anchor", "middle");
      icon.textContent = "\uf3c5"; 
      group.appendChild(icon);

      // Label
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      label.setAttribute("x", x); 
      label.setAttribute("y", y - 25); 
      label.setAttribute("class", "palika-label");
      label.setAttribute("text-anchor", "middle");
      label.textContent = place.name;
      group.appendChild(label);

      markerLayer.appendChild(group);

      // Find path only inside this specific SVG
      const path = svg.querySelector(`.palika-path[id="${place.id}"]`);
      // Find list item in the document (assuming unique data-id per palika)
      const listItem = document.querySelector(`.palika-list li[data-id="${place.id}"]`);

      const toggleHoverState = (isActive) => {
        const method = isActive ? 'add' : 'remove';
        group.classList[method]('active');
        if (path) path.classList[method]('active');
        if (listItem) listItem.classList[method]('active-list');
      };

      // Attach listeners
      group.addEventListener('mouseenter', () => toggleHoverState(true));
      group.addEventListener('mouseleave', () => toggleHoverState(false));

      if (path) {
        path.addEventListener('mouseenter', () => toggleHoverState(true));
        path.addEventListener('mouseleave', () => toggleHoverState(false));
      }

      if (listItem) {
        listItem.addEventListener('mouseenter', () => toggleHoverState(true));
        listItem.addEventListener('mouseleave', () => toggleHoverState(false));
      }
    });
  }

  plotPlaces(".jhapa-svg", offices);

  // Initialize only if elements exist
  initShowBoard();
  initHighlighting();
  initLoader();
  initBannerSlideshow();
  initMenu();
  initLanguageSwitcher();
  // --- Scroll Reveal Animation ---
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children');
    if (!revealElements.length) return;

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  }

  // --- Lazy image fade-in ---
  function initImageFadeIn() {
    const lazyImages = document.querySelectorAll('img[loading=\"lazy\"]');
    if (!lazyImages.length) return;

    lazyImages.forEach(img => {
      if (img.complete) {
        img.classList.add('loaded');
      } else {
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      }
    });
  }

  // --- Smooth Counter Animation ---
  function initCounterAnimation() {
    const numbers = document.querySelectorAll('.number[data-stat-key]');
    if (!numbers.length) return;

    const counterObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const text = el.textContent.trim();
          // Extract numeric value for animation
          const normalizedText = normalizeDigitsToEnglish(text);
          const match = normalizedText.match(/[0-9][0-9,]*(?:\.[0-9]+)?/);
          const numericMatch = match ? match[0].replace(/,/g, '') : '';
          if (numericMatch && !el.dataset.animated) {
            el.dataset.animated = 'true';
            const targetNum = parseFloat(numericMatch);
            const prefix = text.slice(0, match.index);
            const suffix = text.slice(match.index + match[0].length);
            const duration = 2000; // Increased to 2 seconds for smoother animation
            const startTime = performance.now();
            const isDecimal = numericMatch.includes('.');
            const isNepali = /[०-९]|रू\./.test(text);

            function toNepaliDigits(numText) {
              const map = { '0': '०', '1': '१', '2': '२', '3': '३', '4': '४', '5': '५', '6': '६', '7': '७', '8': '८', '9': '९' };
              return numText.replace(/[0-9]/g, d => map[d] || d);
            }

            function formatNepaliGrouping(num) {
              const raw = Math.round(num).toString();
              const last3 = raw.slice(-3);
              const head = raw.slice(0, -3);
              if (!head) return last3;
              const groupedHead = head.replace(/\B(?=(\d{2})+(?!\d))/g, ',');
              return groupedHead + ',' + last3;
            }

            function update(currentTime) {
              const elapsed = currentTime - startTime;
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic for smooth deceleration
              const eased = 1 - Math.pow(1 - progress, 3);
              const current = targetNum * eased;

              if (isDecimal) {
                const decimalText = current.toFixed(2);
                el.textContent = prefix + (isNepali ? toNepaliDigits(decimalText) : decimalText) + suffix;
              } else {
                // Use Math.round for smoother integer transitions instead of Math.floor
                const intText = isNepali ? formatNepaliGrouping(current) : Math.round(current).toLocaleString('en-US');
                el.textContent = prefix + (isNepali ? toNepaliDigits(intText) : intText) + suffix;
              }

              if (progress < 1) {
                requestAnimationFrame(update);
              }
              // Animation ends naturally at 100% progress
            }
            requestAnimationFrame(update);
          }
          counterObserver.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    numbers.forEach(el => counterObserver.observe(el));
  }

  setupLanguageStatsSync();
  initScrollUnderline();
  initNavbarScroll();
  initModal();
  initSmoothScroll();
  initNewsBar();
  initStats();
  initScrollReveal();
  initImageFadeIn();

});
