(() => {
  "use strict";

  const FORM = Object.freeze({
    endpoint: "https://formsubmit.co/ajax/project_office@inno.mgimo.ru",
    fallbackAction: "https://formsubmit.co/project_office@inno.mgimo.ru",
    email: "project_office@inno.mgimo.ru",
    subject: "[GIR МГИМО] Новая заявка на сотрудничество",
    project: "GIR — Global Index Ranker",
  });

  const COPY = {
    ru: {
      trigger: "Сотрудничество",
      eyebrow: "GIR • МГИМО",
      title: "Сотрудничество",
      intro: "Расскажите о задаче — проектный офис МГИМО предложит формат работы с платформой GIR.",
      close: "Закрыть форму",
      project: "Проект",
      projectValue: "GIR — Глобальный рейтинг индексов",
      fullName: "ФИО",
      phone: "Телефон",
      email: "Электронная почта",
      organization: "Организация",
      message: "Сообщение",
      consentBefore: "Я даю согласие на ",
      consentLink: "обработку персональных данных",
      consentAfter: ".",
      submit: "Отправить заявку",
      sending: "Отправляем…",
      successTitle: "Заявка отправлена",
      successCopy: "Спасибо. Проектный офис свяжется с вами по указанным контактам.",
      successClose: "Закрыть",
      error: "Не удалось отправить заявку. Попробуйте ещё раз или напишите на почту проектного офиса.",
      emailFallback: "Написать на project_office@inno.mgimo.ru",
      validation: {
        required: "Заполните это поле.",
        name: "Укажите ФИО полностью.",
        email: "Проверьте адрес электронной почты.",
        message: "Сообщение должно содержать не менее 10 символов.",
        consent: "Необходимо согласие на обработку персональных данных.",
      },
      consentPage: {
        metaTitle: "Согласие на обработку персональных данных | GIR",
        metaDescription: "Условия обработки данных, передаваемых через форму сотрудничества GIR.",
        back: "Вернуться в GIR",
        eyebrow: "GIR • МГИМО",
        title: "Согласие на обработку персональных данных",
        intro: "Отправляя форму сотрудничества, пользователь добровольно предоставляет данные для обработки обращения проектным офисом МГИМО.",
        purposeTitle: "Цель обработки",
        purposeCopy: "Рассмотрение предложения о сотрудничестве с GIR, определение подходящего формата взаимодействия и обратная связь с заявителем.",
        dataTitle: "Состав данных",
        dataCopy: "ФИО, телефон, адрес электронной почты, организация, проект GIR, текст сообщения, язык интерфейса и адрес страницы отправки.",
        transferTitle: "Передача и хранение",
        transferCopy: "Данные направляются на project_office@inno.mgimo.ru через сервис FormSubmit. Согласно документации FormSubmit, отправления могут храниться сервисом до 30 дней.",
        withdrawalTitle: "Отзыв согласия",
        withdrawalCopy: "Запрос на уточнение, ограничение обработки или удаление данных можно направить на project_office@inno.mgimo.ru.",
        cooperation: "Сотрудничество",
        controls: "Настройки интерфейса",
        language: "Язык: русский",
        lightTheme: "Включить светлую тему",
        darkTheme: "Включить тёмную тему",
        brand: "GIR — Глобальный рейтинг индексов",
      },
    },
    en: {
      trigger: "Cooperation",
      eyebrow: "GIR • MGIMO",
      title: "Cooperation",
      intro: "Tell us about your objective and the MGIMO project office will suggest a suitable way to work with the GIR platform.",
      close: "Close form",
      project: "Project",
      projectValue: "GIR — Global Index Ranker",
      fullName: "Full name",
      phone: "Phone",
      email: "E-mail",
      organization: "Organization",
      message: "Message",
      consentBefore: "I consent to the ",
      consentLink: "processing of my personal data",
      consentAfter: ".",
      submit: "Submit request",
      sending: "Sending…",
      successTitle: "Request submitted",
      successCopy: "Thank you. The project office will contact you using the details provided.",
      successClose: "Close",
      error: "The request could not be sent. Please try again or contact the project office by e-mail.",
      emailFallback: "E-mail project_office@inno.mgimo.ru",
      validation: {
        required: "Complete this field.",
        name: "Enter your full name.",
        email: "Check the e-mail address.",
        message: "The message must contain at least 10 characters.",
        consent: "Consent to personal data processing is required.",
      },
      consentPage: {
        metaTitle: "Personal Data Processing Consent | GIR",
        metaDescription: "Terms for processing data submitted through the GIR cooperation form.",
        back: "Return to GIR",
        eyebrow: "GIR • MGIMO",
        title: "Consent to Personal Data Processing",
        intro: "By submitting the cooperation form, the user voluntarily provides data so that the MGIMO project office can process the request.",
        purposeTitle: "Purpose",
        purposeCopy: "Reviewing a proposal to cooperate with GIR, selecting a suitable engagement format and contacting the applicant.",
        dataTitle: "Data processed",
        dataCopy: "Full name, phone number, e-mail address, organization, the GIR project, message, interface language and submission page address.",
        transferTitle: "Transfer and retention",
        transferCopy: "The data is delivered to project_office@inno.mgimo.ru through FormSubmit. According to FormSubmit documentation, submissions may be retained by the service for up to 30 days.",
        withdrawalTitle: "Withdrawal",
        withdrawalCopy: "Requests to correct, restrict or delete the submitted data may be sent to project_office@inno.mgimo.ru.",
        cooperation: "Cooperation",
        controls: "Interface controls",
        language: "Language: English",
        lightTheme: "Switch to light theme",
        darkTheme: "Switch to dark theme",
        brand: "GIR — Global Index Ranker",
      },
    },
  };

  let currentLang = "ru";
  let languageProvider = () => document.documentElement.lang;
  let dialog = null;
  let lastTrigger = null;
  const boundTriggers = new WeakSet();

  function normalizeLang(value) {
    return String(value || "").toLowerCase().startsWith("en") ? "en" : "ru";
  }

  function providedLang() {
    try {
      return normalizeLang(languageProvider?.());
    } catch (_error) {
      return normalizeLang(document.documentElement.lang);
    }
  }

  function readPath(source, path) {
    return path.split(".").reduce((value, key) => value?.[key], source);
  }

  function createElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  }

  function setFieldError(form, fieldName, message = "") {
    const field = form.elements.namedItem(fieldName);
    const error = form.querySelector(`[data-error-for="${fieldName}"]`);
    if (field instanceof HTMLElement) {
      if (message) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
    if (error) error.textContent = message;
  }

  function validateForm(form) {
    const dictionary = COPY[currentLang];
    const fullName = form.elements.namedItem("full_name");
    const phone = form.elements.namedItem("phone");
    const email = form.elements.namedItem("email");
    const organization = form.elements.namedItem("organization");
    const message = form.elements.namedItem("message");
    const consent = form.elements.namedItem("consent");
    const checks = [
      { field: fullName, name: "full_name", valid: fullName.value.trim().length >= 2, error: dictionary.validation.name },
      { field: phone, name: "phone", valid: phone.value.trim().length > 0, error: dictionary.validation.required },
      { field: email, name: "email", valid: email.value.trim().length > 0 && email.validity.valid, error: dictionary.validation.email },
      { field: organization, name: "organization", valid: organization.value.trim().length > 0, error: dictionary.validation.required },
      { field: message, name: "message", valid: message.value.trim().length >= 10, error: dictionary.validation.message },
      { field: consent, name: "consent", valid: consent.checked, error: dictionary.validation.consent },
    ];
    checks.forEach(({ name, valid, error }) => setFieldError(form, name, valid ? "" : error));
    const invalid = checks.find(({ valid }) => !valid);
    invalid?.field.focus();
    return !invalid;
  }

  function resetDialogView() {
    if (!dialog) return;
    const form = dialog.querySelector("#girCooperationForm");
    const success = dialog.querySelector("#girCooperationSuccess");
    form.hidden = false;
    success.hidden = true;
    dialog.dataset.submitted = "";
  }

  function localizeNodeTree(root, dictionary) {
    root?.querySelectorAll?.("[data-cooperation-i18n]").forEach((node) => {
      const value = readPath(dictionary, node.dataset.cooperationI18n);
      if (typeof value === "string") node.textContent = value;
    });
    root?.querySelectorAll?.("[data-cooperation-i18n-aria-label]").forEach((node) => {
      const value = readPath(dictionary, node.dataset.cooperationI18nAriaLabel);
      if (typeof value === "string") node.setAttribute("aria-label", value);
    });
  }

  function localizeTriggers(root = document) {
    const dictionary = COPY[currentLang];
    const triggers = [];
    if (root instanceof Element && root.matches("[data-open-cooperation]")) triggers.push(root);
    root?.querySelectorAll?.("[data-open-cooperation]").forEach((trigger) => triggers.push(trigger));
    triggers.forEach((trigger) => {
      trigger.setAttribute("aria-label", dictionary.trigger);
      const label = trigger.querySelector("[data-cooperation-label]");
      if (label) label.textContent = dictionary.trigger;
      if (trigger.hasAttribute("data-cooperation-tooltip")) trigger.title = dictionary.trigger;
    });
  }

  function updateConsentAssets() {
    const root = document.documentElement;
    if (root.dataset.page !== "personal-data-consent") return;
    const theme = root.dataset.theme === "light" ? "light" : "dark";
    const dictionary = COPY[currentLang].consentPage;
    const logo = document.querySelector("[data-consent-brand]");
    if (logo) {
      logo.src = `/static/brand/gir-${currentLang}-${theme}.svg`;
      logo.alt = dictionary.brand;
    }
    const themeIcon = document.querySelector("[data-consent-theme-icon]");
    const nextThemeLabel = theme === "dark" ? dictionary.lightTheme : dictionary.darkTheme;
    if (themeIcon) {
      themeIcon.src = theme === "dark" ? "/static/icons/sun.svg" : "/static/icons/moon.svg";
      themeIcon.alt = "";
    }
    const themeButton = document.querySelector("[data-consent-theme-toggle]");
    if (themeButton) {
      themeButton.setAttribute("aria-label", nextThemeLabel);
      themeButton.title = nextThemeLabel;
    }
  }

  function updateConsentPage(dictionary) {
    if (document.documentElement.dataset.page !== "personal-data-consent") return;
    const pageCopy = dictionary.consentPage;
    document.title = pageCopy.metaTitle;
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = pageCopy.metaDescription;
    document.querySelectorAll("[data-consent-i18n]").forEach((node) => {
      const value = readPath(pageCopy, node.dataset.consentI18n);
      if (typeof value === "string") node.textContent = value;
    });
    const langButton = document.querySelector("[data-consent-lang-toggle]");
    if (langButton) {
      langButton.textContent = currentLang.toUpperCase();
      langButton.setAttribute("aria-label", pageCopy.language);
      langButton.title = pageCopy.language;
    }
    const controls = document.querySelector("[data-consent-controls]");
    if (controls) controls.setAttribute("aria-label", pageCopy.controls);
    updateConsentAssets();
  }

  function updateLocale(lang) {
    currentLang = normalizeLang(lang);
    document.documentElement.lang = currentLang;
    const dictionary = COPY[currentLang];
    if (dialog) {
      localizeNodeTree(dialog, dictionary);
      const project = dialog.querySelector('[name="project"]');
      if (project) project.value = dictionary.projectValue;
      if (dialog.dataset.error === "true") showErrorStatus();
    }
    localizeTriggers(document);
    updateConsentPage(dictionary);
    return currentLang;
  }

  function showErrorStatus() {
    if (!dialog) return;
    const dictionary = COPY[currentLang];
    const status = dialog.querySelector("#girCooperationStatus");
    status.replaceChildren(document.createTextNode(`${dictionary.error} `));
    const fallback = createElement("a", null, dictionary.emailFallback);
    fallback.href = `mailto:${FORM.email}?subject=${encodeURIComponent(FORM.subject)}`;
    status.appendChild(fallback);
    status.dataset.state = "error";
    status.hidden = false;
    dialog.dataset.error = "true";
  }

  function ensureDialog() {
    if (dialog?.isConnected) return dialog;
    const existing = document.getElementById("girCooperationDialog");
    if (existing) {
      dialog = existing;
      return dialog;
    }

    dialog = createElement("dialog", "gir-cooperation-dialog");
    dialog.id = "girCooperationDialog";
    dialog.setAttribute("aria-labelledby", "girCooperationTitle");
    dialog.setAttribute("aria-describedby", "girCooperationIntro");
    dialog.innerHTML = `
      <div class="gir-cooperation-shell">
        <header class="gir-cooperation-header">
          <div>
            <p class="gir-cooperation-eyebrow" data-cooperation-i18n="eyebrow"></p>
            <h2 id="girCooperationTitle" data-cooperation-i18n="title"></h2>
            <p id="girCooperationIntro" data-cooperation-i18n="intro"></p>
          </div>
          <button class="gir-cooperation-close" type="button" data-cooperation-close data-cooperation-i18n-aria-label="close" aria-label="Close form"><span aria-hidden="true"></span></button>
        </header>
        <form id="girCooperationForm" class="gir-cooperation-form" action="${FORM.fallbackAction}" method="post" novalidate>
          <div class="gir-cooperation-grid">
            <label class="gir-form-field gir-form-field--full">
              <span data-cooperation-i18n="project"></span>
              <input name="project" type="text" readonly aria-readonly="true">
            </label>
            <label class="gir-form-field">
              <span data-cooperation-i18n="fullName"></span>
              <input name="full_name" type="text" minlength="2" maxlength="150" autocomplete="name" required aria-describedby="gir-cooperation-error-name">
              <small id="gir-cooperation-error-name" class="gir-form-error" data-error-for="full_name"></small>
            </label>
            <label class="gir-form-field">
              <span data-cooperation-i18n="phone"></span>
              <input name="phone" type="tel" maxlength="50" autocomplete="tel" required aria-describedby="gir-cooperation-error-phone">
              <small id="gir-cooperation-error-phone" class="gir-form-error" data-error-for="phone"></small>
            </label>
            <label class="gir-form-field">
              <span data-cooperation-i18n="email"></span>
              <input name="email" type="email" maxlength="254" autocomplete="email" required aria-describedby="gir-cooperation-error-email">
              <small id="gir-cooperation-error-email" class="gir-form-error" data-error-for="email"></small>
            </label>
            <label class="gir-form-field">
              <span data-cooperation-i18n="organization"></span>
              <input name="organization" type="text" maxlength="200" autocomplete="organization" required aria-describedby="gir-cooperation-error-organization">
              <small id="gir-cooperation-error-organization" class="gir-form-error" data-error-for="organization"></small>
            </label>
            <label class="gir-form-field gir-form-field--full">
              <span data-cooperation-i18n="message"></span>
              <textarea name="message" rows="5" minlength="10" maxlength="3000" required aria-describedby="gir-cooperation-error-message"></textarea>
              <small id="gir-cooperation-error-message" class="gir-form-error" data-error-for="message"></small>
            </label>
            <label class="gir-consent-field gir-form-field--full">
              <input name="consent" type="checkbox" value="agreed" required aria-describedby="gir-cooperation-error-consent">
              <span><span data-cooperation-i18n="consentBefore"></span><a href="/personal-data-consent" target="_blank" rel="noopener noreferrer"><span data-cooperation-i18n="consentLink"></span></a><span data-cooperation-i18n="consentAfter"></span></span>
            </label>
            <small id="gir-cooperation-error-consent" class="gir-form-error gir-form-field--full" data-error-for="consent"></small>
            <input class="gir-form-honeypot" name="_honey" type="text" tabindex="-1" autocomplete="off" hidden>
            <input name="_subject" type="hidden" value="${FORM.subject}">
            <input name="_template" type="hidden" value="table">
          </div>
          <div id="girCooperationStatus" class="gir-cooperation-status" role="status" aria-live="polite" hidden></div>
          <div class="gir-cooperation-actions">
            <button class="gir-cooperation-button gir-cooperation-button--primary" type="submit"><span data-cooperation-i18n="submit"></span><span aria-hidden="true">→</span></button>
          </div>
        </form>
        <section id="girCooperationSuccess" class="gir-cooperation-success" hidden aria-live="polite">
          <span class="gir-cooperation-success-mark" aria-hidden="true">✓</span>
          <h3 data-cooperation-i18n="successTitle"></h3>
          <p data-cooperation-i18n="successCopy"></p>
          <button class="gir-cooperation-button gir-cooperation-button--primary" type="button" data-cooperation-close><span data-cooperation-i18n="successClose"></span><span aria-hidden="true">→</span></button>
        </section>
      </div>`;
    document.body.appendChild(dialog);

    const form = dialog.querySelector("#girCooperationForm");
    const status = dialog.querySelector("#girCooperationStatus");
    const submitButton = form.querySelector('button[type="submit"]');
    const submitLabel = submitButton.querySelector("[data-cooperation-i18n]");

    const clearError = (event) => {
      if (event.target.name) setFieldError(form, event.target.name);
      status.hidden = true;
      status.dataset.state = "";
      dialog.dataset.error = "";
    };
    form.querySelectorAll("input, textarea").forEach((field) => {
      field.addEventListener("input", clearError);
      field.addEventListener("change", clearError);
    });

    dialog.querySelectorAll("[data-cooperation-close]").forEach((button) => {
      button.addEventListener("click", () => dialog.close());
    });
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", () => {
      form.querySelectorAll("[aria-invalid]").forEach((field) => field.removeAttribute("aria-invalid"));
      form.querySelectorAll("[data-error-for]").forEach((error) => { error.textContent = ""; });
      status.hidden = true;
      status.dataset.state = "";
      dialog.dataset.error = "";
      document.documentElement.classList.remove("gir-cooperation-open");
      if (lastTrigger?.isConnected && typeof lastTrigger.focus === "function") lastTrigger.focus();
      lastTrigger = null;
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.hidden = true;
      dialog.dataset.error = "";
      if (!validateForm(form)) return;

      submitButton.disabled = true;
      submitLabel.textContent = COPY[currentLang].sending;
      const formData = new FormData(form);
      formData.set("project", FORM.project);
      formData.set("source_page", window.location.href);
      formData.set("language", currentLang);
      formData.set("_subject", FORM.subject);
      formData.set("_template", "table");

      try {
        const response = await fetch(FORM.endpoint, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });
        const payload = await response.json().catch(() => ({}));
        const accepted = response.ok && (payload.success === true || payload.success === "true");
        if (!accepted) throw new Error(payload.message || "Form submission failed");
        form.reset();
        form.querySelector('[name="project"]').value = COPY[currentLang].projectValue;
        form.hidden = true;
        dialog.querySelector("#girCooperationSuccess").hidden = false;
        dialog.dataset.submitted = "true";
        dialog.querySelector("#girCooperationSuccess [data-cooperation-close]").focus();
        window.dispatchEvent(new CustomEvent("gir:cooperation-success", { detail: { project: FORM.project } }));
      } catch (error) {
        showErrorStatus();
        window.dispatchEvent(new CustomEvent("gir:cooperation-error", { detail: { message: String(error?.message || error) } }));
      } finally {
        submitButton.disabled = false;
        submitLabel.textContent = COPY[currentLang].submit;
      }
    });

    updateLocale(currentLang);
    return dialog;
  }

  function open(trigger) {
    ensureDialog();
    updateLocale(providedLang());
    if (dialog.dataset.submitted === "true") resetDialogView();
    if (trigger instanceof HTMLElement) lastTrigger = trigger;
    else if (document.activeElement instanceof HTMLElement) lastTrigger = document.activeElement;
    document.documentElement.classList.add("gir-cooperation-open");
    if (!dialog.open) dialog.showModal();
    window.requestAnimationFrame(() => dialog.querySelector('[name="full_name"]')?.focus());
    return dialog;
  }

  function bindTriggers(root = document) {
    const triggers = [];
    if (root instanceof Element && root.matches("[data-open-cooperation]")) triggers.push(root);
    root?.querySelectorAll?.("[data-open-cooperation]").forEach((trigger) => triggers.push(trigger));
    triggers.forEach((trigger) => {
      if (boundTriggers.has(trigger)) return;
      trigger.addEventListener("click", (event) => {
        event.preventDefault();
        open(trigger);
      });
      boundTriggers.add(trigger);
    });
    localizeTriggers(root);
    return triggers.length;
  }

  function init(options = {}) {
    if (typeof options.getLang === "function") languageProvider = options.getLang;
    currentLang = providedLang();
    ensureDialog();
    bindTriggers(document);
    updateLocale(currentLang);
    return API;
  }

  function initializeConsentPage() {
    if (document.documentElement.dataset.page !== "personal-data-consent") return;
    const params = new URLSearchParams(window.location.search);
    const preferredTheme = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
    const requestedTheme = params.get("theme") || localStorage.getItem("theme") || preferredTheme;
    const theme = requestedTheme === "light" ? "light" : "dark";
    currentLang = window.GIRUserContext?.snapshot?.().language || "en";
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("theme", theme);

    init({ getLang: () => currentLang });
    const langButton = document.querySelector("[data-consent-lang-toggle]");
    const themeButton = document.querySelector("[data-consent-theme-toggle]");
    langButton?.addEventListener("click", () => {
      currentLang = currentLang === "ru" ? "en" : "ru";
      window.GIRUserContext?.setManualLanguage?.(currentLang);
      updateLocale(currentLang);
    });
    themeButton?.addEventListener("click", () => {
      document.documentElement.dataset.theme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", document.documentElement.dataset.theme);
      updateConsentAssets();
    });
  }

  const API = Object.freeze({ init, updateLocale, open, bindTriggers });
  window.GIRCooperation = API;

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initializeConsentPage, { once: true });
  else initializeConsentPage();
})();
