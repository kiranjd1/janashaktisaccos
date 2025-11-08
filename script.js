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
    const header = document.querySelector('header');
    if (!nav) return;

    const getHeaderBottom = () => (header ? header.getBoundingClientRect().bottom + window.scrollY : 0);

    function updateNavState() {
        const trigger = getHeaderBottom();
        if (window.scrollY > trigger) {
        if (!nav.classList.contains('scrolled')) {
            nav.classList.add('scrolled');
            // prevent content jump by adding padding equal to nav height
            document.body.style.paddingTop = `${nav.getBoundingClientRect().height}px`;
        }
        } else {
        if (nav.classList.contains('scrolled')) {
            nav.classList.remove('scrolled');
            document.body.style.paddingTop = '';
        }
        }
    }

    updateNavState();
    window.addEventListener('scroll', updateNavState, { passive: true });
    window.addEventListener('resize', () => {
        if (nav.classList.contains('scrolled')) {
        document.body.style.paddingTop = `${nav.getBoundingClientRect().height}px`;
        }
    });

    // Create an Intersection Observer
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            // When original nav is not intersecting (not visible)
            if (!entry.isIntersecting) {
                scrollNav.classList.add('visible');
            } else {
                scrollNav.classList.remove('visible');
            }
        });
    }, { threshold: 0 }); // Trigger as soon as any part becomes invisible

    // Start observing the original nav
    navObserver.observe(originalNav);

    // Handle menu toggle for scroll nav
    const scrollMenuToggle = scrollNav.querySelector('.menu-toggle');
    const scrollMenu = scrollNav.querySelector('.menu');
    
    if (scrollMenuToggle) {
        scrollMenuToggle.addEventListener('click', () => {
            scrollMenu.classList.toggle('show');
        })
    };


// Contact form submission handling
    const contactForm = document.getElementById('contactForm');

    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form values
        const formData = {
            first_name: document.getElementById('first_name').value,
            last_name: document.getElementById('last_name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Here you would typically send the data to your server
        // For now, we'll just log it to the console
        console.log('Form submitted:', formData);

        // Clear the form
        contactForm.reset();
        alert('Thank you for your message. We will get back to you soon!');
    });
});


document.addEventListener("DOMContentLoaded", function() {
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


