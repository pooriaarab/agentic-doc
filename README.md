# agentic-doc

[![npm version](https://img.shields.io/npm/v/agentic-doc)](https://www.npmjs.com/package/agentic-doc)
[![npm downloads](https://img.shields.io/npm/dm/agentic-doc)](https://www.npmjs.com/package/agentic-doc)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue)](https://opensource.org/license/mit)

agentic-doc is an open-source HTML template renderer for Node.js developers and agents that writes local HTML or Cloudflare Browser Rendering PDFs.

## Install

```sh
npm install agentic-doc
```

Requires Node.js 18 or later. Includes TypeScript declarations and two runtime dependencies.

## Render your first document

```sh
cat > template.html <<'HTML'
<h1>Hello {{name}}</h1>
HTML
printf '{"name":"Ada"}' > slots.json
npx agentic-doc render --template template.html --slots slots.json --output result.html
npx agentic-doc render --template template.html --slots slots.json --output result.html --live
cat result.html
```

The first command previews JSON with `dryRun: true` and writes nothing.
The second writes local HTML. The final command prints `<h1>Hello Ada</h1>`.

## Features and coverage

- **Template slots:** Replace `{{name}}` placeholders with string values; missing slots raise errors.
- **Preview:** Inspect filled HTML before file writes or vendor calls.
- **HTML output:** Write a local file without credentials.
- **PDF output:** Send filled HTML to Cloudflare Browser Rendering.

| Output | Provider | Status |
| --- | --- | --- |
| HTML | Local filesystem | Implemented; local tests |
| PDF | Cloudflare Browser Rendering | Implemented; mocked HTTP test; live credentials unverified |

For PDFs, export `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`.
The package does not load `.env` files; load them before running the command.

```sh
npx agentic-doc render --template template.html --slots slots.json --output result.pdf --format pdf --live
```

Success returns JSON with `vendor: "cloudflare"` and writes `result.pdf`.

## Library and agent tools

```js
import { renderDocument } from "agentic-doc";

const result = await renderDocument({
  template: "template.html",
  slots: { name: "Ada" },
  output: "result.html",
});
console.log(result.html); // <h1>Hello Ada</h1>
```

Set `dryRun: false` to write files. PDF requests also require `live: true`.
The CLI supports `render`, `--help`, and `--version`.
Run `npx --package agentic-doc agentic-doc-mcp` for the Model Context Protocol (MCP) stdio server.
Its single tool is `render_document`, with the same request fields and dry-run default.

## Limits and status

Slot values are inserted verbatim; escape untrusted HTML yourself.
The PDF request has no built-in retry or explicit timeout.
The Worker source contains text-summary scaffolding, not a document-rendering service.
Version 0.1.1 has an API that may change. No managed rendering service is included.

## Links and license

[Package and releases](https://www.npmjs.com/package/agentic-doc) · [MIT license](https://opensource.org/license/mit)
