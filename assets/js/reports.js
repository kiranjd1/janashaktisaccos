/**
 * Dynamic Reports Loader
 * Loads reports from /assets/data/reports.json and renders them by category.
 * Opens reports (image or PDF) in a modal viewer, similar to the notice viewer.
 */

let reportsData = null;
let activeCategory = 'monthly';

// Fetch reports JSON
function fetchReports() {
  return fetch('assets/data/reports.json')
    .then(res => {
      if (!res.ok) throw new Error('Failed to load reports data');
      return res.json();
    });
}

// Get thumbnail: for PDFs use a dedicated thumbnail, for images use the file itself
function getReportThumbnail(report) {
  if (report.thumbnail) return report.thumbnail;
  if (report.file_type === 'pdf') {
    const pdfFilename = report.file_path.split('/').pop();
    return 'assets/uploads/pdf-thumbnails/' + pdfFilename.replace(/\.[^/.]+$/, '') + '.jpg';
  }
  return report.file_path;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' });
}

// Render reports for the active category
function renderReports(category) {
  const container = document.getElementById('reports-container');
  if (!container || !reportsData) return;

  const reports = reportsData[category];

  if (!reports || reports.length === 0) {
    container.innerHTML = '<p class="no-reports">No reports available in this category.</p>';
    return;
  }

  // Sort by publish_date descending (newest first)
  const sorted = [...reports].sort((a, b) =>
    new Date(b.publish_date) - new Date(a.publish_date)
  );

  container.innerHTML = sorted.map(report => {
    const thumb = getReportThumbnail(report);
    const isPdf = report.file_type === 'pdf';
    const iconClass = isPdf ? 'fas fa-file-pdf' : 'fas fa-file-image';
    const filePath = report.file_path;
    const fileType = report.file_type;

    return `
      <div class="report-item" onclick="openReportModal('${filePath}', '${fileType}')">
        <img src="${thumb}" alt="${report.title}" class="report-image" loading="lazy"
             onerror="this.src='assets/images/pdf-placeholder.jpg'">
        <div class="report-caption">
          <div class="report-icon">
            <i class="${iconClass}"></i>
          </div>
          <div class="report-title">
            <p class="report-name">${report.title_np}</p>
            <p class="report-date">${formatDate(report.publish_date)}</p>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// --- Category tab switching ---
function initCategoryTabs() {
  const tabs = document.querySelectorAll('.report-tab');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCategory = tab.getAttribute('data-category');
      renderReports(activeCategory);
    });
  });
}

// --- Modal viewer (image + PDF) ---
function openReportModal(filePath, fileType) {
  const modal = document.getElementById('report-modal');
  const imgViewer = document.getElementById('report-img-viewer');
  const pdfViewer = document.getElementById('report-pdf-viewer');
  if (!modal) return;

  // Hide both viewers first
  imgViewer.style.display = 'none';
  pdfViewer.style.display = 'none';

  if (fileType === 'pdf') {
    pdfViewer.src = filePath;
    pdfViewer.style.display = 'block';
  } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType.toLowerCase())) {
    imgViewer.src = filePath;
    imgViewer.style.display = 'block';
  }

  modal.style.display = 'flex';
}

function closeReportModal() {
  const modal = document.getElementById('report-modal');
  if (!modal) return;
  modal.style.display = 'none';

  // Clear sources to stop PDF loading in background
  const pdfViewer = document.getElementById('report-pdf-viewer');
  if (pdfViewer) pdfViewer.src = '';
}

function initReportModal() {
  const modal = document.getElementById('report-modal');
  const closeBtn = document.getElementById('report-modal-close');
  if (!modal) return;

  if (closeBtn) {
    closeBtn.addEventListener('click', closeReportModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeReportModal();
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.style.display === 'flex') {
      closeReportModal();
    }
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  fetchReports()
    .then(data => {
      reportsData = data;
      renderReports(activeCategory);
    })
    .catch(err => {
      console.error('Error loading reports:', err);
      const container = document.getElementById('reports-container');
      if (container) {
        container.innerHTML = '<p class="no-reports">Could not load reports. Please try again later.</p>';
      }
    });

  initCategoryTabs();
  initReportModal();
});
