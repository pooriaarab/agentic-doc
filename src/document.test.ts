import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, test } from "vitest";
import {
  fillTemplate,
  renderDocument,
  renderPdfWithCloudflare,
} from "./document.js";

describe("document", () => {
  test("fills slots", () => {
    expect(fillTemplate("Hi {{name}}", { name: "Ada" })).toBe("Hi Ada");
  });

  test("dry run writes nothing", async () => {
    const directory = await mkdtemp(join(tmpdir(), "doc-"));
    const template = join(directory, "template.html");
    const output = join(directory, "output.html");
    await writeFile(template, "<p>{{name}}</p>");

    const result = await renderDocument({
      template,
      slots: { name: "Ada" },
      output,
    });

    expect(result.dryRun).toBe(true);
    expect(result.html).toContain("Ada");
    await expect(readFile(output, "utf8")).rejects.toMatchObject({ code: "ENOENT" });
  });

  test("live HTML writes locally", async () => {
    const directory = await mkdtemp(join(tmpdir(), "doc-"));
    const template = join(directory, "template.html");
    const output = join(directory, "output.html");
    await writeFile(template, "<p>{{name}}</p>");

    await renderDocument({
      template,
      slots: { name: "Ada" },
      output,
      dryRun: false,
    });

    expect(await readFile(output, "utf8")).toContain("Ada");
  });

  test("Cloudflare adapter calls the Browser Rendering HTTPS host", async () => {
    const calls: Array<{ input: RequestInfo | URL; init?: RequestInit }> = [];
    const fetchFn: typeof fetch = async (input, init) => {
      calls.push({ input, init });
      return new Response(new Uint8Array([1, 2, 3]), { status: 200 });
    };

    const pdf = await renderPdfWithCloudflare("<h1>Ada</h1>", {
      accountId: "test-account",
      apiToken: "test-token",
      fetchFn,
    });

    expect(pdf).toEqual(new Uint8Array([1, 2, 3]));
    expect(String(calls[0].input)).toBe(
      "https://api.cloudflare.com/client/v4/accounts/test-account/browser-rendering/pdf",
    );
    expect(calls[0].init?.method).toBe("POST");
  });
});
