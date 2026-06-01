/* =============================================
   Binance Invoice Page — Script
   
   URL FORMAT:
   index.html?amount=50&bot_name=MyBot&uid=123456789&invoice_id=INV-001
   
   Parameters:
   - amount      : Payment amount in USDT (required)
   - bot_name    : Display name of the bot (optional, fallback: "PayBot")
   - uid         : Binance UID of the receiver (required)
   - invoice_id  : Invoice/Order ID (optional, auto-generated if missing)
   ============================================= */

// ──────────────────────────────────────────────
// BOT CONFIG (Default fallback values)
// These are overridden by URL parameters
// ──────────────────────────────────────────────
const BOT_DEFAULTS = {
  name: "PayBot",
  uid:  "N/A",
};

// ──────────────────────────────────────────────
// Parse URL Parameters
// ──────────────────────────────────────────────
function getParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    amount:    params.get("amount")     || "0.00",
    botName:   params.get("bot_name")   || BOT_DEFAULTS.name,
    uid:       params.get("uid")        || BOT_DEFAULTS.uid,
    invoiceId: params.get("invoice_id") || generateInvoiceId(),
  };
}

function generateInvoiceId() {
  const ts   = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `INV-${ts}-${rand}`;
}

// ──────────────────────────────────────────────
// Render Page Data
// ──────────────────────────────────────────────
function renderPage() {
  const p = getParams();

  // Bot name
  document.getElementById("botName").textContent = p.botName;
  document.title = `Invoice — ${p.botName}`;

  // Invoice ID
  document.getElementById("invoiceId").textContent = p.invoiceId;

  // Amount
  const amt = parseFloat(p.amount);
  const displayAmt = isNaN(amt) ? "0.00" : amt.toFixed(2);
  document.getElementById("amountDisplay").textContent = displayAmt;
  document.getElementById("amountStep").textContent    = `${displayAmt} USDT`;

  // Binance UID
  document.getElementById("binanceUID").textContent = p.uid;
}

// ──────────────────────────────────────────────
// Copy UID to Clipboard
// ──────────────────────────────────────────────
function copyUID() {
  const uid = document.getElementById("binanceUID").textContent;
  if (!uid || uid === "N/A") {
    showToast("No UID available", "error");
    return;
  }

  navigator.clipboard.writeText(uid).then(() => {
    const btn = document.getElementById("copyUidBtn");
    btn.classList.add("copied");
    btn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
      Copied!
    `;
    showToast("UID copied to clipboard", "success");

    setTimeout(() => {
      btn.classList.remove("copied");
      btn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
        Copy
      `;
    }, 2500);
  }).catch(() => {
    // Fallback for older browsers
    const el = document.createElement("textarea");
    el.value = uid;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    showToast("UID copied!", "success");
  });
}

// ──────────────────────────────────────────────
// Verify Payment
// ──────────────────────────────────────────────
function verifyPayment() {
  const txnId = document.getElementById("txnInput").value.trim();
  const btn   = document.querySelector(".verify-btn");

  if (!txnId) {
    showToast("Please enter your Transaction ID", "error");
    shakeInput();
    return;
  }

  // Loading state
  btn.classList.add("loading");
  btn.querySelector(".btn-text").textContent = "Verifying...";

  // Simulate verification (replace with real API call)
  setTimeout(() => {
    btn.classList.remove("loading");
    btn.classList.add("success");
    btn.querySelector(".btn-text").textContent = "Payment Verified!";
    showToast("Transaction submitted for verification", "success");

    // Optional: send TXN ID to your backend here
    // submitVerification(txnId);
  }, 1800);
}

/* ── Real API call example (uncomment & configure) ──
async function submitVerification(txnId) {
  const p = getParams();
  try {
    const res = await fetch("https://your-bot-api.com/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        invoice_id: p.invoiceId,
        txn_id:     txnId,
        amount:     p.amount,
        uid:        p.uid,
      })
    });
    const data = await res.json();
    if (data.success) {
      showToast("Payment confirmed!", "success");
    } else {
      showToast(data.message || "Verification failed", "error");
    }
  } catch (err) {
    showToast("Network error. Please try again.", "error");
  }
}
*/

// ──────────────────────────────────────────────
// Input shake animation on error
// ──────────────────────────────────────────────
function shakeInput() {
  const input = document.getElementById("txnInput");
  input.style.borderColor = "#F6465D";
  input.style.boxShadow   = "0 0 0 3px rgba(246,70,93,0.15)";
  input.animate([
    { transform: "translateX(0)" },
    { transform: "translateX(-6px)" },
    { transform: "translateX(6px)" },
    { transform: "translateX(-4px)" },
    { transform: "translateX(4px)" },
    { transform: "translateX(0)" },
  ], { duration: 350, easing: "ease-in-out" });

  setTimeout(() => {
    input.style.borderColor = "";
    input.style.boxShadow   = "";
  }, 1800);
}

// ──────────────────────────────────────────────
// Toast Notification
// ──────────────────────────────────────────────
let toastTimer = null;

function showToast(message, type = "success") {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.className = `toast ${type}`;

  if (toastTimer) clearTimeout(toastTimer);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => toast.classList.add("show"));
  });

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// ──────────────────────────────────────────────
// Init
// ──────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", renderPage);
      
