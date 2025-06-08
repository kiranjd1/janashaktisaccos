document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in
    const isLoggedIn = sessionStorage.getItem('adminLoggedIn');
    const currentPage = window.location.pathname;

    if (!isLoggedIn && !currentPage.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // Login Form Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            // Simple authentication (replace with proper authentication)
            if (username === 'admin' && password === 'password') {
                sessionStorage.setItem('adminLoggedIn', 'true');
                window.location.href = 'dashboard.html';
            } else {
                alert('Invalid credentials');
            }
        });
    }

    // Navigation Handler
    const navLinks = document.querySelectorAll('.admin-nav a[data-section]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            
            // Update active states
            document.querySelector('.admin-nav a.active').classList.remove('active');
            link.classList.add('active');
            
            // Show target section
            document.querySelector('.content-section.active').classList.remove('active');
            document.getElementById(targetSection).classList.add('active');
        });
    });

    // Logout Handler
    const logoutBtn = document.getElementById('logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            sessionStorage.removeItem('adminLoggedIn');
            window.location.href = 'login.html';
        });
    }

    // Info Items Handler
    const infoItemForm = document.getElementById('infoItemForm');
    if (infoItemForm) {
        infoItemForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = document.getElementById('itemTitle').value;
            const value = document.getElementById('itemValue').value;
            const icon = document.getElementById('itemIcon').value;

            // Save to localStorage (replace with proper backend storage)
            const items = JSON.parse(localStorage.getItem('infoItems') || '[]');
            items.push({ title, value, icon });
            localStorage.setItem('infoItems', JSON.stringify(items));

            // Reset form and refresh list
            infoItemForm.reset();
            loadInfoItems();
        });
    }

    // Load Info Items
    function loadInfoItems() {
        const listContainer = document.querySelector('.info-items-list');
        if (!listContainer) return;

        const items = JSON.parse(localStorage.getItem('infoItems') || '[]');
        listContainer.innerHTML = items.map((item, index) => `
            <div class="info-item">
                <div class="info-item-content">
                    <i class="${item.icon}"></i>
                    <span>${item.title}: ${item.value}</span>
                </div>
                <div class="info-item-actions">
                    <button class="edit-btn" onclick="editItem(${index})">Edit</button>
                    <button class="delete-btn" onclick="deleteItem(${index})">Delete</button>
                </div>
            </div>
        `).join('');
    }

    // Initial load of info items
    loadInfoItems();
});

// Edit and Delete functions
function editItem(index) {
    const items = JSON.parse(localStorage.getItem('infoItems') || '[]');
    const item = items[index];
    
    document.getElementById('itemTitle').value = item.title;
    document.getElementById('itemValue').value = item.value;
    document.getElementById('itemIcon').value = item.icon;
    
    // Remove the item (it will be re-added when form is submitted)
    items.splice(index, 1);
    localStorage.setItem('infoItems', JSON.stringify(items));
    loadInfoItems();
}

function deleteItem(index) {
    if (confirm('Are you sure you want to delete this item?')) {
        const items = JSON.parse(localStorage.getItem('infoItems') || '[]');
        items.splice(index, 1);
        localStorage.setItem('infoItems', JSON.stringify(items));
        loadInfoItems();
    }
}