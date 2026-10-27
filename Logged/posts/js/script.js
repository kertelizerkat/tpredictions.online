(function () {
  "use strict";

  const sourceUrl = "https://www.soccerstats247.com/trends/";
  const pageSize = 18;
  let allTrends = [];
  let visibleGroups = pageSize;

  const elements = {
    container: document.getElementById("trends-container"),
    search: document.getElementById("trend-search"),
    country: document.getElementById("trend-country"),
    competition: document.getElementById("trend-competition"),
    category: document.getElementById("trend-category"),
    sort: document.getElementById("trend-sort"),
    total: document.getElementById("trend-total"),
    competitions: document.getElementById("competition-total"),
    countries: document.getElementById("country-total"),
    updated: document.getElementById("trend-updated"),
    resultCount: document.getElementById("trend-result-count"),
    message: document.getElementById("trend-message"),
    empty: document.getElementById("trend-empty"),
    loadMore: document.getElementById("trend-load-more")
  };

  function textValue(value, fallback) {
    const text = String(value == null ? "" : value).replace(/\s+/g, " ").trim();
    return text || fallback;
  }

  function classify(description, storedCategory) {
    const known = ["unbeaten", "winning", "winless", "losing"];
    if (known.indexOf(String(storedCategory || "").toLowerCase()) !== -1) {
      return String(storedCategory).toLowerCase();
    }
    const value = String(description || "").toLowerCase();
    if (value.includes("unbeaten") || value.includes("not lost")) return "unbeaten";
    if (value.includes("not won") || value.includes("winless")) return "winless";
    if (value.includes("lost")) return "losing";
    if (value.includes("won") || value.includes("winning")) return "winning";
    return "other";
  }

  function normalizeRow(row, index) {
    if (typeof row === "string") row = { content: row };
    row = row && typeof row === "object" ? row : {};
    let content = textValue(row.description || row.content, "");
    let team = textValue(row.team, "");
    if (!team && content) {
      const teamMatch = content.match(/^(.+?)\s+(?:is unbeaten|has not won|has won|has lost|is winless|is on)\b/i);
      if (teamMatch) {
        team = teamMatch[1];
        content = content.slice(team.length).trim();
      }
    }
    team = team || "Team trend";
    const category = classify(content, row.category);
    const count = Number.isFinite(Number(row.streak_count)) && row.streak_count !== null && row.streak_count !== ""
      ? Number(row.streak_count)
      : ((content.match(/\b(\d+)\b/) || [])[1] ? Number((content.match(/\b(\d+)\b/) || [])[1]) : null);
    const competition = textValue(row.competition, "Other trends");
    const country = textValue(row.country, "Other");
    return {
      id: [row.team_url || team, row.competition_url || competition, content, index].join("|").toLowerCase(),
      team: team,
      teamUrl: /^https?:\/\//i.test(row.team_url || "") ? row.team_url : "",
      description: content || textValue(row.content, "Recent form trend"),
      category: category,
      count: count,
      scope: textValue(row.scope, "overall"),
      country: country,
      flag: textValue(row.flag, ""),
      competition: competition,
      competitionUrl: /^https?:\/\//i.test(row.competition_url || "") ? row.competition_url : "",
      sourceUrl: /^https?:\/\//i.test(row.source_url || "") ? row.source_url : sourceUrl
    };
  }

  function groupRows(rows) {
    const groups = new Map();
    rows.forEach(function (row) {
      const key = row.competitionUrl || (row.country + "|" + row.competition);
      if (!groups.has(key)) {
        groups.set(key, {
          key: key,
          country: row.country,
          flag: row.flag,
          competition: row.competition,
          competitionUrl: row.competitionUrl,
          rows: []
        });
      }
      const group = groups.get(key);
      group.rows.push(row);
      if (!group.flag && row.flag) group.flag = row.flag;
      if (group.country === "Other" && row.country !== "Other") group.country = row.country;
    });
    return Array.from(groups.values());
  }

  function categoryLabel(category) {
    return {
      unbeaten: "Unbeaten",
      winning: "Winning streak",
      winless: "Without a win",
      losing: "Losing streak",
      other: "Form trend"
    }[category] || "Form trend";
  }

  function addText(parent, tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function makeLink(text, href, className) {
    const node = document.createElement(href ? "a" : "span");
    node.className = className || "";
    node.textContent = text;
    if (href) {
      node.href = href;
      node.target = "_blank";
      node.rel = "noopener noreferrer";
    }
    return node;
  }

  function renderCard(group) {
    const card = document.createElement("article");
    card.className = "card trend-competition-card";

    const heading = document.createElement("div");
    heading.className = "trend-competition-head";
    const title = document.createElement("h3");
    title.appendChild(makeLink(group.competition, group.competitionUrl, "headu"));
    heading.appendChild(title);
    card.appendChild(heading);
    addText(card, "p", "trend-card-meta", [group.flag, group.country, group.rows.length + (group.rows.length === 1 ? " trend" : " trends")].filter(Boolean).join(" · "));

    const list = document.createElement("div");
    list.className = "trend-list";
    group.rows.forEach(function (row) {
      const item = document.createElement("div");
      item.className = "trend-row";
      const top = document.createElement("p");
      top.className = "trend-row-top";
      top.appendChild(makeLink(row.team, row.teamUrl, "headu trend-team"));
      addText(top, "span", "trend-type", categoryLabel(row.category));
      item.appendChild(top);
      const description = document.createElement("p");
      description.className = "trend-description";
      const match = row.description.match(/\b(\d+)\b/);
      const count = row.count || (match ? Number(match[1]) : null);
      const descriptionHasCount = count && new RegExp("\\b" + count + "\\b").test(row.description);
      if (count && !descriptionHasCount) {
        const strong = document.createElement("strong");
        strong.textContent = count + (count === 1 ? " match" : " matches");
        description.appendChild(strong);
        description.appendChild(document.createTextNode(" · "));
      }
      description.appendChild(document.createTextNode(row.description));
      item.appendChild(description);
      list.appendChild(item);
    });
    card.appendChild(list);
    return card;
  }

  function getFilteredGroups() {
    const query = textValue(elements.search.value, "").toLowerCase();
    const country = elements.country.value;
    const competition = elements.competition.value;
    const category = elements.category.value;
    let rows = allTrends.filter(function (row) {
      if (country && row.country !== country) return false;
      const competitionKey = row.competitionUrl || (row.country + "|" + row.competition);
      if (competition && competitionKey !== competition) return false;
      if (category && row.category !== category) return false;
      if (query) {
        const haystack = [row.team, row.country, row.competition, row.description, categoryLabel(row.category)].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });
    const sort = elements.sort.value;
    rows.sort(function (a, b) {
      if (sort === "team") return a.team.localeCompare(b.team);
      if (sort === "competition") return a.competition.localeCompare(b.competition) || a.team.localeCompare(b.team);
      return (b.count || 0) - (a.count || 0) || a.competition.localeCompare(b.competition) || a.team.localeCompare(b.team);
    });
    return groupRows(rows).sort(function (a, b) {
      if (sort === "team") return a.rows[0].team.localeCompare(b.rows[0].team);
      if (sort === "competition") return a.competition.localeCompare(b.competition);
      const aCount = Math.max.apply(null, a.rows.map(function (row) { return row.count || 0; }));
      const bCount = Math.max.apply(null, b.rows.map(function (row) { return row.count || 0; }));
      return bCount - aCount || a.competition.localeCompare(b.competition);
    });
  }

  function render() {
    const groups = getFilteredGroups();
    const shown = groups.slice(0, visibleGroups);
    elements.container.replaceChildren();
    shown.forEach(function (group) { elements.container.appendChild(renderCard(group)); });

    const filteredCount = groups.reduce(function (total, group) { return total + group.rows.length; }, 0);
    elements.resultCount.textContent = filteredCount + (filteredCount === 1 ? " trend" : " trends") +
      " across " + groups.length + (groups.length === 1 ? " competition" : " competitions");
    elements.empty.hidden = filteredCount > 0;
    elements.loadMore.hidden = shown.length >= groups.length;
    elements.loadMore.textContent = "Show more competitions (" + Math.min(pageSize, groups.length - shown.length) + ")";
  }

  function fillSelect(select, values, placeholder) {
    const previous = select.value;
    select.replaceChildren(new Option(placeholder, ""));
    values.forEach(function (item) {
      const value = typeof item === "string" ? item : item.value;
      const label = typeof item === "string" ? item : item.label;
      select.add(new Option(label, value));
    });
    if (values.some(function (item) { return (typeof item === "string" ? item : item.value) === previous; })) select.value = previous;
  }

  function formatUpdated(value) {
    if (!value) return "Not available";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Not available";
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  function clearFilters() {
    elements.search.value = "";
    elements.country.value = "";
    elements.competition.value = "";
    elements.category.value = "";
    elements.sort.value = "longest";
    visibleGroups = pageSize;
    render();
  }

  function loadTrends() {
    elements.message.textContent = "Loading the latest saved trend data…";
    elements.resultCount.textContent = "Loading trends…";
    const apiBase = typeof line === "string" ? line.replace(/\/$/, "") : "";
    if (!apiBase) {
      elements.message.textContent = "The data service address is not configured.";
      elements.empty.hidden = false;
      return;
    }
    const controller = new AbortController();
    const timeout = window.setTimeout(function () { controller.abort(); }, 18000);
    fetch(apiBase + "/trends", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      cache: "no-store",
      signal: controller.signal
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Trend service returned " + response.status + ".");
        return response.json();
      })
      .then(function (data) {
        const rows = Array.isArray(data.trends) ? data.trends : [];
        allTrends = rows.map(normalizeRow);
        const countries = Array.from(new Set(allTrends.map(function (row) { return row.country; }))).filter(function (x) { return x && x !== "Other"; }).sort();
        const competitionMap = new Map();
        allTrends.forEach(function (row) {
          const value = row.competitionUrl || (row.country + "|" + row.competition);
          competitionMap.set(value, { value: value, label: row.country + " · " + row.competition });
        });
        const competitions = Array.from(competitionMap.values()).sort(function (a, b) { return a.label.localeCompare(b.label); });
        fillSelect(elements.country, countries, "All countries");
        fillSelect(elements.competition, competitions, "All competitions");
        elements.total.textContent = String(allTrends.length);
        elements.competitions.textContent = String(new Set(allTrends.map(function (row) { return row.competitionUrl || row.competition; })).size);
        elements.countries.textContent = String(new Set(allTrends.map(function (row) { return row.country; })).size);
        elements.updated.textContent = formatUpdated(data.updated_at || (allTrends[0] && allTrends[0].scraped_at));
        elements.message.textContent = allTrends.length ? "" : "No trend data has been saved yet. It will appear after a successful source refresh.";
        document.getElementById("trend-empty-retry").hidden = true;
        elements.empty.querySelector("h2").textContent = allTrends.length ? "No trends match those filters" : "Trend data is not ready";
        elements.empty.querySelector("p").textContent = allTrends.length
          ? "Try a shorter search or clear one of the filters."
          : "The updater will show trends here after it reads the source page successfully.";
        render();
      })
      .catch(function (error) {
        elements.message.textContent = error.name === "AbortError"
          ? "The trend data request timed out. Check that the app and updater are running."
          : "Trend data could not be loaded. Check that the app is running, then retry.";
        elements.resultCount.textContent = "Trend data unavailable";
        elements.empty.hidden = false;
        elements.empty.querySelector("h2").textContent = "Could not load trends";
        elements.empty.querySelector("p").textContent = error.message || "Please retry in a moment.";
        elements.loadMore.hidden = true;
        document.getElementById("trend-empty-retry").hidden = false;
      })
      .finally(function () { window.clearTimeout(timeout); });
  }

  [elements.search, elements.country, elements.competition, elements.category, elements.sort].forEach(function (control) {
    control.addEventListener(control === elements.search ? "input" : "change", function () {
      visibleGroups = pageSize;
      render();
    });
  });
  document.getElementById("trend-clear").addEventListener("click", clearFilters);
  document.getElementById("trend-empty-clear").addEventListener("click", clearFilters);
  document.getElementById("trend-empty-retry").addEventListener("click", loadTrends);
  elements.loadMore.addEventListener("click", function () {
    visibleGroups += pageSize;
    render();
  });

  const menuButton = document.getElementById("menu-btn");
  const closeButton = document.getElementById("close-btn");
  const drawer = document.getElementById("side-menu");
  const overlay = document.getElementById("overlay");
  const darkTheme = localStorage.getItem("theme_+-----") !== "Light";
  const barClasses = ["bar1", "bar2", "bar3"];
  if (darkTheme) {
    barClasses.forEach(function (id) {
      document.getElementById(id).classList.replace("bg-black", "bg-white");
    });
    overlay.classList.replace("bg-white/60", "bg-black/60");
    drawer.classList.replace("bg-white", "bg-black");
    drawer.classList.replace("bg-opacity-80", "bg-opacity-70");
    document.getElementById("hmen").classList.replace("text-gray-900", "text-white");
    drawer.querySelectorAll("a").forEach(function (link) {
      link.classList.replace("text-gray-700", "text-white");
    });
    document.getElementById("close-btn").classList.replace("text-gray-500", "text-white");
  }
  function closeMenu() {
    drawer.classList.add("translate-x-full");
    drawer.classList.remove("translate-x-0");
    overlay.classList.add("opacity-0", "pointer-events-none");
    menuButton.setAttribute("aria-expanded", "false");
  }
  menuButton.addEventListener("click", function () {
    drawer.classList.remove("translate-x-full");
    drawer.classList.add("translate-x-0");
    overlay.classList.remove("opacity-0", "pointer-events-none");
    menuButton.setAttribute("aria-expanded", "true");
  });
  closeButton.addEventListener("click", closeMenu);
  overlay.addEventListener("click", closeMenu);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  loadTrends();
})();
