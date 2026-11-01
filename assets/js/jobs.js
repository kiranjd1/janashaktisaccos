let vacanciesData = [];
let vacanciesLang = "en";

function getVacancyText(vacancy, key, lang) {
  if (lang === "ne" && (vacancy[`${key}_ne`] || vacancy[`${key}_np`])) {
    return vacancy[`${key}_ne`] || vacancy[`${key}_np`];
  }
  return vacancy[key] || "";
}

function formatVacancyDate(value, lang) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString(lang === "ne" ? "ne-NP" : "en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
}

function createNoticeCell(vacancy, lang) {
  const cell = document.createElement("td");
  const noticeDescription = getVacancyText(vacancy, "notice", lang);
  const noticeUrl = vacancy.notice_url;

  if (!noticeUrl) {
    cell.textContent = getVacancyText(vacancy, "notice", lang) || "—";
    return cell;
  }

  try {
    const safeUrl = new URL(noticeUrl, window.location.href);
    const allowedProtocols = ["http:", "https:"];
    if (window.location.protocol === "file:") allowedProtocols.push("file:");
    if (!allowedProtocols.includes(safeUrl.protocol)) throw new Error("Unsupported notice URL");

    const link = document.createElement("a");
    link.className = "vacancy-notice-link";
    link.href = safeUrl.href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = lang === "ne" ? "हेर्नुहोस्" : "View";
    link.title = noticeDescription || (lang === "ne" ? "सूचना हेर्नुहोस्" : "View notice PDF");
    link.setAttribute("aria-label", `${lang === "ne" ? "सूचना हेर्नुहोस्" : "View notice"}${vacancy.vacancy_no ? ` ${vacancy.vacancy_no}` : ""}`);
    cell.appendChild(link);
  } catch (error) {
    cell.textContent = getVacancyText(vacancy, "notice", lang) || "—";
  }

  return cell;
}

function renderVacancies(lang = "en", message = "") {
  const tableBody = document.getElementById("vacancies-table-body");
  if (!tableBody) return;

  tableBody.replaceChildren();
  if (message || vacanciesData.length === 0) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.className = "vacancies-message";
    cell.colSpan = 5;
    cell.textContent = message || (lang === "ne"
      ? "हाल कुनै रिक्त पद उपलब्ध छैन। कृपया पछि पुनः हेर्नुहोस्।"
      : "There are no current vacancies. Please check again later.");
    row.appendChild(cell);
    tableBody.appendChild(row);
    return;
  }

  vacanciesData.forEach((vacancy) => {
    const row = document.createElement("tr");
    const cells = [
      vacancy.vacancy_no || "—",
      getVacancyText(vacancy, "post", lang) || "—",
      formatVacancyDate(getVacancyText(vacancy, "open_from", lang), lang),
      formatVacancyDate(getVacancyText(vacancy, "open_till", lang), lang)
    ];

    cells.forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    row.appendChild(createNoticeCell(vacancy, lang));
    tableBody.appendChild(row);
  });
}

function setupVacancyLanguageSync() {
  document.body.addEventListener("click", (event) => {
    const button = event.target.closest(".lang-btn[data-lang]");
    if (!button) return;

    vacanciesLang = button.getAttribute("data-lang") || vacanciesLang;
    renderVacancies(vacanciesLang);
  });

  document.addEventListener("headerLoaded", () => {
    const activeButton = document.querySelector(".lang-btn.active");
    if (!activeButton) return;

    vacanciesLang = activeButton.getAttribute("data-lang") || vacanciesLang;
    renderVacancies(vacanciesLang);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const activeButton = document.querySelector(".lang-btn.active");
  if (activeButton) vacanciesLang = activeButton.getAttribute("data-lang") || vacanciesLang;

  setupVacancyLanguageSync();
  renderVacancies(vacanciesLang, vacanciesLang === "ne" ? "रिक्त पदहरू लोड हुँदैछन्..." : "Loading vacancies...");

  fetch("assets/data/jobs.json")
    .then((response) => {
      if (!response.ok) throw new Error("Failed to load vacancy data");
      return response.json();
    })
    .then((data) => {
      vacanciesData = Array.isArray(data) ? data : data.vacancies;
      if (!Array.isArray(vacanciesData)) throw new Error("Vacancy data must be an array");
      renderVacancies(vacanciesLang);
    })
    .catch((error) => {
      console.error("Error loading vacancies:", error);
      renderVacancies(vacanciesLang, vacanciesLang === "ne"
        ? "रिक्त पदको विवरण लोड गर्न सकिएन। कृपया पछि पुनः प्रयास गर्नुहोस्।"
        : "Vacancy details could not be loaded. Please try again later.");
    });
});
