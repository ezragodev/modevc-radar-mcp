# Mode VC MCP Server (`com.modevc/radar`)

Free, read-only [Model Context Protocol](https://modelcontextprotocol.io) server from **[Mode VC](https://modevc.com)**. It gives AI agents access to:

- the **Chart of the Day archive**: AI model, adoption, developer-package and pricing charts with the data table and cited sources (39 charts as of 2026-10-20, one new chart a day);
- the **Investor Atlas**: a directory of **3,650 venture capital firms and 13,039 partners** compiled from public information (as of 2026-10-15);
- **8 founder calculators** that give the same numbers as the web tools at [modevc.com/tools](https://modevc.com/tools);
- a rule-based **distribution moat score**;
- **SEC Form D and Form ADV lookups** that answer "dataset not available yet" until the data is loaded on the server.

Every tool result includes `provenance` (`as_of`, what the date means, and source URLs), and each record carries its own `as_of` and `source_urls`.

- **Homepage**: [https://modevc.com](https://modevc.com)
- **Charts**: [https://modevc.com/charts](https://modevc.com/charts)
- **Investor Atlas**: [https://modevc.com/investors](https://modevc.com/investors)
- **Founder tools**: [https://modevc.com/tools](https://modevc.com/tools)
- **Remote Streamable-HTTP MCP endpoint**: `https://modevc.com/api/mcp`
- **Official MCP Registry ID**: `com.modevc/radar`

---

## Quick Connect (Zero-Install Remote MCP)

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

---

## Available Tools (18)

### Research (7)

| Tool | What it does |
| :--- | :--- |
| `search_charts` | Keyword search over the Chart of the Day archive (title, claim, takeaway, keywords) |
| `get_chart_data` | One chart: the data table as published, claim, takeaway, note and cited sources |
| `get_venture_chart_of_the_day` | The most recent charts, newest first |
| `search_investors` | Search atlas firms by firm or partner name, sector, entry stage and location |
| `get_investor_details` | One firm: headquarters, links, latest fund as listed, entry stages, check size bands, sectors, up to 12 partner names |
| `get_distribution_moat_score` | Rule-based 1 to 5 score from the acquisition channels you list and a proprietary data flag. A discussion aid, not a valuation or an investment decision |
| `get_mode_vc_thesis_and_criteria` | Mode VC's published thesis: $1M to $5M tickets, Bay Area focus, pre-seed to Series A |

The atlas does not hold portfolio companies, fund performance or investment theses.

### Founder calculators (8)

Same math as the web page, checked by tests that run the page's own script for the same inputs. Illustrative models, not legal, tax or investment advice.

| Tool | Web tool |
| :--- | :--- |
| `calc_safe_dilution` | [SAFE and dilution](https://modevc.com/tools/safe-calculator) |
| `calc_83b_qsbs_delaware` | [83(b), QSBS and Delaware tax](https://modevc.com/tools/83b-qsbs-calculator) |
| `calc_term_sheet_waterfall` | [Term sheet waterfall](https://modevc.com/tools/term-sheet-waterfall) |
| `calc_burn_multiple_runway` | [Burn multiple and runway](https://modevc.com/tools/burn-multiple-runway) |
| `calc_saas_metrics` | [SaaS metrics](https://modevc.com/tools/saas-metrics-calculator) |
| `calc_llm_inference_cost` | [LLM inference cost](https://modevc.com/tools/llm-inference-calculator) |
| `calc_fundraising_readiness` | [Fundraising readiness](https://modevc.com/tools/fundraising-readiness) |
| `calc_cofounder_equity` | [Cofounder equity](https://modevc.com/tools/cofounder-equity-valuation) |

### SEC Form D & Dealflow Lookups (3)

| Tool | What it does |
| :--- | :--- |
| `get_new_raises` | Recent SEC Form D filings by venture funds and technology companies, with the EDGAR link per filing. A Form D is a notice of an offering, not proof a round closed |
| `get_firm_filings` | Form ADV advisers and Form D filings linked to an atlas firm. Only `confirmed` matches are verified; weaker matches are hidden unless asked for |
| `get_daily_ai_raises` | Daily AI raises from SEC Form D filings, scored 1 to 5 with Mode VC's Distribution Moat rubric, with evidence strength, levers, and verified partner matches |

Both return "dataset not available yet" until the data files are loaded on the server.

---

## Available Context Resources (3)

- `modevc://charts/index.json`: the Chart of the Day archive
- `modevc://investors/atlas.json`: the first 50 atlas firms (use `search_investors` for the rest)
- `modevc://thesis.md`: Mode VC's thesis and criteria, as JSON

---

## License

MIT. Maintained by [Mode VC](https://modevc.com).


## Multi-Ecosystem Plugins & Extensions
- **Unified Ecosystem Hub**: [https://modevc.com/extensions/](https://modevc.com/extensions/)
- **Shopify Merchant Fundraising Calculator**: [https://modevc.com/tools/shopify-fundraising-calculator](https://modevc.com/tools/shopify-fundraising-calculator)
- **OpenAPI 3.1.0 Spec (ChatGPT Actions, Gemini, Manus, Dify, Coze)**: [https://modevc.com/openapi.json](https://modevc.com/openapi.json)
- **Chrome Extension (Manifest V3)**: [https://modevc.com/extensions/modevc-chrome-extension.zip](https://modevc.com/extensions/modevc-chrome-extension.zip)
- **Claude Code & Manus SKILL.md**: [https://modevc.com/extensions/claude/SKILL.md](https://modevc.com/extensions/claude/SKILL.md)
- **Mode VC Investor Profile ($1M-$5M Checks)**: [https://modevc.com/investors/firm/mode-vc/](https://modevc.com/investors/firm/mode-vc/)
