import { readFile, writeFile } from "node:fs/promises";

export type OutputFormat = "html" | "pdf";

export interface DocumentRequest {
  template: string;
  slots: Record<string, string>;
  output: string;
  format?: OutputFormat;
  dryRun?: boolean;
  live?: boolean;
}

export interface DocumentResult {
  dryRun: boolean;
  format: OutputFormat;
  output: string;
  html: string;
  vendor?: "cloudflare";
}

export interface CloudflareBrowserRenderingOptions {
  accountId: string;
  apiToken: string;
  fetchFn?: typeof fetch;
}

export class VendorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VendorError";
  }
}

export function fillTemplate(
  template: string,
  slots: Record<string, string>,
): string {
  return template.replace(
    /{{\s*([A-Za-z][\w.-]*)\s*}}/g,
    (_match, key: string) => {
      if (!(key in slots)) throw new Error(`missing slot "${key}"`);
      return slots[key];
    },
  );
}

export async function renderPdfWithCloudflare(
  html: string,
  options: CloudflareBrowserRenderingOptions,
): Promise<Uint8Array> {
  const response = await (options.fetchFn ?? fetch)(
    `https://api.cloudflare.com/client/v4/accounts/${options.accountId}/browser-rendering/pdf`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${options.apiToken}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ html }),
    },
  );

  if (!response.ok) {
    throw new VendorError(
      `Cloudflare Browser Rendering failed: ${response.status} ${await response.text()}`,
    );
  }

  return new Uint8Array(await response.arrayBuffer());
}

export async function renderDocument(
  request: DocumentRequest,
): Promise<DocumentResult> {
  const format = request.format ?? "html";
  const html = fillTemplate(
    await readFile(request.template, "utf8"),
    request.slots,
  );

  if (request.dryRun ?? true) {
    return { dryRun: true, format, output: request.output, html };
  }

  if (format === "html") {
    await writeFile(request.output, html);
    return { dryRun: false, format, output: request.output, html };
  }

  if (!request.live) {
    throw new VendorError(
      "PDF output needs --live to use Cloudflare Browser Rendering",
    );
  }

  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  if (!apiToken || !accountId) {
    throw new VendorError(
      "PDF output with --live needs CLOUDFLARE_API_TOKEN and CLOUDFLARE_ACCOUNT_ID",
    );
  }

  await writeFile(
    request.output,
    await renderPdfWithCloudflare(html, { apiToken, accountId }),
  );
  return { dryRun: false, format, output: request.output, html, vendor: "cloudflare" };
}
