# agentic-doc

Fill one HTML template with slots. Write HTML locally, or a PDF with
Cloudflare Browser Rendering when `--live` is set.

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

This is a dry run. It prints the filled document and writes nothing.

## Three uses

**CLI.** Add `--live` to write HTML. Use `--format pdf --live` to call
Cloudflare Browser Rendering. PDF needs `CLOUDFLARE_API_TOKEN` and
`CLOUDFLARE_ACCOUNT_ID`.

**Library.**

```ts
import { renderDocument } from "agentic-doc";
await renderDocument({ template: "letter.html", slots: { name: "Ada" }, output: "letter.html" });
```

**MCP.** Run `npx agentic-doc mcp` and call `render_document` with the
same request shape.
