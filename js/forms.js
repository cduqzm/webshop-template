/*
 * Form helpers shared by checkout, contact and newsletter: fields with labels and error messages,
 * validation, and sending to a form service (or falling back to the visitor's email app).
 */
(function () {
  "use strict";
  const { h, t } = Shop;
  let uid = 0;

  /**
   * A labelled field. opts: name, label, type, required, autocomplete, hint, rows (textarea), value, inputmode.
   * The error message element sits under the input and is linked with aria-describedby.
   */
  Shop.field = function (opts) {
    const id = "f-" + opts.name + "-" + ++uid;
    const hintId = opts.hint ? id + "-hint" : null;
    const errorId = id + "-error";
    const attrs = {
      id,
      name: opts.name,
      required: !!opts.required,
      autocomplete: opts.autocomplete || null,
      inputmode: opts.inputmode || null,
      "aria-describedby": [hintId, errorId].filter(Boolean).join(" "),
    };
    const control =
      opts.rows != null
        ? h("textarea", { ...attrs, rows: opts.rows }, opts.value || "")
        : h("input", { ...attrs, type: opts.type || "text", value: opts.value || null });
    return h(
      "div",
      { class: "field" + (opts.className ? " " + opts.className : "") },
      h("label", { for: id, class: "field__label" }, opts.label, !opts.required && h("span", { class: "field__optional" }, " (" + t("checkout.optional") + ")")),
      control,
      opts.hint && h("p", { class: "field__hint", id: hintId }, opts.hint),
      h("p", { class: "field__error", id: errorId }),
    );
  };

  /** Checks every field; marks the invalid ones and focuses the first. Returns true when all is fine. */
  Shop.validate = function (form) {
    let first = null;
    form.querySelectorAll("input, textarea, select").forEach((el) => {
      if (el.disabled || el.closest("[hidden]")) return;
      const error = document.getElementById(el.id + "-error");
      let message = "";
      if (el.validity.valueMissing) message = el.type === "checkbox" ? t("form.mustAgree") : t("form.required");
      else if (el.validity.typeMismatch && el.type === "email") message = t("form.invalidEmail");
      el.toggleAttribute("aria-invalid", !!message);
      if (error) error.textContent = message;
      if (message && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  };

  /** Clears an error as soon as the visitor fixes the field. */
  Shop.liveValidation = function (form) {
    form.addEventListener("input", (e) => {
      const el = e.target;
      if (!el.hasAttribute("aria-invalid") || !el.checkValidity()) return;
      el.removeAttribute("aria-invalid");
      const error = document.getElementById(el.id + "-error");
      if (error) error.textContent = "";
    });
  };

  /** Plain object of a form's values. */
  Shop.formData = (form) => Object.fromEntries(new FormData(form).entries());

  /**
   * Sends data to a form endpoint as JSON. Without an endpoint, opens the visitor's email app instead.
   * Resolves to "sent" or "mailto"; rejects when the service refuses.
   */
  Shop.send = async function (endpoint, data, mail) {
    if (endpoint) {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Form service answered " + res.status);
      return "sent";
    }
    location.href = "mailto:" + mail.to + "?subject=" + encodeURIComponent(mail.subject) + "&body=" + encodeURIComponent(mail.body);
    return "mailto";
  };

  /** A message line under a form; role=status so screen readers hear it. */
  Shop.formStatus = () => h("p", { class: "form-status", role: "status" });
})();
