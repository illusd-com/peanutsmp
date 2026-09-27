function showToast(msg = "已複製到剪貼簿") {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, 1800);
}

async function copyText(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    showToast("已複製：" + text);
    if (btn) {
      const original = btn.innerHTML;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> 已複製`;
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
  copyText("192.168.0.11");
}

function copyFull() {
  copyText("192.168.0.11:19132");
}
