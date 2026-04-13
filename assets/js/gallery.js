document.addEventListener("DOMContentLoaded", async () => {
	const galleryButtons = document.querySelectorAll(".gallery-btn");
	const photosSection = document.querySelector(".photos");
	const videosSection = document.querySelector(".videos");
	const eventsGrid = document.getElementById("gallery-events-grid");
	const eventPhotosView = document.getElementById("event-photos-view");
	const eventPhotosGrid = document.getElementById("event-photos-grid");
	const eventPhotosTitle = document.getElementById("event-photos-title");
	const eventPhotosBack = document.getElementById("event-photos-back");
	const photoModal = document.getElementById("gallery-photo-modal");
	const photoModalImage = document.getElementById("gallery-photo-image");
	const photoModalClose = document.getElementById("gallery-photo-close");
	const photoModalPrev = document.getElementById("gallery-photo-prev");
	const photoModalNext = document.getElementById("gallery-photo-next");

	let events = [];
	let eventsById = new Map();
	let activeEvent = null;
	let activePhotoIndex = 0;

	function normalizeEvents(data) {
		const source = Array.isArray(data?.events) ? data.events : [];
		return source
			.map((event, index) => {
				const photos = Array.isArray(event?.photos)
					? event.photos.filter((photo) => photo && photo.src)
					: [];
				if (!photos.length) return null;

				return {
					id: event.id || `event-${index + 1}`,
					label: event.label || `Event ${index + 1}`,
					thumbnail: event.thumbnail || photos[0].src,
					photos
				};
			})
			.filter(Boolean);
	}

	function renderEventsGrid() {
		eventsGrid.innerHTML = "";

		if (!events.length) {
			eventsGrid.innerHTML = "<p>No gallery events available right now.</p>";
			return;
		}

		events.forEach((event) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "thumbnail event-thumbnail";
			button.dataset.eventId = event.id;
			button.setAttribute("aria-label", `Open ${event.label}`);
			button.innerHTML = `
				<div>
					<img src="${event.thumbnail}" alt="${event.label}">
					<div class="thumbnail-title">
						<h3>${event.label}</h3>
					</div>
					<div class="view photos">
						<i class="fas fa-search"></i>
						<span>View Photos</span>
					</div>
				</div>
			`;
			button.addEventListener("click", () => openEventView(event.id));
			eventsGrid.appendChild(button);
		});
	}

	function setActiveTab(target) {
		galleryButtons.forEach((btn) => {
			btn.classList.toggle("active", btn.dataset.target === target);
		});

		eventPhotosView.classList.add("is-hidden");
		photosSection.classList.toggle("is-hidden", target !== "photos");
		videosSection.classList.toggle("is-hidden", target === "photos");
	}

	function openEventView(eventId) {
		const eventData = eventsById.get(eventId);
		if (!eventData) return;

		activeEvent = eventData;
		eventPhotosTitle.textContent = eventData.label;
		eventPhotosGrid.innerHTML = "";

		eventData.photos.forEach((photo, index) => {
			const item = document.createElement("div");
			item.className = "event-photo-item";
			item.setAttribute("role", "button");
			item.setAttribute("tabindex", "0");
			item.setAttribute("aria-label", photo.label || `Photo ${index + 1}`);

			const img = document.createElement("img");
			img.src = photo.src;
			img.alt = photo.label || eventData.label;
			img.loading = "lazy";
			item.appendChild(img);

			item.addEventListener("click", () => openPhotoModal(index));
			item.addEventListener("keydown", (event) => {
				if (event.key === "Enter" || event.key === " ") {
					event.preventDefault();
					openPhotoModal(index);
				}
			});

			eventPhotosGrid.appendChild(item);
		});

		eventsGrid.classList.add("is-hidden");
		eventPhotosView.classList.remove("is-hidden");
		eventPhotosView.scrollIntoView({ behavior: "smooth", block: "start" });
	}

	function closeEventView() {
		activeEvent = null;
		eventPhotosGrid.innerHTML = "";
		eventPhotosView.classList.add("is-hidden");
		eventsGrid.classList.remove("is-hidden");
	}

	function renderPhoto(index) {
		if (!activeEvent || !activeEvent.photos.length) return;

		if (index < 0) {
			activePhotoIndex = activeEvent.photos.length - 1;
		} else if (index >= activeEvent.photos.length) {
			activePhotoIndex = 0;
		} else {
			activePhotoIndex = index;
		}

		const photo = activeEvent.photos[activePhotoIndex];
		photoModalImage.src = photo.src;
		photoModalImage.alt = photo.label || activeEvent.label;
	}

	function openPhotoModal(index) {
		if (!activeEvent) return;
		activePhotoIndex = index;
		renderPhoto(index);
		photoModal.style.display = "flex";
		photoModal.setAttribute("aria-hidden", "false");
		document.body.style.overflow = "hidden";
	}

	function closePhotoModal() {
		photoModal.style.display = "none";
		photoModal.setAttribute("aria-hidden", "true");
		photoModalImage.src = "";
		document.body.style.overflow = "";
	}

	galleryButtons.forEach((btn) => {
		btn.addEventListener("click", () => setActiveTab(btn.dataset.target));
	});

	eventPhotosBack.addEventListener("click", closeEventView);
	photoModalClose.addEventListener("click", closePhotoModal);
	photoModalPrev.addEventListener("click", () => renderPhoto(activePhotoIndex - 1));
	photoModalNext.addEventListener("click", () => renderPhoto(activePhotoIndex + 1));

	photoModal.addEventListener("click", (event) => {
		if (event.target === photoModal) closePhotoModal();
	});

	document.addEventListener("keydown", (event) => {
		if (photoModal.style.display === "flex") {
			if (event.key === "Escape") closePhotoModal();
			if (event.key === "ArrowLeft") renderPhoto(activePhotoIndex - 1);
			if (event.key === "ArrowRight") renderPhoto(activePhotoIndex + 1);
			return;
		}

		if (!eventPhotosView.classList.contains("is-hidden") && event.key === "Escape") {
			closeEventView();
		}
	});

	try {
		const response = await fetch("assets/data/gallery-events.json");
		if (!response.ok) throw new Error("Failed to load gallery events data");
		const data = await response.json();
		events = normalizeEvents(data);
	} catch (error) {
		console.warn("Gallery events could not be loaded:", error);
		events = [];
	}

	eventsById = new Map(events.map((event) => [event.id, event]));
	renderEventsGrid();
	setActiveTab("photos");
});