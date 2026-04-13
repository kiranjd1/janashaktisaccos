let downloadsData = null;
let downloadsLang = "en";

function fetchDownloads() {
  return fetch("assets/data/downloads.json")
    .then((res) => {
      if (!res.ok) throw new Error("Failed to load downloads data");
      return res.json();
    });
}

function formatDate(dateString, lang) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleDateString(lang === "ne" ? "ne-NP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function getText(item, key, lang) {
  if (lang === "ne" && item[`${key}_np`]) return item[`${key}_np`];
  return item[key] || "";
}

function createDocumentRow(doc, lang) {
  const row = document.createElement("article");
  row.className = "download-row";

  const content = document.createElement("div");
  content.className = "download-meta";

  const title = document.createElement("h3");
  title.className = "download-title";
  title.textContent = getText(doc, "title", lang);

  const desc = document.createElement("p");
  desc.className = "download-description";
  desc.textContent = getText(doc, "description", lang);

  const updated = document.createElement("span");
  updated.className = "download-date";
  updated.textContent = `${lang === "ne" ? "अन्तिम अद्यावधिक:" : "Last updated:"} ${formatDate(doc.last_updated, lang)}`;

  content.appendChild(title);
  content.appendChild(desc);
  content.appendChild(updated);

  const action = document.createElement("div");
  action.className = "download-action";

  const button = document.createElement("a");
  button.className = "download-btn";
  button.href = doc.file_url;
  button.target = "_blank";
  button.rel = "noopener noreferrer";
  button.textContent = lang === "ne" ? "डाउनलोड" : "Download";
  button.setAttribute("aria-label", `${lang === "ne" ? "डाउनलोड" : "Download"} ${getText(doc, "title", lang)}`);

  action.appendChild(button);

  row.appendChild(content);
  row.appendChild(action);

  return row;
}

function renderDownloads(lang = "en") {
  const container = document.getElementById("downloads-container");
  if (!container) return;

  if (!downloadsData || !Array.isArray(downloadsData.categories)) {
    container.innerHTML = '<p class="no-downloads">Could not load documents.</p>';
    return;
  }

  container.innerHTML = "";

  downloadsData.categories.forEach((category) => {
    const section = document.createElement("section");
    section.className = "download-category";

    const heading = document.createElement("h2");
    heading.className = "download-category-title";
    heading.textContent = getText(category, "name", lang);

    const list = document.createElement("div");
    list.className = "download-list";

    if (Array.isArray(category.documents) && category.documents.length > 0) {
      category.documents.forEach((doc) => {
        list.appendChild(createDocumentRow(doc, lang));
      });
    } else {
      const empty = document.createElement("p");
      empty.className = "no-downloads";
      empty.textContent = lang === "ne" ? "यो श्रेणीमा कागजात उपलब्ध छैनन्।" : "No documents available in this category.";
      list.appendChild(empty);
    }

    section.appendChild(heading);
    section.appendChild(list);
    container.appendChild(section);
  });
}

function setupDownloadsLanguageSync() {
  document.body.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-lang]");
    if (!btn) return;

    const selectedLang = btn.getAttribute("data-lang");
    if (!selectedLang) return;

    downloadsLang = selectedLang;
    renderDownloads(downloadsLang);
  });

  document.addEventListener("headerLoaded", () => {
    const active = document.querySelector(".lang-btn.active");
    if (!active) return;

    downloadsLang = active.getAttribute("data-lang") || downloadsLang;
    renderDownloads(downloadsLang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const activeLangBtn = document.querySelector(".lang-btn.active");
  if (activeLangBtn) {
    downloadsLang = activeLangBtn.getAttribute("data-lang") || downloadsLang;
  }

  setupDownloadsLanguageSync();

  fetchDownloads()
    .then((data) => {
      downloadsData = data;
      renderDownloads(downloadsLang);
    })
    .catch((err) => {
      console.error("Error loading downloads:", err);
      const container = document.getElementById("downloads-container");
      if (container) {
        container.innerHTML = '<p class="no-downloads">Could not load documents. Please try again later.</p>';
      }
    });
});
