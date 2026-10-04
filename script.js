const SERVER_HOST = "play.peanutsmp.de5.net";
const STATUS_API = "https://api.mcsrvstat.us/3/" + SERVER_HOST;
const REFRESH_MS = 30000;

function showToast(msg = "已複製到剪貼簿") {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 1800);
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("已複製：" + text);
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = "已複製";
      setTimeout(() => { btn.innerHTML = original; }, 1500);
    }
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
    showToast("已複製：" + text);
  }
}

function copyIP() {
  copyText(SERVER_HOST);
}

function copyFull() {
  copyText(SERVER_HOST);
}

function setDot(state) {
  const dot = document.getElementById("status-dot");
  if (dot) dot.setAttribute("data-state", state);
}

function renderPlayers(list, online) {
  const el = document.getElementById("players-list");
  if (!el) return;

  if (!online || online === 0) {
    el.innerHTML = '<p class="players-empty">目前無人在線，快來當第一個！</p>';
    return;
  }

  if (!list || list.length === 0) {
    el.innerHTML =
      '<p class="players-empty">目前有 <strong>' +
      online +
      "</strong> 人在線（伺服器未回傳玩家名單）</p>";
    return;
  }

  el.innerHTML = list
    .map(function (p) {
      const name = typeof p === "string" ? p : p.name || "?";
      const uuid = typeof p === "object" && p.uuid ? p.uuid : name;
      const face =
        "https://mc-heads.net/avatar/" +
        encodeURIComponent(uuid || name) +
        "/40";
      return (
        '<div class="player-chip">' +
        '<img src="' +
        face +
        '" alt="" width="28" height="28" loading="lazy" />' +
        "<span>" +
        escapeHtml(name) +
        "</span></div>"
      );
    })
    .join("");
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

let fetching = false;

async function fetchStatus(manual) {
  if (fetching) return;
  fetching = true;
  const btn = document.getElementById("btn-refresh");
  if (btn) btn.classList.add("spinning");

  try {
    const res = await fetch(STATUS_API + "?_=" + Date.now(), {
      cache: "no-store",
    });
    const data = await res.json();

    const online = !!data.online;
    setDot(online ? "online" : "offline");

    const textEl = document.getElementById("status-text");
    if (textEl) textEl.textContent = online ? "線上" : "離線";

    const players = data.players || {};
    const count = players.online != null ? players.online : 0;
    const max = players.max != null ? players.max : "—";
    const countEl = document.getElementById("status-count");
    if (countEl) countEl.textContent = online ? count + " / " + max : "— / —";

    const verEl = document.getElementById("status-version");
    if (verEl) {
      verEl.textContent = online
        ? data.version || (data.software ? data.software : "—")
        : "—";
    }

    const latEl = document.getElementById("status-latency");
    if (latEl) {
      latEl.textContent = online ? "正常" : "—";
    }

    let list = [];
    if (players.list && Array.isArray(players.list)) {
      list = players.list;
    }

    renderPlayers(list, online ? count : 0);

    const note = document.getElementById("status-note");
    if (note && online) {
      note.textContent =
        "資料來源：mcsrvstat.us · 最後更新 " +
        new Date().toLocaleTimeString("zh-TW");
    }
  } catch (e) {
    setDot("offline");
    const textEl = document.getElementById("status-text");
    if (textEl) textEl.textContent = "無法連線";
    const listEl = document.getElementById("players-list");
    if (listEl)
      listEl.innerHTML =
        '<p class="players-empty">狀態查詢失敗，請稍後再試</p>';
  } finally {
    fetching = false;
    if (btn) btn.classList.remove("spinning");
  }
}

document.addEventListener("DOMContentLoaded", function () {
  if (document.getElementById("status-panel")) {
    fetchStatus();
    setInterval(fetchStatus, REFRESH_MS);
  }
});
