document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('updates-grid');
  const summaryEl = document.getElementById('updates-summary');
  const filterButtons = document.querySelectorAll('.updates-filter-btn');
  const filterBar = document.querySelector('.updates-filter-bar');
  
  // Detail View Elements
  const detailView = document.getElementById('news-detail-view');
  const backBtn = document.getElementById('back-to-list-btn');
  const detailTitle = document.getElementById('detail-title');
  const detailDate = document.getElementById('detail-date');
  const detailBody = document.getElementById('detail-body');
  const detailGallery = document.getElementById('detail-gallery');
  const detailCategoryBadge = document.getElementById('detail-category-badge');

  // Modal Elements
  const modal = document.getElementById('updates-modal');
  const modalImg = document.getElementById('updates-img-viewer');
  const modalPdf = document.getElementById('updates-pdf-viewer');
  const modalClose = document.getElementById('updates-modal-close');
  
  if (!grid || !summaryEl || !filterButtons.length) return;

  let currentLang = 'en';
  let activeFilter = 'all';
  let updatesData = [];
  
  // State variables for tracking view
  let currentView = 'list'; // 'list' or 'detail'
  let activeNewsItem = null;

  function formatDate(value, lang) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    const locale = lang === 'ne' ? 'ne-NP' : 'en-US';
    return date.toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  function getQueryFilter() {
    const query = new URLSearchParams(window.location.search);
    const filter = query.get('category');
    return filter === 'news' || filter === 'notice' ? filter : 'all';
  }

  function setQueryFilter(filter) {
    const url = new URL(window.location.href);
    if (filter === 'all') {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', filter);
    }
    window.history.replaceState({}, '', url.toString());
  }

  function detectCategory(item) {
    if (item && (item.category === 'news' || item.category === 'notice')) {
      return item.category;
    }

    const link = String(item?.link || '').toLowerCase();
    const type = String(item?.link_type || '').toLowerCase();
    const fileType = String(item?.file_type || '').toLowerCase();
    const isFile = type === 'file' || ['jpg', 'jpeg', 'png', 'webp', 'gif', 'pdf'].includes(fileType);
    const looksLikeNotice = link.includes('/notices/') || link.includes('notice');

    return isFile || looksLikeNotice ? 'notice' : 'news';
  }

  function updateFilterUI() {
    filterButtons.forEach(btn => {
      const isActive = btn.getAttribute('data-filter') === activeFilter;
      btn.classList.toggle('active', isActive);
    });
  }

  function closeModal() {
    if (!modal || !modalImg || !modalPdf) return;
    modal.style.display = 'none';
    modalImg.style.display = 'none';
    modalPdf.style.display = 'none';
    modalImg.src = '';
    modalPdf.src = '';
  }

  function openFileModal(filePath, fileType) {
    if (!modal || !modalImg || !modalPdf) {
      window.open(filePath, '_blank', 'noopener,noreferrer');
      return;
    }

    const type = (fileType || '').toLowerCase();
    modalImg.style.display = 'none';
    modalPdf.style.display = 'none';

    if (type === 'pdf') {
      modalPdf.src = filePath;
      modalPdf.style.display = 'block';
    } else {
      modalImg.src = filePath;
      modalImg.style.display = 'block';
    }

    modal.style.display = 'flex';
  }

  function getFilteredItems(items) {
    if (activeFilter === 'all') return items;
    return items.filter(item => detectCategory(item) === activeFilter);
  }

  // --- Detail View Functions ---
  
  function showListView() {
    currentView = 'list';
    activeNewsItem = null;
    
    if (detailView) detailView.style.display = 'none';
    if (grid) grid.style.display = 'grid'; 
    if (filterBar) filterBar.style.display = 'flex'; 
    if (summaryEl) summaryEl.style.display = 'block';
    
    renderUpdates(updatesData);
  }

  function showDetailView(item) {
    currentView = 'detail';
    activeNewsItem = item;
    
    // Hide list elements
    if (grid) grid.style.display = 'none';
    if (filterBar) filterBar.style.display = 'none';
    if (summaryEl) summaryEl.style.display = 'none';
    
    // Show detail element
    if (detailView) detailView.style.display = 'block';
    
    renderDetailContent();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function renderDetailContent() {
    if (!activeNewsItem) return;
    
    const item = activeNewsItem;
    const title = currentLang === 'ne' && item.headline_ne ? item.headline_ne : item.headline;
    // Fallback to summary if content isn't provided
    const content = currentLang === 'ne' && item.content_ne ? item.content_ne : (item.content || (currentLang === 'ne' ? item.summary_ne : item.summary));
    
    if (detailTitle) detailTitle.textContent = title;
    if (detailDate) detailDate.textContent = formatDate(item.publish_date, currentLang);
    if (detailCategoryBadge) detailCategoryBadge.textContent = currentLang === 'ne' ? 'समाचार' : 'News';
    if (detailBody) detailBody.innerHTML = `<p>${content}</p>`; 
    
    // Render Images if they exist
    if (detailGallery) {
      detailGallery.innerHTML = '';
      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        detailGallery.innerHTML = item.images.map(imgSrc => `
          <img src="${imgSrc}" alt="News Image" class="detail-gallery-img" onclick="openFileModal('${imgSrc}', 'jpg')">
        `).join('');
      }
    }

    // Update back button language
    if (backBtn) {
      const backText = backBtn.querySelector('span');
      if (backText) {
        backText.textContent = currentLang === 'ne' ? backText.getAttribute('data-ne') : backText.getAttribute('data-en');
      }
    }
  }

  // Handle Back Button Click
  if (backBtn) {
    backBtn.addEventListener('click', showListView);
  }

  // --- Render Updates ---

  function renderUpdates(items) {
    if (!Array.isArray(items) || !items.length) {
      grid.innerHTML = '<p>No updates are available right now.</p>';
      summaryEl.textContent = '';
      return;
    }

    const sorted = [...items].sort((a, b) => new Date(b.publish_date) - new Date(a.publish_date));
    const filtered = getFilteredItems(sorted);

    const summaryMap = {
      all: {
        en: `Showing all updates (${filtered.length})`,
        ne: `सबै अपडेट देखाइँदैछ (${filtered.length})`
      },
      news: {
        en: `Showing news only (${filtered.length})`,
        ne: `समाचार मात्र देखाइँदैछ (${filtered.length})`
      },
      notice: {
        en: `Showing notices only (${filtered.length})`,
        ne: `सूचना मात्र देखाइँदैछ (${filtered.length})`
      }
    };
    summaryEl.textContent = currentLang === 'ne' ? summaryMap[activeFilter].ne : summaryMap[activeFilter].en;

    if (!filtered.length) {
      const emptyText = currentLang === 'ne'
        ? 'यस श्रेणीमा अहिले कुनै अपडेट छैन।'
        : 'No updates are available in this category.';
      grid.innerHTML = `<p>${emptyText}</p>`;
      return;
    }

    grid.innerHTML = filtered.map(item => {
      const itemCategory = detectCategory(item);
      const title = currentLang === 'ne' && item.headline_ne ? item.headline_ne : item.headline;
      const summary = currentLang === 'ne' && item.summary_ne ? item.summary_ne : item.summary;
      const isNotice = itemCategory === 'notice';
      const categoryLabel = isNotice
        ? (currentLang === 'ne' ? 'सूचना' : 'Notice')
        : (currentLang === 'ne' ? 'समाचार' : 'News');
      const actionLabel = isNotice
        ? (currentLang === 'ne' ? 'सूचना हेर्नुहोस्' : 'View notice')
        : (currentLang === 'ne' ? 'पूरा हेर्नुहोस्' : 'Read more');
      const iconClass = isNotice ? 'fas fa-bullhorn' : 'fas fa-newspaper';
      const safeType = item.file_type || '';

      return `
        <article class="news-card">
          <div class="news-card-header">
            <span class="updates-category-badge ${itemCategory}">${categoryLabel}</span>
            <div class="news-meta">
              <span><i class="${iconClass}"></i></span>
              <span>${formatDate(item.publish_date, currentLang)}</span>
            </div>
          </div>
          <h3>${title || ''}</h3>
          <p>${summary || ''}</p>
          ${isNotice
            ? `<button class="news-read-link" type="button" data-open-file="${item.link || ''}" data-file-type="${safeType}">${actionLabel} <i class="fas fa-eye"></i></button>`
            : `<button class="news-read-link" type="button" data-news-id="${item.id}">${actionLabel} <i class="fas fa-arrow-right"></i></button>`}
        </article>
      `;
    }).join('');

    grid.querySelectorAll('[data-open-file]').forEach(btn => {
      btn.addEventListener('click', () => {
        const filePath = btn.getAttribute('data-open-file');
        const fileType = btn.getAttribute('data-file-type') || '';
        if (!filePath) return;
        openFileModal(filePath, fileType);
      });
    });

    grid.querySelectorAll('[data-news-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-news-id'), 10);
        const selectedItem = updatesData.find(news => news.id === id);
        if (selectedItem) {
          showDetailView(selectedItem);
        }
      });
    });
  }

  fetch('assets/data/news.json')
    .then(response => {
      if (!response.ok) throw new Error('Failed to load news data');
      return response.json();
    })
    .then(data => {
      updatesData = data;
      activeFilter = getQueryFilter();
      updateFilterUI();
      renderUpdates(updatesData);

      filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
          const nextFilter = btn.getAttribute('data-filter') || 'all';
          activeFilter = nextFilter;
          setQueryFilter(activeFilter);
          updateFilterUI();
          renderUpdates(updatesData);
        });
      });

      document.body.addEventListener('click', event => {
        const langBtn = event.target.closest('[data-lang]');
        if (!langBtn) return;

        const selectedLang = langBtn.getAttribute('data-lang');
        if (!selectedLang) return;

        currentLang = selectedLang;
        
        // Refresh the correct view
        if (currentView === 'detail') {
          renderDetailContent();
        } else {
          renderUpdates(updatesData);
        }
      });

      document.addEventListener('headerLoaded', () => {
        const activeBtn = document.querySelector('.lang-btn.active');
        if (!activeBtn) return;

        currentLang = activeBtn.getAttribute('data-lang') || currentLang;
        
        if (currentView === 'detail') {
          renderDetailContent();
        } else {
          renderUpdates(updatesData);
        }
      });

      if (modal && modalClose) {
        modalClose.addEventListener('click', closeModal);
        modal.addEventListener('click', event => {
          if (event.target === modal) closeModal();
        });
      }
    })
    .catch(error => {
      grid.innerHTML = '<p>Unable to load updates right now.</p>';
      console.error('News page error:', error);
    });
});
