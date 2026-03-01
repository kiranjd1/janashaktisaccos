# Dynamic Header & Footer Setup Guide

## Overview
This project now uses dynamically loaded header and footer components to eliminate code repetition while maintaining full SEO capabilities.

## Files Structure
```
components/
├── header.html          # Contains header + navigation
├── footer.html          # Contains footer content
└── components.js        # Script to load components dynamically
```

## How to Apply to All Pages

### Step 1: Replace Header & Navigation
In each HTML file (about.html, contact.html, loans.html, etc.), replace:

```html
<!-- OLD: Remove this entire section -->
<header class="top-util-bar">
  <div class="top-container">
    ...all header content...
  </div>
</header>

<nav id="mainNav" class="nav-bar" role="navigation">
  ...all navigation content...
</nav>

<!-- NEW: Add this single line -->
<div id="header-container"></div>
```

### Step 2: Replace Footer
Replace the entire footer section with:

```html
<!-- OLD: Remove this -->
<footer>
  ...all footer content...
</footer>

<!-- NEW: Add this -->
<div id="footer-container"></div>
```

### Step 3: Add Scripts (Before closing </body>)
Add the component loader script BEFORE the main script:

```html
<script src="components/components.js" defer></script>
<script src="script.js" defer></script>
```

## Important: Keep These in Each Page

✅ **Keep in `<head>` of every page:**
- Unique `<title>` for each page (SEO important)
- Meta description for each page
- Meta OpenGraph tags for social sharing
- Any page-specific meta tags
- All CSS links
- All font links

✅ **Page-specific content:**
- Main content inside `<main>` tags
- Page-specific sections and elements

## SEO Advantages

1. **Cleaner metadata** - Each page maintains its own unique title, description, and meta tags
2. **Faster updates** - Update header/footer once, reflects on all pages
3. **Better maintainability** - Less code duplication
4. **Multi-language support** - Language switching works globally across all pages
5. **No backend required** - Pure client-side static website

## Language Persistence

The system now saves user's language preference to localStorage. When they return to any page, their preferred language is automatically applied.

## Files to Update

- [ ] about.html
- [ ] contact.html
- [ ] gallery.html
- [ ] jobs.html
- [ ] loans.html
- [ ] notice.html
- [ ] reports.html
- [ ] savings.html
- [ ] Admin pages (dashboard.html, login.html)

## Testing

After updating each file:
1. Open the page in a browser
2. Verify header and footer load correctly
3. Test language switching (buttons should work)
4. Test mobile menu toggle
5. Verify all links work
6. Check browser console for any errors (should be none)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Header/Footer not loading | Check if components.js path is correct |
| Language buttons don't work | Ensure script loads after DOMContentLoaded |
| Styling looks wrong | Verify CSS links are in `<head>` |
| Images not showing | Use relative paths from root (e.g., `assets/images/...`) |

## Performance Benefits

- **Reduced HTML file sizes** - Less code per page
- **Faster initial load** - Smaller files = faster downloads
- **Better caching** - Repeated header/footer cached by browser
- **Single source of truth** - Update once for all pages
