function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[ch]));
}

function formatCheckSize(firm) {
  const bands = firm.check_size_bands;
  if (bands?.lowest_band && bands?.highest_band) {
    return bands.lowest_band === bands.highest_band
      ? bands.lowest_band
      : `${bands.lowest_band} – ${bands.highest_band}`;
  }
  return "Check size unlisted";
}

async function search() {
  const stage = document.getElementById("stage").value;
  const q = document.getElementById("q").value.trim();
  const box = document.getElementById("results");
  box.textContent = "Searching 3,651 firms...";
  try {
    const u = new URL("https://modevc.com/api/v1/investors/recommend");
    u.searchParams.set("stage", stage);
    if (q) u.searchParams.set("query", q);
    u.searchParams.set("limit", "4");
    const r = await fetch(u.toString());
    const d = await r.json();
    const firms = d.firms || [];
    if (!firms.length) {
      box.innerHTML = `<div class="card"><a href="https://modevc.com/investors/" target="_blank">No matching firms — browse all 3,651 VCs</a></div>`;
      return;
    }
    box.innerHTML = firms.map(f => {
      const url = f.atlas_url || (f.slug ? `https://modevc.com/investors/firm/${encodeURIComponent(f.slug)}/` : "https://modevc.com/investors/");
      return `<div class="card">
        <div><a href="${escapeHtml(url)}" target="_blank">${escapeHtml(f.name)}</a> <span class="muted">(${escapeHtml(formatCheckSize(f))})</span></div>
        <div class="muted">${escapeHtml(f.headquarters || "Location unlisted")} · ${escapeHtml(f.partner_count ?? 1)} partners · ${escapeHtml(f.lead_preference || "stage match")}</div>
      </div>`;
    }).join("");
  } catch (e) {
    box.innerHTML = `<div class="card"><a href="https://modevc.com/investors/" target="_blank">Open Mode VC Investor Atlas</a></div>`;
  }
}
document.getElementById("go").addEventListener("click", search);
search();
