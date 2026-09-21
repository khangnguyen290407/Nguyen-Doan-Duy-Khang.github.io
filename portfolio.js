const filterButtons = document.querySelectorAll(".filter-button");
const projectCards = document.querySelectorAll(".project-card");
const navAnchors = document.querySelectorAll(".nav-links a");
const year = document.querySelector("#year");
const dailyList = document.querySelector("#daily-list");
const dailyReader = document.querySelector("#daily-reader");
const dailySearch = document.querySelector("#daily-search");
const dailyTags = document.querySelector("#daily-tags");

const dailyState = {
  activeTag: "All",
  posts: [],
  query: "",
  selectedSlug: ""
};

if (year) {
  year.textContent = String(new Date().getFullYear());
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;

    filterButtons.forEach((item) => item.classList.remove("is-active"));
    filterButtons.forEach((item) => item.setAttribute("aria-pressed", "false"));
    button.classList.add("is-active");
    button.setAttribute("aria-pressed", "true");

    projectCards.forEach((card) => {
      const categories = card.dataset.category?.split(" ") ?? [];
      const shouldShow = filter === "all" || categories.includes(filter);
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
});

filterButtons.forEach((button) => {
  button.setAttribute("aria-pressed", button.classList.contains("is-active") ? "true" : "false");
});

const navSections = [...navAnchors]
  .map((anchor) => document.querySelector(anchor.getAttribute("href")))
  .filter(Boolean);

if (navSections.length) {
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navAnchors.forEach((anchor) => {
          anchor.classList.toggle("is-active", anchor.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-38% 0px -52% 0px", threshold: 0.01 }
  );

  navSections.forEach((section) => navObserver.observe(section));
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

function observeRevealItems(scope = document) {
  scope.querySelectorAll(".reveal:not([data-observed])").forEach((item) => {
    item.dataset.observed = "true";
    revealObserver.observe(item);
  });
}

observeRevealItems();

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(date));
}

function markdownToHtml(markdown) {
  const lines = markdown.split("\n");
  const html = [];
  let paragraph = [];
  let listOpen = false;

  function closeParagraph() {
    if (paragraph.length) {
      html.push(`<p>${paragraph.map(escapeHtml).join(" ")}</p>`);
      paragraph = [];
    }
  }

  function closeList() {
    if (listOpen) {
      html.push("</ul>");
      listOpen = false;
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeParagraph();
      closeList();
      return;
    }

    if (trimmed.startsWith("## ")) {
      closeParagraph();
      closeList();
      html.push(`<h4>${escapeHtml(trimmed.slice(3))}</h4>`);
      return;
    }

    if (trimmed.startsWith("- ")) {
      closeParagraph();
      if (!listOpen) {
        html.push("<ul>");
        listOpen = true;
      }
      html.push(`<li>${escapeHtml(trimmed.slice(2))}</li>`);
      return;
    }

    paragraph.push(trimmed);
  });

  closeParagraph();
  closeList();
  return html.join("");
}

function getFilteredPosts() {
  const query = dailyState.query.toLowerCase();

  return dailyState.posts.filter((post) => {
    const matchesTag = dailyState.activeTag === "All" || post.tags.includes(dailyState.activeTag);
    const searchable = [post.title, post.summary, post.body, ...post.tags].join(" ").toLowerCase();
    return matchesTag && searchable.includes(query);
  });
}

function renderDailyTags() {
  if (!dailyTags) {
    return;
  }

  const tags = ["All", ...new Set(dailyState.posts.flatMap((post) => post.tags))];

  dailyTags.innerHTML = tags
    .map((tag) => {
      const activeClass = tag === dailyState.activeTag ? " is-active" : "";
      return `<button class="daily-tag-button${activeClass}" type="button" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>`;
    })
    .join("");

  dailyTags.querySelectorAll(".daily-tag-button").forEach((button) => {
    button.addEventListener("click", () => {
      dailyState.activeTag = button.dataset.tag || "All";
      renderDaily();
    });
  });
}

function renderDailyReader(post) {
  if (!dailyReader) {
    return;
  }

  if (!post) {
    dailyReader.innerHTML = '<p class="daily-empty">No notes match this filter yet.</p>';
    return;
  }

  dailyState.selectedSlug = post.slug;
  dailyReader.innerHTML = `
    <div class="daily-reader-meta">
      <span>${escapeHtml(formatDate(post.date))}</span>
      <span>${escapeHtml(post.readingMinutes)} min read</span>
    </div>
    <h3>${escapeHtml(post.title)}</h3>
    ${markdownToHtml(post.body)}
    <div class="daily-reader-tags">
      ${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

function renderDailyList(posts) {
  if (!dailyList) {
    return;
  }

  if (!posts.length) {
    dailyList.innerHTML = '<p class="daily-empty">No daily notes match your search yet.</p>';
    return;
  }

  dailyList.innerHTML = posts
    .map((post) => {
      const activeClass = post.slug === dailyState.selectedSlug ? " is-active" : "";
      return `
        <button class="daily-card${activeClass}" type="button" data-slug="${escapeHtml(post.slug)}">
          <span class="daily-card-meta">
            <span>${escapeHtml(formatDate(post.date))}</span>
            <span>${escapeHtml(post.readingMinutes)} min</span>
          </span>
          <h3>${escapeHtml(post.title)}</h3>
          <p>${escapeHtml(post.summary)}</p>
        </button>
      `;
    })
    .join("");

  dailyList.querySelectorAll(".daily-card").forEach((card) => {
    card.addEventListener("click", () => {
      const post = dailyState.posts.find((item) => item.slug === card.dataset.slug);
      renderDailyReader(post);
      renderDailyList(getFilteredPosts());
    });
  });
}

function renderDaily() {
  const posts = getFilteredPosts();
  const selectedPost = posts.find((post) => post.slug === dailyState.selectedSlug) || posts[0];

  renderDailyTags();
  renderDailyReader(selectedPost);
  renderDailyList(posts);
}

async function loadDailyPosts() {
  if (!dailyList || !dailyReader) {
    return;
  }

  if (Array.isArray(window.DAILY_POSTS)) {
    dailyState.posts = window.DAILY_POSTS;
    dailyState.selectedSlug = dailyState.posts[0]?.slug || "";
    renderDaily();
    return;
  }

  try {
    const response = await fetch("data/daily-posts.json");

    if (!response.ok) {
      throw new Error(`Unable to load daily posts: ${response.status}`);
    }

    dailyState.posts = await response.json();
    dailyState.selectedSlug = dailyState.posts[0]?.slug || "";
    renderDaily();
  } catch (error) {
    dailyList.innerHTML = '<p class="daily-empty">Daily notes data is not available yet. Run node build-daily-posts.mjs after adding Markdown notes.</p>';
    dailyReader.innerHTML = '<p class="daily-empty">The Markdown data is ready in the daily folder.</p>';
    console.error(error);
  }
}

dailySearch?.addEventListener("input", (event) => {
  dailyState.query = event.target.value;
  renderDaily();
});

void loadDailyPosts();
