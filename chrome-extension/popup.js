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
    box.innerHTML = firms.map(f => `<div class="card">
      <div><a href="${f.atlas_url || "https://modevc.com/investors/"}" target="_blank">${f.name}</a> <span class="muted">(${f.check_size_min || "$1M"} - ${f.check_size_max || "$5M"})</span></div>
      <div class="muted">${f.headquarters || "SF Bay Area"} · ${f.partner_count || 1} partners · ${f.lead_preference || "can lead"}</div>
    </div>`).join("");
  } catch (e) {
    box.innerHTML = `<div class="card"><a href="https://modevc.com/investors/" target="_blank">Open Mode VC Investor Atlas</a></div>`;
  }
}
document.getElementById("go").addEventListener("click", search);
search();
