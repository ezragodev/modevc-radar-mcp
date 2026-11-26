# Mode VC MCP Server (`com.modevc/radar`)

Free [Model Context Protocol](https://modelcontextprotocol.io) server from **[Mode VC](https://modevc.com)** (`$25K–$100K` pre-seed and seed checks, San Francisco Bay Area).

Provides AI agents with:

- **Chart of the Day archive (50+ charts)**: empirical AI model, adoption, developer-package, and pricing charts with underlying data tables and primary cited sources (one new chart per day);
- **Investor Atlas (3,651 VC firms and 13,040 partners)**: directory compiled from public SEC EDGAR Form D filings and firm disclosures;
- **19 founder, startup, legal, and AI pricing calculators** matching the web tools at [modevc.com/tools](https://modevc.com/tools);
- **SEC Form D, Form ADV, and newly closed VC fund lookups** (`get_new_raises`, `get_firm_filings`, `get_daily_ai_raises`, `get_newly_closed_vc_funds`; explicitly reports `available: false` if any dataset is unavailable);
- **Venture Common App & 589 verified public VC pitch intake forms** (`match_vc_intake_forms`, plus consent-gated `submit_and_match_common_app` and `apply_to_mode_vc`);
- **VC Rejection Pre-Flight & Decoder** (`search_vc_pass_reasons`, `simulate_vc_response`, `handle_vc_rejection`, and consent-gated `contribute_vc_rejection`);
- **Rule-based distribution moat score** (`get_distribution_moat_score`).

Every tool result includes `provenance` (`as_of`, `as_of_basis`, and `sources`), and records carry `as_of` and `source_urls`. All read-only tools require zero authentication; write tools require explicit `consent: true`.

- **Homepage**: [https://modevc.com](https://modevc.com)
- **MCP Playground & Docs**: [https://modevc.com/mcp](https://modevc.com/mcp)
- **Charts**: [https://modevc.com/charts](https://modevc.com/charts)
- **Investor Atlas**: [https://modevc.com/investors](https://modevc.com/investors)
- **Founder Tools**: [https://modevc.com/tools](https://modevc.com/tools)
- **Remote Streamable-HTTP MCP Endpoint**: `https://modevc.com/api/mcp`
- **Official MCP Registry ID**: `com.modevc/radar`

---

## Quick Connect

### Option 1: Zero-Install Remote MCP (Streamable HTTP)

Add `modevc-radar` to your `claude_desktop_config.json`, `.cursor/mcp.json`, or any Streamable-HTTP MCP client:

```json
{
  "mcpServers": {
    "modevc-radar": {
      "url": "https://modevc.com/api/mcp"
    }
  }
}
```

Or register directly in Claude Code:

```bash
claude mcp add --transport http modevc-radar https://modevc.com/api/mcp
```

### Option 2: Stdio Bridge via `npx`

For MCP clients that only support local stdio commands:

```json
{
  "mcpServers": {
    "modevc-radar": {
      "command": "npx",
      "args": ["-y", "modevc-radar-mcp"]
    }
  }
}
```

Optional CLI flags: `--profile <radar|investors|charts|calculators|sec-filings|benchmarks|llm-economics>` or `--url <endpoint>`.

---

## Available Tools (37)

### Research (7)

| Tool | What it does |
| :--- | :--- |
| `search_charts` | Keyword search over the Chart of the Day archive (title, claim, takeaway, keywords) |
| `get_chart_data` | One chart: full published data table, claim, takeaway, note, and cited sources |
| `get_venture_chart_of_the_day` | Most recent charts from the Chart of the Day archive, newest first |
| `search_investors` | Search Investor Atlas firms by firm or partner name, sector, entry stage, and location |
| `get_investor_details` | One firm: headquarters, links, latest fund, entry stages, check size bands, sectors, up to 12 partners, and indexed pitch intake URL |
| `get_distribution_moat_score` | Rule-based 1 to 5 distribution defensibility score from listed channels and data/network flags |
| `get_mode_vc_thesis_and_criteria` | Mode VC's published investment thesis: $25,000–$100,000 checks, SF Bay Area focus, pre-seed to seed |

The atlas does not hold portfolio companies or private fund performance.

### Founder, Startup & AI Pricing Calculators (19)

Deterministic math matching the browser tools at [modevc.com/tools](https://modevc.com/tools). Illustrative models, not legal, tax, or investment advice.

| Tool | Web tool |
| :--- | :--- |
| `calc_safe_dilution` | [SAFE conversion and dilution](https://modevc.com/tools/safe-calculator) |
| `calc_83b_qsbs_delaware` | [83(b), QSBS and Delaware tax](https://modevc.com/tools/83b-qsbs-calculator) |
| `calc_term_sheet_waterfall` | [Term sheet exit waterfall](https://modevc.com/tools/term-sheet-waterfall) |
| `calc_burn_multiple_runway` | [Burn multiple and runway](https://modevc.com/tools/burn-multiple-runway) |
| `calc_saas_metrics` | [SaaS metrics](https://modevc.com/tools/saas-metrics-calculator) |
| `calc_llm_inference_cost` | [LLM inference cost and gross margin](https://modevc.com/tools/llm-inference-calculator) |
| `calc_fundraising_readiness` | [Fundraising readiness](https://modevc.com/tools/fundraising-readiness) |
| `calc_cofounder_equity` | [Cofounder equity split and ARR multiple](https://modevc.com/tools/cofounder-equity-valuation) |
| `calc_shopify_fundraising` | [Shopify Capital RBF vs Seed SAFE](https://modevc.com/tools/shopify-fundraising-calculator) |
| `calc_yc_safe_pro_rata` | [YC SAFE pro rata and MFN side letter](https://modevc.com/tools/yc-safe-pro-rata-side-letter-calculator) |
| `calc_accelerator_deal_comparison` | [YC vs Techstars vs Speedrun vs Mode VC](https://modevc.com/tools/yc-accelerator-deal-comparator) |
| `calc_delaware_incorporation_cost` | [Delaware C-Corp incorporation cost](https://modevc.com/tools/delaware-c-corp-incorporation-cost-calculator) |
| `calc_founder_vesting_acceleration` | [Founder vesting and acceleration](https://modevc.com/tools/founder-vesting-acceleration-calculator) |
| `calc_startup_legal_diligence` | [Startup legal and IP diligence scorer](https://modevc.com/tools/startup-legal-diligence-ip-calculator) |
| `calc_ai_agent_pricing_margin` | [AI agent outcome pricing and margin](https://modevc.com/tools/ai-agent-pricing-gross-margin-calculator) |
| `calc_claude_vs_chatgpt_cost` | [Claude vs ChatGPT and OpenAI pricing](https://modevc.com/tools/claude-vs-chatgpt-pricing-calculator) |
| `calc_cagr_irr_xirr` | [CAGR, IRR and XIRR investment return](https://modevc.com/tools/cagr-irr-xirr-calculator) |
| `calc_paypal_stripe_fees` | [PayPal fee and Stripe comparison](https://modevc.com/tools/paypal-fee-calculator) |
| `calc_capital_gains_qsbs` | [2026 capital gains tax and QSBS](https://modevc.com/tools/capital-gains-and-qsbs-tax-calculator) |

### SEC Form D & Fund Closes (4)

| Tool | What it does |
| :--- | :--- |
| `get_new_raises` | Recent SEC Form D filings by venture funds and technology companies with EDGAR links (notice of offering, not proof of close) |
| `get_firm_filings` | Form ADV advisers and Form D filings matched to an Investor Atlas firm (`firm` parameter) |
| `get_daily_ai_raises` | Daily AI raises from SEC Form D filings scored 1 to 5 on the Distribution Moat rubric |
| `get_newly_closed_vc_funds` | Recently closed venture capital funds verified from SEC Form D filings and primary sources |

### Venture Common App & Pitch Intake (3)

| Tool | What it does |
| :--- | :--- |
| `match_vc_intake_forms` | Read-only search over 589 indexed public VC pitch forms with prefill URLs (preview up to 5 forms) |
| `submit_and_match_common_app` | Consent-gated (`consent: true`): submits a Venture Common App packet to Mode VC and unlocks up to 50 matched VC intake forms |
| `apply_to_mode_vc` | Consent-gated (`consent: true`): submits a founder pitch directly to Mode VC |

### VC Rejection Pre-Flight & Decoder (4)

| Tool | What it does |
| :--- | :--- |
| `search_vc_pass_reasons` | Search 46 source-verified VC pass reasons, translations, and actionable fixes |
| `simulate_vc_response` | Simulate likely VC feedback against founder metrics and an optional Investor Atlas firm |
| `handle_vc_rejection` | In-memory decoder for VC pass notes returning likely underlying classifications, reply template, and revisit timing |
| `contribute_vc_rejection` | Consent-gated (`consent: true`): records anonymized pass outcome metadata (no PII or raw email text) |

---

## Available Context Resources (5)

- `modevc://skills/modevc/SKILL.md` — workflow guide for pairing Mode VC tools
- `modevc://charts/index.json` — Chart of the Day archive
- `modevc://investors/atlas.json` — first 50 Investor Atlas firms (use `search_investors` for all 3,651)
- `modevc://investors/intake-forms.json` — verified public VC pitch intake forms index and prefill map
- `modevc://thesis.md` — Mode VC investment thesis and criteria (JSON)

## Available Prompts (3)

- `venture_common_app` — collect startup fields once, preview matched VC pitch forms, and optionally submit with consent
- `fundraising_diligence_check` — audit distribution moat, SAFE dilution, burn runway, and Mode VC fit
- `vc_firm_and_sec_brief` — build a firm brief combining Investor Atlas profile, SEC filings, and public pitch form URL

---

## Multi-Ecosystem Specs & Extensions

- **OpenAPI 3.1.0 Spec**: [`openapi.json`](./openapi.json) / [https://modevc.com/openapi.json](https://modevc.com/openapi.json)
- **MCP Registry Manifest**: [`server.json`](./server.json)
- **Chrome Extension (Manifest V3)**: [`chrome-extension/`](./chrome-extension)
- **Claude Skill**: [`claude-skill/SKILL.md`](./claude-skill/SKILL.md)
- **Gemini Extension**: [`gemini-extension/gemini-extension.json`](./gemini-extension/gemini-extension.json)
- **Manus Plugin**: [`manus-plugin/manus-plugin.json`](./manus-plugin/manus-plugin.json)
- **LobeChat Manifest**: [`lobechat/manifest.json`](./lobechat/manifest.json)
- **Shopify App Config**: [`shopify-app/shopify.app.toml`](./shopify-app/shopify.app.toml)

---

## Development & Tests

```bash
node --check bin/cli.mjs
node --test
```

## License

MIT. Copyright (c) 2026 Mode VC Contributors. See [`LICENSE`](./LICENSE).
