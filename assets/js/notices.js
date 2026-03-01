const noticesData = [
	{
		id: 1,
		title: "Organizational Status Update for Members",
		title_np: "सदस्यहरूलाई संस्थागत अवस्थाको जानकारी",
		file_path: "assets/uploads/notices/bibaran-monthly.jpg",
		publish_date: "2026-02-18",
		file_type: "jpg"
	},
	{
		id: 2,
		title: "Change in Office Hours",
		title_np: "कार्यालय समय परिवर्तन सम्बन्धमा",
		file_path: "assets/uploads/notices/office-time-notice.jpg",
		publish_date: "2026-02-13",
		file_type: "jpg"
	},
	{
		id: 3,
		title: "Holiday Notice",
		title_np: "कार्यालय विदा सम्बन्धमा",
		file_path: "assets/uploads/notices/Holiday-20821103-Shivaratri.jpg",
		publish_date: "2026-02-14",
		file_type: "jpg"
	}
];

// Function to get PDF thumbnail
function getPdfThumbnail(pdfPath) {
	const pdfFilename = pdfPath.split('/').pop();
	const thumbFilename = pdfFilename.replace(/\.[^/.]+$/, "") + '.jpg';
	const thumbPath = 'assets/uploads/pdf-thumbnails/' + thumbFilename;
	return thumbPath;
}

// Function to get thumbnail for notice
function getNoticeThumbnail(notice) {
	if (notice.file_type === 'pdf') {
		return getPdfThumbnail(notice.file_path);
	}
	return notice.file_path;
}

// Function to format date
function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

// Function to load and render notices
function loadNotices() {
	const container = document.getElementById('notice-container');
	
	if (!noticesData || noticesData.length === 0) {
		container.innerHTML = '<p>No notices available at the moment.</p>';
		return;
	}

	// Sort by publish_date descending
	const sortedNotices = [...noticesData].sort((a, b) => 
		new Date(b.publish_date) - new Date(a.publish_date)
	);

	container.innerHTML = sortedNotices.map(notice => `
		<div class="notice-item" onclick="openNoticeModal('${notice.file_path}', '${notice.file_type}')">
			<img src="${getNoticeThumbnail(notice)}" alt="${notice.title}" class="notice-image" onerror="this.src='assets/images/pdf-placeholder.jpg'">
			<div class="notice-caption">
				<div class="notice-icon">
					<i class="fas fa-solid fa-newspaper"></i>
				</div>
				<div class="notice-title">
					<p>${notice.title_np}</p>
					<p id="pubDate">${formatDate(notice.publish_date)}</p>
				</div>
			</div>
		</div>
	`).join('');
}

// Function to open modal
function openNoticeModal(filePath, fileType) {
	const modal = document.getElementById('notice-modal');
	const imgViewer = document.getElementById('notice-img-viewer');
	const pdfViewer = document.getElementById('notice-pdf-viewer');
	
	// Hide both viewers first
	imgViewer.style.display = 'none';
	pdfViewer.style.display = 'none';
	
	// Show appropriate viewer based on file type
	if (fileType === 'pdf') {
		pdfViewer.src = filePath;
		pdfViewer.style.display = 'block';
	} else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType.toLowerCase())) {
		imgViewer.src = filePath;
		imgViewer.style.display = 'block';
	}
	
	modal.style.display = 'flex';
}

// Function to close modal
function closeNoticeModal() {
	const modal = document.getElementById('notice-modal');
	modal.style.display = 'none';
}

// Close modal when clicking outside
document.addEventListener('DOMContentLoaded', function() {
	const modal = document.getElementById('notice-modal');
	if (modal) {
		modal.addEventListener('click', function(e) {
			if (e.target === this) {
				closeNoticeModal();
			}
		});
	}

	// Load notices when page loads
	loadNotices();

	// Hide preloader
	window.addEventListener('load', function() {
		const preloader = document.getElementById('preloader');
		if (preloader) {
			preloader.classList.add('loader-hidden');
		}
	});

	// Fallback: hide preloader after 1 second
	setTimeout(function() {
		const preloader = document.getElementById('preloader');
		if (preloader && !preloader.classList.contains('loader-hidden')) {
			preloader.classList.add('loader-hidden');
		}
	}, 1000);
});
