/**
 * Dynamic Component Loader
 * Loads header and footer components dynamically while maintaining SEO
 */

const ComponentLoader = {
	/**
	 * Load header and footer components
	 */
	async init() {
	try {
	await this.loadHeader();
	await this.loadFooter();
	// Re-initialize event listeners after components are loaded
	this.reinitializeComponents();
	} catch (error) {
	console.error('Error loading components:', error);
	}
	},

	/**
	 * Load header component
	 */
	async loadHeader() {
	const headerContainer = document.getElementById('header-container');
	if (!headerContainer) {
	console.warn('Header container not found');
	return;
	}

	try {
	const response = await fetch('components/header.html');
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	const html = await response.text();
	headerContainer.innerHTML = html;
	
	// Dispatch custom event
	document.dispatchEvent(new CustomEvent('headerLoaded'));
	} catch (error) {
	console.error('Error loading header:', error);
	}
	},

	/**
	 * Load footer component
	 */
	async loadFooter() {
	const footerContainer = document.getElementById('footer-container');
	if (!footerContainer) {
	console.warn('Footer container not found');
	return;
	}

	try {
	const response = await fetch('components/footer.html');
	if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
	const html = await response.text();
	footerContainer.innerHTML = html;
	
	// Dispatch custom event
	document.dispatchEvent(new CustomEvent('footerLoaded'));
	} catch (error) {
	console.error('Error loading footer:', error);
	}
	},

	/**
	 * Reinitialize component-specific event listeners
	 */
	reinitializeComponents() {
	this.initMenu();
	this.initLanguageSwitcher();
	this.initNavbarScroll();
	},

	/**
	 * Initialize mobile menu
	 */
	initMenu() {
	const menuToggle = document.querySelector('.menu-toggle');
	const menu = document.querySelector('.menu');
	const hasDropdowns = document.querySelectorAll('.has-dropdown');

	if (!menuToggle || !menu) return;

	// Remove previous listeners by cloning
	const newMenuToggle = menuToggle.cloneNode(true);
	menuToggle.parentNode.replaceChild(newMenuToggle, menuToggle);

	newMenuToggle.addEventListener('click', () => {
	menu.classList.toggle('active');
	const icon = newMenuToggle.querySelector('i');
	if (icon) {
	if (menu.classList.contains('active')) {
	icon.classList.replace('fa-bars', 'fa-times');
	} else {
	icon.classList.replace('fa-times', 'fa-bars');
	}
	}
	});

	hasDropdowns.forEach(dropdown => {
	dropdown.addEventListener('click', function (e) {
	if (window.innerWidth <= 768) {
	const topLink = this.querySelector(':scope > a');
	const clickedTopLink = e.target.closest('a') === topLink;
	const hasRealTopLink = topLink && topLink.getAttribute('href') && topLink.getAttribute('href') !== '#';

	if (clickedTopLink) {
	if (hasRealTopLink && !this.classList.contains('active')) {
	e.preventDefault();
	this.classList.add('active');
	} else if (!hasRealTopLink) {
	e.preventDefault();
	this.classList.toggle('active');
	}
	return;
	}

	if (e.target.closest('.dropdown')) return;
	e.preventDefault();
	this.classList.toggle('active');
	}
	});
	});
	},

	/**
	 * Initialize navbar scroll effect
	 */
	initNavbarScroll() {
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
	
	// Remove previous listener if it exists
	window.removeEventListener("scroll", updateScroll, { passive: true });
	// Add the fresh listener
	window.addEventListener("scroll", updateScroll, { passive: true });
	updateScroll();
	},

	/**
	 * Initialize language switcher
	 */
	initLanguageSwitcher() {
	const langButtons = document.querySelectorAll('.lang-btn');
	const translatableElements = document.querySelectorAll('[data-en][data-ne]:not(.lang-btn)');

	if (!langButtons.length || !translatableElements.length) return;

	langButtons.forEach(button => {
	// Remove old listeners
	const newButton = button.cloneNode(true);
	button.parentNode.replaceChild(newButton, button);

	newButton.addEventListener('click', () => {
	const selectedLang = newButton.getAttribute('data-lang');
	translatableElements.forEach(element => {
	if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
	element.placeholder = element.getAttribute(`data-${selectedLang}`);
	} else {
	element.textContent = element.getAttribute(`data-${selectedLang}`);
	}
	});
	const currentLangButtons = document.querySelectorAll('.lang-btn');
	currentLangButtons.forEach(btn => btn.classList.remove('active'));
	newButton.classList.add('active');

	// Store language preference
	localStorage.setItem('preferredLanguage', selectedLang);
	});
	});

	// Restore language preference
	const savedLang = localStorage.getItem('preferredLanguage');
	if (savedLang) {
	const savedButton = document.querySelector(`[data-lang="${savedLang}"]`);
	if (savedButton) {
	savedButton.click();
	}
	}
	}
};

// Load components when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
	// Wait for next tick to ensure other scripts are initialized
	setTimeout(() => {
	ComponentLoader.init();
	}, 0);
});

// Listen for component load events if needed by other scripts
document.addEventListener('headerLoaded', () => {
	console.log('Header component loaded and initialized');
});

document.addEventListener('footerLoaded', () => {
	console.log('Footer component loaded and initialized');
});


