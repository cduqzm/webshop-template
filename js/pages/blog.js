/*
 * Journal: blog.html lists posts, post.html?id=… shows one. Posts come from config/posts.js.
 */
(function () {
  "use strict";
  const { h, t, loc } = Shop;
  const site = Shop.site;
  const main = document.getElementById("main");
  const posts = (window.POSTS || []).slice().sort((a, b) => b.date.localeCompare(a.date));
  const dateFormat = new Intl.DateTimeFormat(Shop.locale, { day: "numeric", month: "long", year: "numeric" });
  const date = (p) => h("time", { class: "post__date", datetime: p.date }, dateFormat.format(new Date(p.date + "T12:00:00")));
  const url = (p) => "post.html?id=" + encodeURIComponent(p.id);

  if (!site.features.blog) {
    location.replace("index.html");
    return;
  }

  if (document.body.dataset.page === "post") {
    const post = posts.find((p) => p.id === new URLSearchParams(location.search).get("id"));
    if (!post) {
      Shop.setMeta(t("pages.notFound.title"));
      main.replaceChildren(h("div", { class: "empty-state" }, h("h1", null, t("blog.notFound")), h("a", { class: "arrow-link", href: "blog.html" }, t("blog.back"))));
      return;
    }
    Shop.setMeta(loc(post.title), loc(post.summary));
    main.replaceChildren(
      h(
        "article",
        { class: "post" },
        h("a", { class: "post__back", href: "blog.html" }, "← " + t("blog.back")),
        date(post),
        h("h1", { class: "page-title" }, loc(post.title)),
        h("p", { class: "post__summary" }, loc(post.summary)),
        post.image && h("div", { class: "post__media" }, Shop.media(post.image, { label: loc(post.title), alt: "", eager: true })),
        h("div", { class: "post__body prose" }, (loc(post.body) || []).map((p) => h("p", { rich: p }))),
      ),
    );
    return;
  }

  main.replaceChildren(
    h("div", { class: "page-head" }, h("h1", { class: "page-title" }, t("blog.title")), h("p", { class: "page-intro" }, t("blog.intro"))),
    posts.length
      ? h(
          "ol",
          { class: "posts", role: "list" },
          posts.map((p) =>
            h(
              "li",
              { class: "posts__item" },
              h("a", { class: "posts__media", href: url(p), tabindex: "-1", "aria-hidden": "true" }, Shop.media(p.image, { label: loc(p.title), alt: "" })),
              h("div", { class: "posts__text" }, date(p), h("h2", { class: "posts__title" }, h("a", { href: url(p) }, loc(p.title))), h("p", null, loc(p.summary))),
            ),
          ),
        )
      : h("p", { class: "empty-state" }, t("blog.empty")),
  );
})();
