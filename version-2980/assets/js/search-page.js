(function () {
  function getQuery() {
    var params = new URLSearchParams(window.location.search);
    return String(params.get("q") || "").trim();
  }

  function normalize(value) {
    return String(value || "").toLowerCase();
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function renderCard(item) {
    var tagHtml = [item.genre, item.region].filter(Boolean).slice(0, 2).map(function (tag) {
      return "<span>" + escapeHtml(tag) + "</span>";
    }).join("");

    return [
      "<article class=\"movie-card\" data-title=\"" + escapeHtml(item.title) + "\" data-year=\"" + item.year + "\" data-rating=\"" + item.rating + "\" data-views=\"" + item.views + "\" data-genre=\"" + escapeHtml(item.genre) + "\" data-region=\"" + escapeHtml(item.region) + "\">",
      "  <a class=\"movie-card-link\" href=\"" + item.url + "\">",
      "    <div class=\"card-media\">",
      "      <img src=\"" + item.cover + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
      "      <span class=\"score\">★ " + item.rating + "</span>",
      "      <div class=\"card-overlay\"><p>" + escapeHtml(item.oneLine) + "</p></div>",
      "    </div>",
      "    <div class=\"movie-card-body\">",
      "      <h3>" + escapeHtml(item.title) + "</h3>",
      "      <div class=\"meta-row\"><span>" + item.year + "</span><span>" + escapeHtml(item.region) + "</span></div>",
      "      <div class=\"tag-row\">" + tagHtml + "</div>",
      "    </div>",
      "  </a>",
      "</article>"
    ].join("");
  }

  function performSearch(query) {
    var source = window.searchData || [];
    var q = normalize(query);

    if (!q) {
      return source.slice(0, 120);
    }

    return source.filter(function (item) {
      var haystack = normalize([
        item.title,
        item.year,
        item.region,
        item.genre,
        item.oneLine,
        (item.tags || []).join(" ")
      ].join(" "));
      return haystack.indexOf(q) !== -1;
    }).slice(0, 240);
  }

  var form = document.querySelector("[data-search-page-form]");
  var input = document.querySelector("[data-search-page-input]");
  var title = document.querySelector("[data-search-title]");
  var grid = document.querySelector("[data-search-results]");
  var empty = document.querySelector("[data-search-empty]");
  var query = getQuery();

  if (input) {
    input.value = query;
  }

  if (title) {
    title.textContent = query ? "搜索：" + query : "片库搜索";
  }

  function render(queryValue) {
    var results = performSearch(queryValue);

    if (grid) {
      grid.innerHTML = results.map(renderCard).join("");
    }

    if (empty) {
      empty.style.display = results.length ? "none" : "";
    }
  }

  render(query);

  if (form && input) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nextQuery = input.value.trim();
      var url = nextQuery ? "search.html?q=" + encodeURIComponent(nextQuery) : "search.html";
      window.history.replaceState(null, "", url);
      render(nextQuery);

      if (title) {
        title.textContent = nextQuery ? "搜索：" + nextQuery : "片库搜索";
      }
    });

    input.addEventListener("input", function () {
      render(input.value.trim());
    });
  }
})();
