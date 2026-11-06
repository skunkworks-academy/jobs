/* Approved vacancies only: no scraping, fabricated jobs or auto-applications. */
const feed = "public/verified-vacancies.json";
const list = document.getElementById("verifiedVacancies");
const summary = document.getElementById("verifiedVacanciesStatus");

function validHttps(link) {
  try { const value = new URL(link); return value.protocol === "https:" && !value.username && !value.password && value.hostname.includes("."); }
  catch { return false; }
}
function isCurrent(item) {
  if (!item || typeof item !== "object") return false;
  const reviewed = Date.parse(item.reviewedAt + "T00:00:00Z");
  const expires = Date.parse(item.expiresAt + "T23:59:59Z");
  const now = Date.now();
  return typeof item.id === "string" && typeof item.title === "string" && typeof item.employer === "string"
    && typeof item.location === "string" && typeof item.reviewedBy === "string"
    && Number.isFinite(reviewed) && Number.isFinite(expires)
    && reviewed <= now && now - reviewed <= 30 * 86400000 && expires >= now
    && validHttps(item.applyUrl) && validHttps(item.sourceUrl);
}
function element(tag, text, className) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
}
async function loadVacancies() {
  if (!list || !summary) return;
  try {
    const response = await fetch(feed, { cache: "no-store" });
    if (!response.ok) throw new Error("Feed request failed");
    const data = await response.json();
    if (!Array.isArray(data)) throw new Error("Invalid vacancy feed");
    const entries = data.filter(isCurrent).slice(0, 24);
    summary.textContent = entries.length
      ? entries.length + " recently reviewed opportunit" + (entries.length === 1 ? "y" : "ies") + ". Verify the vacancy again on the employer's site before applying."
      : "No current verified vacancies have been published yet. You can still browse the job-platform directory below.";
    list.replaceChildren();
    for (const item of entries) {
      const card = element("article", "", "vacancy-card");
      const title = element("h3", item.title);
      const detail = element("p", item.employer + " · " + item.location + (item.workMode ? " · " + item.workMode : ""));
      const reviewed = element("p", "Source checked " + item.reviewedAt + ". Listed until " + item.expiresAt + ".", "vacancy-meta");
      const apply = element("a", "View employer vacancy ↗", "button");
      apply.href = item.applyUrl; apply.target = "_blank"; apply.rel = "noopener noreferrer";
      card.append(title, detail, reviewed, apply);
      list.appendChild(card);
    }
  } catch {
    summary.textContent = "Verified vacancies are temporarily unavailable. Browse the job-platform directory below.";
    list.replaceChildren();
  }
}
void loadVacancies();
