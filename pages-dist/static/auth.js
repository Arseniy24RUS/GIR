(() => {
  "use strict";

  const nativeFetch = window.fetch.bind(window);
  const state = {
    authenticated: false,
    bootstrapRequired: false,
    user: null,
    csrf: null,
    expiresAt: null,
    passwordMinLength: 1,
    open: false,
    loading: true,
    error: "",
    notice: "",
    pending: null,
    adminOpen: false,
    adminLoading: false,
    adminUsers: [],
    resetTarget: null,
    deleteConfirm: null,
    lang: document.documentElement.lang === "en" ? "en" : "ru",
  };
  let returnFocus = null;
  let adminReturnFocus = null;
  let statusTimer = null;
  const mounts = [];

  const I18N = {
    ru: {
      account: "Учётная запись", signIn: "Войти", signInTitle: "Вход в платформу",
      signInCopy: "Доступ к аналитической части предоставляется сотрудникам и студентам МГИМО по выданной учётной записи.",
      username: "Логин", password: "Пароль", submit: "Войти", signingIn: "Проверка…",
      invalid: "Неверный логин или пароль.", authRequired: "Для продолжения войдите в платформу.",
      bootstrap: "Система пользователей ещё не инициализирована. Администратору необходимо выполнить команду scripts/manage_users.py ensure-fixed-admin.",
      signedInAs: "Вы вошли как", administrator: "Администратор", user: "Пользователь",
      manage: "Управление доступом", changePassword: "Сменить пароль", logout: "Выйти",
      session: "Сессия защищена серверным cookie и автоматически завершается при бездействии.",
      mandatoryTitle: "Создайте постоянный пароль", mandatoryCopy: "Одноразовый пароль необходимо заменить перед доступом к аналитическим данным.",
      currentPassword: "Текущий пароль", newPassword: "Новый пароль", confirmPassword: "Повторите новый пароль",
      passwordsMismatch: "Новые пароли не совпадают.", savePassword: "Сохранить пароль", passwordChanged: "Пароль изменён. Доступ к платформе открыт.",
      adminTitle: "Управление доступом", adminCopy: "Учётные записи создаются только администратором. Внешняя регистрация отключена.",
      createUser: "Создать учётную запись", displayName: "Имя пользователя", role: "Роль", temporaryPassword: "Временный пароль",
      generate: "Сгенерировать", create: "Создать", users: "Пользователи", activeSessions: "Сессии", lastLogin: "Последний вход",
      never: "ещё не входил", reset: "Сбросить пароль", delete: "Удалить", confirmDelete: "Подтвердить удаление",
      resetTitle: "Новый временный пароль для", applyReset: "Установить и отозвать сессии", cancel: "Отмена",
      created: "Учётная запись создана.", resetDone: "Пароль сброшен; активные сессии пользователя отозваны.", deleted: "Учётная запись удалена.",
      close: "Закрыть", current: "текущая", mustChange: "смена пароля обязательна", passwordHint: "Пароль задаёт администратор.",
      networkError: "Не удалось связаться с сервером авторизации.", expired: "Сессия завершена. Войдите повторно.",
    },
    en: {
      account: "Account", signIn: "Sign in", signInTitle: "Platform sign-in",
      signInCopy: "The analytical workspace is available to MGIMO staff and students with an issued account.",
      username: "Username", password: "Password", submit: "Sign in", signingIn: "Checking…",
      invalid: "Invalid username or password.", authRequired: "Sign in to continue.",
      bootstrap: "The user store has not been initialised. An administrator must run scripts/manage_users.py ensure-fixed-admin.",
      signedInAs: "Signed in as", administrator: "Administrator", user: "User",
      manage: "Manage access", changePassword: "Change password", logout: "Sign out",
      session: "The session uses a server-side cookie and expires automatically after inactivity.",
      mandatoryTitle: "Create a permanent password", mandatoryCopy: "The one-time password must be replaced before analytical data can be accessed.",
      currentPassword: "Current password", newPassword: "New password", confirmPassword: "Repeat new password",
      passwordsMismatch: "The new passwords do not match.", savePassword: "Save password", passwordChanged: "Password changed. Platform access is now available.",
      adminTitle: "Access management", adminCopy: "Accounts are created by administrators only. Public registration is disabled.",
      createUser: "Create account", displayName: "Display name", role: "Role", temporaryPassword: "Temporary password",
      generate: "Generate", create: "Create", users: "Users", activeSessions: "Sessions", lastLogin: "Last sign-in",
      never: "not signed in yet", reset: "Reset password", delete: "Delete", confirmDelete: "Confirm deletion",
      resetTitle: "New temporary password for", applyReset: "Set and revoke sessions", cancel: "Cancel",
      created: "Account created.", resetDone: "Password reset; active user sessions were revoked.", deleted: "Account deleted.",
      close: "Close", current: "current", mustChange: "password change required", passwordHint: "Password is set by the administrator.",
      networkError: "Could not reach the authentication service.", expired: "The session has ended. Sign in again.",
    },
  };

  const tr = (key) => (I18N[state.lang] || I18N.ru)[key] || key;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>'"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[ch]));
  const detailMessage = (payload, fallback) => {
    const detail = payload?.detail;
    if (typeof detail === "string") return detail;
    if (detail && typeof detail.message === "string") return detail.message;
    return fallback;
  };
  const sameOrigin = (input) => {
    try { return new URL(typeof input === "string" ? input : input.url, location.href).origin === location.origin; }
    catch (_) { return false; }
  };
  const unsafeMethod = (method) => !/^(GET|HEAD|OPTIONS)$/i.test(method || "GET");

  function setAuthDocumentState() {
    document.documentElement.dataset.authState = state.loading ? "loading" : (state.authenticated ? "authenticated" : "anonymous");
    document.documentElement.dataset.authRole = state.user?.role || "none";
    document.documentElement.dataset.authPasswordChange = state.user?.must_change_password ? "required" : "complete";
  }

  async function authRequest(path, options = {}) {
    const headers = new Headers(options.headers || {});
    if (unsafeMethod(options.method || "GET")) {
      headers.set("Content-Type", "application/json");
      headers.set("X-GIR-Request", "GIR");
      if (state.csrf) headers.set("X-GIR-CSRF", state.csrf);
    }
    return nativeFetch(path, { credentials: "same-origin", cache: "no-store", ...options, headers });
  }

  window.fetch = async (input, options = {}) => {
    const headers = new Headers(options.headers || (input instanceof Request ? input.headers : {}));
    const method = options.method || (input instanceof Request ? input.method : "GET");
    const url = new URL(typeof input === "string" ? input : input.url, location.href);
    if (url.origin === location.origin && unsafeMethod(method) && state.csrf && !url.pathname.startsWith("/api/auth/login")) {
      headers.set("X-GIR-CSRF", state.csrf);
      headers.set("X-GIR-Request", "GIR");
    }
    const response = await nativeFetch(input, { ...options, headers, credentials: options.credentials || "same-origin" });
    if (url.origin === location.origin && !url.pathname.startsWith("/api/auth/")) {
      if (response.status === 401) handleUnauthorized(tr("expired"));
      if (response.status === 403) {
        try {
          const payload = await response.clone().json();
          if (payload?.detail?.code === "PASSWORD_CHANGE_REQUIRED") {
            state.user = { ...(state.user || {}), must_change_password: true };
            state.open = true; renderAll();
          }
        } catch (_) { /* non-JSON protected response */ }
      }
    }
    return response;
  };

  function currentInitial() {
    return String(state.user?.display_name || state.user?.username || "G").trim().slice(0, 1).toUpperCase();
  }

  function loginMarkup() {
    if (state.bootstrapRequired) {
      return `<div class="gir-auth-popover-head"><span class="gir-auth-kicker">GIR ACCESS</span><h2>${escapeHtml(tr("signInTitle"))}</h2><p>${escapeHtml(tr("signInCopy"))}</p></div><div class="gir-auth-body"><div class="gir-auth-notice">${escapeHtml(tr("bootstrap"))}</div></div>`;
    }
    return `<div class="gir-auth-popover-head"><span class="gir-auth-kicker">GIR ACCESS</span><h2>${escapeHtml(tr("signInTitle"))}</h2><p>${escapeHtml(tr("signInCopy"))}</p></div>
      <div class="gir-auth-body">
        ${state.notice ? `<div class="gir-auth-notice">${escapeHtml(state.notice)}</div>` : ""}
        ${state.error ? `<div class="gir-auth-error" role="alert">${escapeHtml(state.error)}</div>` : ""}
        <form class="gir-auth-form" data-auth-form="login">
          <label class="gir-auth-field"><span>${escapeHtml(tr("username"))}</span><input name="username" autocomplete="username" required maxlength="64"></label>
          <label class="gir-auth-field"><span>${escapeHtml(tr("password"))}</span><input name="password" type="password" autocomplete="current-password" required maxlength="256"></label>
          <button class="gir-auth-primary" type="submit">${escapeHtml(tr("submit"))}</button>
        </form>
      </div>`;
  }

  function passwordMarkup(mandatory = false) {
    return `<div class="gir-auth-popover-head"><span class="gir-auth-kicker">${mandatory ? "FIRST SIGN-IN" : "ACCOUNT SECURITY"}</span><h2>${escapeHtml(mandatory ? tr("mandatoryTitle") : tr("changePassword"))}</h2><p>${escapeHtml(mandatory ? tr("mandatoryCopy") : tr("passwordHint").replace("{n}", state.passwordMinLength))}</p></div>
      <div class="gir-auth-body">
        ${state.error ? `<div class="gir-auth-error" role="alert">${escapeHtml(state.error)}</div>` : ""}
        ${state.notice ? `<div class="gir-auth-notice">${escapeHtml(state.notice)}</div>` : ""}
        <form class="gir-auth-form" data-auth-form="change-password">
          <label class="gir-auth-field"><span>${escapeHtml(tr("currentPassword"))}</span><input name="current_password" type="password" autocomplete="current-password" required maxlength="256"></label>
          <label class="gir-auth-field"><span>${escapeHtml(tr("newPassword"))}</span><input name="new_password" type="password" autocomplete="new-password" required minlength="${state.passwordMinLength}" maxlength="256"></label>
          <label class="gir-auth-field"><span>${escapeHtml(tr("confirmPassword"))}</span><input name="confirm_password" type="password" autocomplete="new-password" required minlength="${state.passwordMinLength}" maxlength="256"></label>
          <button class="gir-auth-primary" type="submit">${escapeHtml(tr("savePassword"))}</button>
        </form>
        ${mandatory ? `<button type="button" class="gir-auth-link" data-auth-action="logout">${escapeHtml(tr("logout"))}</button>` : `<button type="button" class="gir-auth-link" data-auth-action="account">← ${escapeHtml(tr("account"))}</button>`}
      </div>`;
  }

  function accountMarkup() {
    const role = state.user?.role === "admin" ? tr("administrator") : tr("user");
    return `<div class="gir-auth-body gir-auth-account-body">
        ${state.notice ? `<div class="gir-auth-notice">${escapeHtml(state.notice)}</div>` : ""}
        <div class="gir-auth-user-card"><span class="gir-auth-avatar">${escapeHtml(currentInitial())}</span><div><strong>${escapeHtml(state.user?.display_name || state.user?.username)}</strong><small>${escapeHtml(role)}</small></div></div>
        <div class="gir-auth-actions">
          ${state.user?.role === "admin" ? `<button class="gir-auth-primary" type="button" data-auth-action="manage">${escapeHtml(tr("manage"))}</button>` : ""}
          <div class="gir-auth-action-row"><button class="gir-auth-secondary" type="button" data-auth-action="password">${escapeHtml(tr("changePassword"))}</button><button class="gir-auth-secondary" type="button" data-auth-action="logout">${escapeHtml(tr("logout"))}</button></div>
        </div>
      </div>`;
  }

  function mountMarkup(mount) {
    const label = state.authenticated ? (state.user?.display_name || state.user?.username || tr("account")) : tr("signIn");
    const content = !state.authenticated ? loginMarkup() : (state.user?.must_change_password || mount.dataset.authView === "password" ? passwordMarkup(Boolean(state.user?.must_change_password)) : accountMarkup());
    mount.classList.add("gir-auth");
    mount.innerHTML = `<button type="button" class="gir-auth-button" data-auth-action="toggle" data-authenticated="${state.authenticated}" aria-expanded="${state.open}" aria-haspopup="dialog" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}"><img src="/static/icons/user-round.svg" alt="" aria-hidden="true"></button><section class="gir-auth-popover" role="dialog" aria-label="${escapeHtml(tr("account"))}" ${state.open ? "" : "hidden"}>${content}</section>`;
    bindMount(mount);
  }

  function renderAll() {
    setAuthDocumentState();
    mounts.splice(0, mounts.length, ...document.querySelectorAll("[data-gir-auth-mount]"));
    mounts.forEach(mountMarkup);
  }

  function bindMount(mount) {
    mount.querySelector('[data-auth-action="toggle"]')?.addEventListener("click", (event) => {
      event.stopPropagation();
      state.open = !state.open; state.error = ""; state.notice = "";
      if (state.open) returnFocus = event.currentTarget;
      renderAll();
      if (state.open) setTimeout(() => mount.querySelector("input, button:not([data-auth-action='toggle'])")?.focus(), 0);
    });
    mount.querySelector('[data-auth-form="login"]')?.addEventListener("submit", submitLogin);
    mount.querySelector('[data-auth-form="change-password"]')?.addEventListener("submit", submitPasswordChange);
    mount.querySelectorAll("[data-auth-action]").forEach((button) => {
      if (button.dataset.authAction === "toggle") return;
      button.addEventListener("click", () => runAction(button.dataset.authAction, mount));
    });
  }

  async function submitLogin(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const submit = form.querySelector("button[type='submit']");
    submit.disabled = true; submit.textContent = tr("signingIn"); state.error = "";
    try {
      const response = await authRequest("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username: form.username.value.trim(), password: form.password.value }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(detailMessage(payload, tr("invalid")));
      applyStatus(payload);
      state.open = Boolean(state.user?.must_change_password);
      state.notice = "";
      renderAll();
      dispatchChange();
      if (!state.user?.must_change_password) continuePending();
    } catch (error) {
      state.error = error.message || tr("invalid"); renderAll();
    }
  }

  async function submitPasswordChange(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.new_password.value !== form.confirm_password.value) {
      state.error = tr("passwordsMismatch"); renderAll(); return;
    }
    const submit = form.querySelector("button[type='submit']");
    submit.disabled = true;
    try {
      const response = await authRequest("/api/auth/change-password", {
        method: "POST",
        body: JSON.stringify({ current_password: form.current_password.value, new_password: form.new_password.value }),
      });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(detailMessage(payload, tr("networkError")));
      applyStatus({ authenticated: true, ...payload });
      state.notice = tr("passwordChanged"); state.error = ""; state.open = true;
      document.querySelectorAll("[data-gir-auth-mount]").forEach((mount) => { delete mount.dataset.authView; });
      renderAll(); dispatchChange();
      setTimeout(continuePending, 450);
    } catch (error) { state.error = error.message || tr("networkError"); renderAll(); }
  }

  async function runAction(action, mount) {
    if (action === "account") { delete mount.dataset.authView; state.error = ""; state.notice = ""; renderAll(); return; }
    if (action === "password") { mount.dataset.authView = "password"; state.error = ""; state.notice = ""; renderAll(); return; }
    if (action === "manage") { state.open = false; renderAll(); openAdmin(); return; }
    if (action === "logout") { await logout(); }
  }

  function applyStatus(payload) {
    state.authenticated = Boolean(payload?.authenticated);
    state.bootstrapRequired = Boolean(payload?.bootstrap_required);
    state.user = payload?.user || null;
    state.csrf = payload?.csrf_token || null;
    state.expiresAt = payload?.expires_at || null;
    state.passwordMinLength = Number(payload?.password_min_length || state.passwordMinLength || 1);
    state.loading = false;
  }

  async function refreshStatus({ quiet = false } = {}) {
    try {
      const response = await nativeFetch("/api/auth/status", { credentials: "same-origin", cache: "no-store" });
      const payload = await response.json();
      applyStatus(payload);
      if (!quiet) renderAll();
      dispatchChange();
      return payload;
    } catch (error) {
      state.loading = false; state.authenticated = false; state.user = null; state.csrf = null;
      if (!quiet) { state.error = tr("networkError"); renderAll(); }
      return { authenticated: false };
    }
  }

  async function logout() {
    try { await authRequest("/api/auth/logout", { method: "POST", body: "{}" }); } catch (_) { /* local state is cleared anyway */ }
    state.authenticated = false; state.user = null; state.csrf = null; state.pending = null; state.open = false; state.notice = ""; state.error = "";
    sessionStorage.removeItem("gir_auth_pending");
    renderAll(); dispatchChange();
    location.assign("/#landing");
  }

  function dispatchChange() {
    window.dispatchEvent(new CustomEvent("gir:auth-changed", { detail: { authenticated: state.authenticated, user: state.user } }));
  }

  function safeLocalPath(value) {
    if (!value || typeof value !== "string") return "";
    try {
      const parsed = new URL(value, location.origin);
      if (parsed.origin !== location.origin || !["http:", "https:"].includes(parsed.protocol)) return "";
      const result = `${parsed.pathname}${parsed.search}${parsed.hash}`;
      return result.startsWith("/") && !result.startsWith("//") ? result : "";
    } catch (_) {
      return "";
    }
  }

  function requireLogin({ route = "", path = "", message = "" } = {}) {
    if (state.authenticated && !state.user?.must_change_password) return true;
    state.pending = route ? { kind: "route", value: route } : path ? { kind: "path", value: path } : state.pending;
    if (state.pending) sessionStorage.setItem("gir_auth_pending", JSON.stringify(state.pending));
    state.notice = message || tr("authRequired"); state.error = ""; state.open = true;
    renderAll();
    setTimeout(() => document.querySelector("[data-auth-form='login'] input")?.focus(), 0);
    return false;
  }

  function continuePending() {
    if (!state.authenticated || state.user?.must_change_password) return;
    let pending = state.pending;
    if (!pending) {
      try { pending = JSON.parse(sessionStorage.getItem("gir_auth_pending") || "null"); } catch (_) { pending = null; }
    }
    state.pending = null; sessionStorage.removeItem("gir_auth_pending");
    if (!pending) return;
    state.open = false; renderAll();
    if (pending.kind === "path") {
      const target = safeLocalPath(pending.value);
      if (target) location.assign(target);
      return;
    }
    if (pending.kind === "route") {
      if (typeof window.routeTo === "function") window.routeTo(pending.value);
      else location.hash = pending.value;
    }
  }

  function handleUnauthorized(message = "") {
    if (!state.authenticated && state.open) return;
    state.authenticated = false; state.user = null; state.csrf = null; state.notice = message || tr("expired");
    const hash = location.hash.replace(/^#/, "");
    if (hash && hash !== "landing") state.pending = { kind: "route", value: hash };
    state.open = true; renderAll(); dispatchChange();
    if (typeof window.routeTo === "function") window.routeTo("landing");
  }

  function randomPassword(length = 18) {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789-_=+!@#%";
    const bytes = new Uint32Array(length); crypto.getRandomValues(bytes);
    return Array.from(bytes, (n) => chars[n % chars.length]).join("");
  }

  async function loadAdminUsers() {
    state.adminLoading = true; renderAdmin();
    try {
      const response = await authRequest("/api/auth/users");
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(detailMessage(payload, tr("networkError")));
      state.adminUsers = payload.users || []; state.error = "";
    } catch (error) { state.error = error.message || tr("networkError"); }
    finally { state.adminLoading = false; renderAdmin(); }
  }

  function ensureAdminLayer() {
    let layer = document.getElementById("gir-auth-admin-layer");
    if (!layer) {
      layer = document.createElement("div"); layer.id = "gir-auth-admin-layer"; layer.className = "gir-auth-admin-layer"; layer.hidden = true;
      document.body.appendChild(layer);
    }
    return layer;
  }

  async function openAdmin() {
    if (state.user?.role !== "admin") return;
    adminReturnFocus = document.activeElement; state.adminOpen = true; state.error = ""; state.notice = "";
    document.documentElement.classList.add("gir-auth-admin-open");
    renderAdmin(); await loadAdminUsers();
  }

  function closeAdmin() {
    state.adminOpen = false; state.resetTarget = null; state.deleteConfirm = null; state.error = ""; state.notice = "";
    document.documentElement.classList.remove("gir-auth-admin-open");
    renderAdmin(); if (adminReturnFocus?.focus) adminReturnFocus.focus(); adminReturnFocus = null;
  }

  function userRow(user) {
    const role = user.role === "admin" ? tr("administrator") : tr("user");
    const lastLogin = user.last_login_at ? new Date(user.last_login_at).toLocaleString(state.lang === "ru" ? "ru-RU" : "en-GB") : tr("never");
    const deleteLabel = state.deleteConfirm === user.id ? tr("confirmDelete") : tr("delete");
    return `<div class="gir-auth-user-row" data-user-id="${user.id}"><div><strong>${escapeHtml(user.display_name || user.username)} ${user.is_current ? `<small>(${escapeHtml(tr("current"))})</small>` : ""}</strong><small>${escapeHtml(user.username)}${user.must_change_password ? ` · ${escapeHtml(tr("mustChange"))}` : ""}</small></div><span class="gir-auth-role">${escapeHtml(role)}</span><span class="gir-auth-session-count"><strong>${Number(user.active_sessions || 0)}</strong><small>${escapeHtml(tr("activeSessions"))}</small></span><div class="gir-auth-user-buttons">${!user.is_current ? `<button type="button" class="gir-auth-secondary" data-admin-action="reset" data-user-id="${user.id}" data-username="${escapeHtml(user.username)}">${escapeHtml(tr("reset"))}</button><button type="button" class="gir-auth-danger" data-admin-action="delete" data-user-id="${user.id}">${escapeHtml(deleteLabel)}</button>` : ""}</div><small>${escapeHtml(tr("lastLogin"))}: ${escapeHtml(lastLogin)}</small></div>`;
  }

  function renderAdmin() {
    const layer = ensureAdminLayer(); layer.hidden = !state.adminOpen;
    if (!state.adminOpen) { layer.innerHTML = ""; return; }
    const resetUser = state.adminUsers.find((item) => item.id === state.resetTarget);
    layer.innerHTML = `<div class="gir-auth-admin-backdrop" data-admin-action="close"></div><section class="gir-auth-admin" role="dialog" aria-modal="true" aria-labelledby="gir-auth-admin-title"><header class="gir-auth-admin-header"><div><span class="gir-auth-kicker">GIR ACCESS CONTROL</span><h2 id="gir-auth-admin-title">${escapeHtml(tr("adminTitle"))}</h2><p>${escapeHtml(tr("adminCopy"))}</p></div><button class="gir-auth-admin-close" type="button" data-admin-action="close" aria-label="${escapeHtml(tr("close"))}">×</button></header><div class="gir-auth-admin-body">${state.error ? `<div class="gir-auth-error" role="alert">${escapeHtml(state.error)}</div>` : ""}${state.notice ? `<div class="gir-auth-notice">${escapeHtml(state.notice)}</div>` : ""}<div class="gir-auth-admin-grid"><section class="gir-auth-admin-panel"><h3>${escapeHtml(tr("createUser"))}</h3><p>${escapeHtml(tr("passwordHint").replace("{n}", state.passwordMinLength))}</p><form class="gir-auth-form" id="gir-auth-create-user"><label class="gir-auth-field"><span>${escapeHtml(tr("username"))}</span><input name="username" autocomplete="off" required maxlength="64"></label><label class="gir-auth-field"><span>${escapeHtml(tr("displayName"))}</span><input name="display_name" autocomplete="off" maxlength="120"></label><label class="gir-auth-field"><span>${escapeHtml(tr("role"))}</span><select name="role"><option value="user">${escapeHtml(tr("user"))}</option><option value="admin">${escapeHtml(tr("administrator"))}</option></select></label><label class="gir-auth-field"><span>${escapeHtml(tr("temporaryPassword"))}</span><span class="gir-auth-password-row"><input name="temporary_password" type="text" autocomplete="off" required minlength="${state.passwordMinLength}" maxlength="256"><button type="button" class="gir-auth-secondary" data-admin-action="generate" data-target="create">${escapeHtml(tr("generate"))}</button></span></label><button class="gir-auth-primary" type="submit">${escapeHtml(tr("create"))}</button></form></section><section class="gir-auth-admin-panel"><h3>${escapeHtml(tr("users"))} · ${state.adminUsers.length}</h3><p>${state.adminLoading ? "…" : escapeHtml(tr("adminCopy"))}</p><div class="gir-auth-user-list">${state.adminUsers.map(userRow).join("") || "—"}</div>${resetUser ? `<div class="gir-auth-reset-panel"><h3>${escapeHtml(tr("resetTitle"))} ${escapeHtml(resetUser.username)}</h3><form class="gir-auth-form" id="gir-auth-reset-user"><input type="hidden" name="user_id" value="${resetUser.id}"><label class="gir-auth-field"><span>${escapeHtml(tr("temporaryPassword"))}</span><span class="gir-auth-password-row"><input name="temporary_password" type="text" required minlength="${state.passwordMinLength}" maxlength="256"><button type="button" class="gir-auth-secondary" data-admin-action="generate" data-target="reset">${escapeHtml(tr("generate"))}</button></span></label><div class="gir-auth-action-row"><button class="gir-auth-primary" type="submit">${escapeHtml(tr("applyReset"))}</button><button class="gir-auth-secondary" type="button" data-admin-action="cancel-reset">${escapeHtml(tr("cancel"))}</button></div></form></div>` : ""}</section></div></div></section>`;
    bindAdmin(layer);
    setTimeout(() => layer.querySelector(".gir-auth-admin-close")?.focus(), 0);
  }

  function bindAdmin(layer) {
    layer.querySelectorAll("[data-admin-action]").forEach((button) => button.addEventListener("click", async () => {
      const action = button.dataset.adminAction;
      if (action === "close") { closeAdmin(); return; }
      if (action === "cancel-reset") { state.resetTarget = null; renderAdmin(); return; }
      if (action === "generate") {
        const form = button.closest("form"); const input = form?.querySelector("input[name='temporary_password']");
        if (input) { input.value = randomPassword(); input.focus(); input.select(); }
        return;
      }
      if (action === "reset") { state.resetTarget = Number(button.dataset.userId); state.deleteConfirm = null; renderAdmin(); return; }
      if (action === "delete") {
        const id = Number(button.dataset.userId);
        if (state.deleteConfirm !== id) { state.deleteConfirm = id; renderAdmin(); setTimeout(() => { if (state.deleteConfirm === id) { state.deleteConfirm = null; renderAdmin(); } }, 5000); return; }
        await deleteUser(id); return;
      }
    }));
    layer.querySelector("#gir-auth-create-user")?.addEventListener("submit", createAdminUser);
    layer.querySelector("#gir-auth-reset-user")?.addEventListener("submit", resetAdminUser);
  }

  async function createAdminUser(event) {
    event.preventDefault(); const form = event.currentTarget;
    try {
      const response = await authRequest("/api/auth/users", { method: "POST", body: JSON.stringify({ username: form.username.value.trim(), display_name: form.display_name.value.trim(), role: form.role.value, temporary_password: form.temporary_password.value }) });
      const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(detailMessage(payload, tr("networkError")));
      state.notice = tr("created"); state.error = ""; await loadAdminUsers();
    } catch (error) { state.error = error.message || tr("networkError"); renderAdmin(); }
  }

  async function resetAdminUser(event) {
    event.preventDefault(); const form = event.currentTarget; const id = Number(form.user_id.value);
    try {
      const response = await authRequest(`/api/auth/users/${id}/reset-password`, { method: "POST", body: JSON.stringify({ temporary_password: form.temporary_password.value }) });
      const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(detailMessage(payload, tr("networkError")));
      state.notice = tr("resetDone"); state.error = ""; state.resetTarget = null; await loadAdminUsers();
    } catch (error) { state.error = error.message || tr("networkError"); renderAdmin(); }
  }

  async function deleteUser(id) {
    try {
      const response = await authRequest(`/api/auth/users/${id}`, { method: "DELETE", body: "{}" });
      const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(detailMessage(payload, tr("networkError")));
      state.notice = tr("deleted"); state.error = ""; state.deleteConfirm = null; await loadAdminUsers();
    } catch (error) { state.error = error.message || tr("networkError"); renderAdmin(); }
  }

  function updateLocale(lang) { state.lang = lang === "en" ? "en" : "ru"; renderAll(); if (state.adminOpen) renderAdmin(); }
  function isAuthenticated() { return state.authenticated && !state.user?.must_change_password; }

  function bindGlobalEvents() {
    document.addEventListener("click", (event) => {
      const insideAuth = event.composedPath().some((node) => node instanceof Element && node.matches?.("[data-gir-auth-mount]"));
      if (state.open && !insideAuth) { state.open = false; renderAll(); }
      const link = event.target.closest("a[href]");
      if (!link || isAuthenticated()) return;
      let url;
      try { url = new URL(link.href, location.href); } catch (_) { return; }
      if (url.origin !== location.origin || !["/data-lab", "/data-explorer", "/data"].includes(url.pathname)) return;
      event.preventDefault(); requireLogin({ path: url.pathname + url.search });
    });
    document.addEventListener("keydown", (event) => {
      if (state.adminOpen && event.key === "Tab") {
        const layer = document.getElementById("gir-auth-admin-layer");
        const focusable = [...(layer?.querySelectorAll("button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex='-1'])") || [])]
          .filter((node) => node.getClientRects().length > 0);
        if (focusable.length) {
          const first = focusable[0]; const last = focusable[focusable.length - 1];
          if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); return; }
          if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); return; }
        }
      }
      if (event.key !== "Escape") return;
      if (state.adminOpen) { closeAdmin(); return; }
      if (state.open) { state.open = false; renderAll(); if (returnFocus?.focus) returnFocus.focus(); returnFocus = null; }
    });
    window.addEventListener("gir:auth-open", (event) => requireLogin(event.detail || {}));
    document.addEventListener("visibilitychange", () => { if (!document.hidden && state.authenticated) refreshStatus({ quiet: true }); });
  }

  async function init() {
    setAuthDocumentState(); renderAll(); bindGlobalEvents();
    const payload = await refreshStatus();
    const params = new URLSearchParams(location.search);
    const authReason = params.get("auth");
    if (["required", "password"].includes(authReason)) {
      const next = safeLocalPath(params.get("next")); if (next) state.pending = { kind: "path", value: next };
      if (!payload.authenticated) state.notice = tr("authRequired");
      state.open = true; renderAll();
      const clean = new URL(location.href); clean.searchParams.delete("auth"); clean.searchParams.delete("next"); history.replaceState(null, "", `${clean.pathname}${clean.search}${clean.hash || "#landing"}`);
    }
    if (payload.authenticated && payload.user?.must_change_password) { state.open = true; renderAll(); }
    clearInterval(statusTimer); statusTimer = setInterval(() => refreshStatus({ quiet: true }), 5 * 60 * 1000);
    return payload;
  }

  const ready = init();
  window.GIRAuth = { ready, state, isAuthenticated, requireLogin, refreshStatus, updateLocale, open: () => requireLogin(), logout };
})();
