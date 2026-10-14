# agentic-doc

agentic-doc turns an HTML template into HTML or PDF files. It renders HTML
locally by default. Cloudflare Browser Rendering creates PDFs only with
`--live`.

## Install

```sh
npm install agentic-doc
```

## Quick start

```sh
cat > letter.html <<'HTML'
<h1>Hello {{name}}</h1>
HTML
printf '{"name":"Ada"}' > slots.json
npx agentic-doc render --template letter.html --slots slots.json --output letter.html
```

This is a dry run. It exits 0. It prints the filled HTML. It writes nothing.

## Vendors

| Brand | Environment key | Live command |
| --- | --- | --- |
| Cloudflare Browser Rendering | `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `npx agentic-doc render --template letter.html --slots slots.json --output letter.pdf --format pdf --live` |

The live PDF command calls Cloudflare Browser Rendering. Local HTML output
uses `--live` but does not call a vendor.

## Three uses

**CLI.** The default command is a dry run. Add `--live` to write HTML. Add
`--format pdf --live` to call Cloudflare Browser Rendering.

**Library.**

```ts
import { renderDocument } from "agentic-doc";

await renderDocument({
  template: "letter.html",
  slots: { name: "Ada" },
  output: "letter.html",
});
```

**MCP.** Run `npx agentic-doc mcp`. Call `render_document` with the same
request shape. `dryRun` defaults to `true`.
