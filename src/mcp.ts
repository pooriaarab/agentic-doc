import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { renderDocument } from "./document.js";
import { DEFAULT_BRAND } from "./index.js";
const result=(value:unknown)=>({content:[{type:"text" as const,text:JSON.stringify(value)}]});
export function createMcpServer():McpServer{const s=new McpServer({name:DEFAULT_BRAND.command,version:DEFAULT_BRAND.version});s.registerTool("render_document",{description:"Fill one HTML template with slots. Dry run is the default.",inputSchema:{template:z.string(),slots:z.record(z.string()),output:z.string(),format:z.enum(["html","pdf"]).optional(),dryRun:z.boolean().optional(),live:z.boolean().optional()}},async input=>{try{return result(await renderDocument({...input,dryRun:input.dryRun??true}));}catch(e){return {...result({error:e instanceof Error?e.message:String(e)}),isError:true};}});return s;}
export async function startMcp():Promise<void>{const s=createMcpServer();await s.connect(new StdioServerTransport());}
