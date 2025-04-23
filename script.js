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
    }, 10000); // Change image every 10 seconds

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
});