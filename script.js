
const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const themeToggle = document.getElementById("theme-toggle");
const projectsGrid = document.getElementById("projects-grid");
const projectsStatus = document.getElementById("projects-status");
const certificationsGrid = document.getElementById("certifications-grid");

const GITHUB_USERNAME = "reshabIAF";

// Add repository names here to keep those projects at the top, in this order.
const FEATURED_REPOSITORIES = [];

const CERTIFICATES = [
  {
    title: "Designing and Implementing a Microsoft Azure AI Solution",
    issuer: "Genius Academy",
    year: "2025",
    path: "Certificate (R S RESHAB)/IMG-20250626-WA0063.jpg",
  },
  {
    title: "Learn AI and Gen AI Basics",
    issuer: "Organization not listed",
    year: "Year not listed",
    path: "Certificate (R S RESHAB)/Learn AI and Gen AI basics.pdf",
  },
  {
    title: "Certificate (slonix sloution)",
    issuer: "Organization not listed",
    year: "Year not listed",
    path: "Certificate (R S RESHAB)/slonix sloution.pdf",
  },
  {
    title: "SRM Hackathon Certificate",
    issuer: "Organization not listed",
    year: "Year not listed",
    path: "Certificate (R S RESHAB)/SRM Hackathon.pdf",
  },
  {
    title: "MongoDB Basics for Students",
    issuer: "MongoDB",
    year: "2025",
    path: "Certificate (R S RESHAB)/MongoDBBasicsforStudents_Badge20250719-27-zefqx2.pdf",
  },
  {
    title: "Light Fidelity (Li-Fi) Project Expo / Poster Presentation",
    issuer: "Dhanalakshmi Srinivasan Engineering College",
    year: "2025",
    path: "Certificate (R S RESHAB)/IMG_20250513_203538415.jpg",
  },
  {
    title: "ASTHRA 2K25 Certificate of Participation",
    issuer: "Karpagam Institute of Technology",
    year: "2025",
    path: "Certificate (R S RESHAB)/IMG-20260420-WA0003.jpg",
  },
  {
    title: "AI and Data Analytics Completion Certificate",
    issuer: "Forage",
    year: "Year not listed",
    path: "Certificate (R S RESHAB)/Forage AI and Data analytic completion_certificate.pdf",
  },
  {
    title: "HP LIFE Certificate",
    issuer: "HP LIFE",
    year: "Year not listed",
    path: "Certificate (R S RESHAB)/HP Life .pdf",
  },
  {
    title: "Certificate",
    issuer: "Organization not listed",
    year: "Year not listed",
    path: "Certificate (R S RESHAB)/Certificate_R S Reshab.pdf",
  },
  {
    title: "Data Analyst Workshop Completion Certificate",
    issuer: "Innova Plus",
    year: "2025",
    path: "Certificate (R S RESHAB)/E-Certificate.pdf",
  },
  {
    title: "ESEC Certificate",
    issuer: "Organization not listed",
    year: "Year not listed",
    path: "Certificate (R S RESHAB)/ESEC .pdf",
  },
];

const MAX_LANGUAGE_LOOKUPS = 15;

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function safeExternalUrl(value) {
  if (typeof value !== "string" || !value.trim()) return null;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
  } catch {
    return null;
  }
}

function createExternalLink(label, href, className) {
  const link = createElement("a", className, label);
  link.href = href;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  return link;
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : new Intl.DateTimeFormat(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }).format(date);
}

function getRepositoryLanguages(repository) {
  return repository.language ? [repository.language] : [];
}

function renderLanguages(container, languages) {
  container.replaceChildren();
  const displayedLanguages = languages.length
    ? languages
    : ["Language data unavailable"];

  displayedLanguages.forEach((language) => {
    container.append(createElement("span", "", language));
  });
}

function createProjectCard(repository, featured) {
  const card = createElement("article", "project-card");
  const artwork = createElement("div", "project-art", "</>");
  artwork.setAttribute("aria-hidden", "true");

  const body = createElement("div", "project-body");
  const status = createElement("span", "project-status", "GitHub repository");
  if (featured) {
    status.append(createElement("span", "project-featured", "Featured"));
  }

  const title = createElement("h3", "", repository.name);
  const description = createElement(
    "p",
    "",
    repository.description || "No description provided."
  );
  const languages = createElement("div", "tags");
  renderLanguages(languages, getRepositoryLanguages(repository));

  const metadata = createElement(
    "p",
    "project-meta",
    `Updated ${formatDate(repository.updated_at)} · Created ${formatDate(repository.created_at)}`
  );
  const links = createElement("div", "project-links");
  const githubUrl = safeExternalUrl(repository.html_url);
  if (githubUrl) {
    links.append(
      createExternalLink("View on GitHub ↗", githubUrl, "btn btn-outline")
    );
  }

  const demoUrl = safeExternalUrl(repository.homepage);
  if (demoUrl) {
    links.append(createExternalLink("Live Demo ↗", demoUrl, "btn btn-primary"));
  }

  body.append(status, title, description, languages, metadata, links);
  card.append(artwork, body);
  return { card, languages };
}

async function fetchRepositoryLanguages(repository, container) {
  const url = `https://api.github.com/repos/${encodeURIComponent(
    GITHUB_USERNAME
  )}/${encodeURIComponent(repository.name)}/languages`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
    });
    if (!response.ok) {
      throw new Error(`GitHub languages API returned ${response.status}.`);
    }

    const languageData = await response.json();
    const languages = Object.keys(languageData);
    renderLanguages(container, languages.length ? languages : getRepositoryLanguages(repository));
  } catch (error) {
    console.warn(`Could not load languages for ${repository.name}.`, error);
    renderLanguages(container, getRepositoryLanguages(repository));
  }
}

function sortRepositories(repositories) {
  const featuredOrder = new Map(
    FEATURED_REPOSITORIES.map((name, index) => [name.toLowerCase(), index])
  );

  return repositories.sort((first, second) => {
    const firstIndex = featuredOrder.has(first.name.toLowerCase())
      ? featuredOrder.get(first.name.toLowerCase())
      : Number.MAX_SAFE_INTEGER;
    const secondIndex = featuredOrder.has(second.name.toLowerCase())
      ? featuredOrder.get(second.name.toLowerCase())
      : Number.MAX_SAFE_INTEGER;

    if (firstIndex !== secondIndex) return firstIndex - secondIndex;
    return new Date(second.updated_at) - new Date(first.updated_at);
  });
}

function showProjectsError(message) {
  projectsStatus.replaceChildren(document.createTextNode(message));
  projectsStatus.append(document.createTextNode(" "));
  const retryButton = createElement("button", "text-link project-retry", "Try again");
  retryButton.type = "button";
  retryButton.addEventListener("click", loadProjects);
  projectsStatus.append(retryButton);
  projectsStatus.setAttribute("aria-busy", "false");
}

async function loadProjects() {
  projectsGrid.replaceChildren();
  projectsStatus.textContent = "Loading public repositories from GitHub…";
  projectsStatus.setAttribute("aria-busy", "true");

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(GITHUB_USERNAME)}/repos?sort=updated&direction=desc&per_page=100&type=owner`,
      { headers: { Accept: "application/vnd.github+json" } }
    );

    if (!response.ok) {
      const detail = response.status === 403 || response.status === 429
        ? "GitHub's public API rate limit was reached."
        : `GitHub returned an error (${response.status}).`;
      throw new Error(detail);
    }

    const repositories = await response.json();
    if (!Array.isArray(repositories)) {
      throw new Error("GitHub returned an unexpected repository list.");
    }

    const publicRepositories = sortRepositories(
      repositories.filter((repository) => !repository.fork && !repository.archived)
    );

    if (!publicRepositories.length) {
      projectsStatus.textContent = "No public projects are available to display yet.";
      projectsStatus.setAttribute("aria-busy", "false");
      return;
    }

    projectsStatus.textContent = "";
    projectsStatus.setAttribute("aria-busy", "false");
    const languageLookups = [];

    publicRepositories.forEach((repository, index) => {
      const isFeatured = FEATURED_REPOSITORIES.some(
        (name) => name.toLowerCase() === repository.name.toLowerCase()
      );
      const { card, languages } = createProjectCard(repository, isFeatured);
      projectsGrid.append(card);

      if (index < MAX_LANGUAGE_LOOKUPS) {
        languageLookups.push(fetchRepositoryLanguages(repository, languages));
      }
    });

    await Promise.all(languageLookups);
  } catch (error) {
    console.error("Unable to load GitHub projects.", error);
    showProjectsError(
      error instanceof TypeError
        ? "Could not connect to GitHub. Check your connection and try again."
        : error.message || "Unable to load GitHub projects. Please try again."
    );
  }
}

function getCertificatePath(value) {
  if (typeof value !== "string" || !value.trim()) return null;
  const path = value.trim().replace(/\\/g, "/");
  const pathParts = path.split("/");
  if (
    path.startsWith("/") ||
    pathParts.some((part) => !part || part === "." || part === "..") ||
    /^[a-z][a-z\d+.-]*:/i.test(path)
  ) {
    return null;
  }
  return encodeURI(path);
}

function renderCertificates() {
  certificationsGrid.replaceChildren();

  if (!CERTIFICATES.length) {
    const emptyState = createElement(
      "p",
      "certificate-empty",
      "No certificates have been added yet. Verified certificates will appear here when configured."
    );
    certificationsGrid.append(emptyState);
    return;
  }

  function createCertificatePlaceholder(isPdf) {
    const placeholder = createElement(
      "div",
      `certificate-placeholder${isPdf ? " certificate-pdf" : ""}`,
      isPdf ? "PDF" : "✦"
    );
    placeholder.setAttribute("aria-hidden", "true");
    return placeholder;
  }

  CERTIFICATES.forEach((certificate) => {
    const card = createElement("article", "certificate-card");
    const certificatePath = getCertificatePath(certificate.path);
    const isPdf = Boolean(certificatePath && /\.pdf$/i.test(certificatePath));

    if (certificatePath && !isPdf) {
      const image = createElement("img", "certificate-preview");
      image.alt = `${certificate.title || "Certificate"}${certificate.issuer ? `, issued by ${certificate.issuer}` : ""}`;
      image.addEventListener("error", () => {
        image.replaceWith(createCertificatePlaceholder(false));
      }, { once: true });
      image.src = certificatePath;
      card.append(image);
    } else {
      card.append(createCertificatePlaceholder(isPdf));
    }

    const body = createElement("div", "certificate-body");
    body.append(
      createElement("h3", "", certificate.title || "Certificate"),
      createElement("p", "", certificate.issuer || "Organization not listed"),
      createElement("p", "", certificate.year || "Year not listed")
    );

    const links = createElement("div", "project-links");
    if (certificatePath) {
      const viewLink = createExternalLink(
        "View Certificate ↗",
        certificatePath,
        "btn btn-outline"
      );
      links.append(viewLink);

      const downloadLink = createElement(
        "a",
        "btn btn-primary",
        "Download Certificate ↓"
      );
      downloadLink.href = certificatePath;
      downloadLink.download = certificate.path.split(/[\\/]/).pop();
      links.append(downloadLink);
    }

    body.append(links);
    card.append(body);
    certificationsGrid.append(card);
  });
}

loadProjects();
renderCertificates();

// Mobile navigation
menuToggle.addEventListener("click", () => {
  const isOpen = navLinks.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(isOpen));
  menuToggle.textContent = isOpen ? "✕" : "☰";
});

// Close mobile menu after selecting a section
navLinks.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.textContent = "☰";
  });
});

// Dark and light theme
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");

  const isDark = document.body.classList.contains("dark");
  themeToggle.textContent = isDark ? "☀️" : "🌙";
  themeToggle.setAttribute(
    "aria-label",
    isDark ? "Switch to light mode" : "Switch to dark mode"
  );
});

// Automatically update copyright year
document.getElementById("year").textContent =
  new Date().getFullYear();

// Contact form
const contactForm = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

contactForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.getElementById("visitor-name").value.trim();
  const email = document.getElementById("visitor-email").value.trim();
  const message = document.getElementById("visitor-message").value.trim();

  if (!name || !email || !message) {
    formStatus.textContent = "Please fill in all fields.";
    return;
  }

  const recipient = "reshab2006iaf@gmail.com";
  const subject = encodeURIComponent(`Portfolio enquiry from ${name}`);
  const body = encodeURIComponent(
    `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
  );

  formStatus.textContent =
    "Opening your email application. Send the prepared email to complete your enquiry.";

  window.location.href =
    `mailto:${recipient}?subject=${subject}&body=${body}`;
});
