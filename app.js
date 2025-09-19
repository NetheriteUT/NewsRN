import dayjs from "dayjs";

const form = document.getElementById("waitlist-form");
const emailInput = document.getElementById("email");
const companyHp = document.getElementById("company");
const statusEl = document.getElementById("formStatus");
const submitBtn = document.getElementById("submitBtn");
const yearEl = document.getElementById("year");
yearEl.textContent = new Date().getFullYear();

const WEBHOOK_URL = "https://discord.com/api/webhooks/1418412296589283520/pgA8p83Ea-u5BTgxQ7ujj9AL6wKazFLueUR9TCRg3sa4zrbATgHI0J9Q4Ov2DFmZxfYN";

function isValidEmail(v) {
  // Simple but effective email validation
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

function setStatus(msg, ok = false) {
  statusEl.textContent = msg;
  statusEl.style.color = ok ? "green" : "#b00020";
}

async function sendToDiscord(email) {
  const ts = dayjs().toISOString();
  const ua = navigator.userAgent || "unknown";
  const content = `New beta waitlist signup`;
  const payload = {
    username: "NewsRN Waitlist",
    content,
    embeds: [
      {
        title: "Beta Signup",
        color: 0x111111,
        fields: [
          { name: "Email", value: email, inline: false },
          { name: "User Agent", value: ua.slice(0, 256), inline: false }
        ],
        timestamp: ts,
        footer: { text: "NewsRN • Waitlist" }
      }
    ]
  };

  const res = await fetch(WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    mode: "cors",
    keepalive: true
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Webhook error ${res.status}: ${text || res.statusText}`);
  }
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  setStatus("");

  const email = emailInput.value.trim();

  if (companyHp.value) {
    // Bot detected
    setStatus("Submission failed. Please try again.", false);
    return;
  }
  if (!email || !isValidEmail(email)) {
    setStatus("Please enter a valid email address.", false);
    emailInput.focus();
    return;
  }

  submitBtn.disabled = true;
  setStatus("Submitting…");

  try {
    await sendToDiscord(email);
    setStatus("Thanks! You're on the waitlist. We'll email selected beta testers.", true);
    form.reset();
    emailInput.blur();
  } catch (err) {
    console.error(err);
    // Handle potential rate limits or network issues
    setStatus("Could not submit right now. Please try again in a moment.", false);
  } finally {
    submitBtn.disabled = false;
  }
});

// Optional: live validation feedback
emailInput.addEventListener("input", () => {
  if (!emailInput.value) {
    setStatus("");
    return;
  }
  setStatus(isValidEmail(emailInput.value) ? "" : "That email doesn’t look right.", false);
});

