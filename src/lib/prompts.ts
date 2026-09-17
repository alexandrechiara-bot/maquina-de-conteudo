import fs from "fs";
import path from "path";

const PROMPTS_DIR = path.join(process.cwd(), "src", "prompts");

export type PromptTemplateId =
  | "carrossel-educacional"
  | "carrossel-mitos"
  | "card-citacao"
  | "card-dado"
  | "reels-educacional"
  | "reels-mito";

interface PromptTemplate {
  id: string;
  frontmatter: Record<string, string | number>;
  systemPrompt: string;
}

function parseFrontmatter(raw: string): {
  frontmatter: Record<string, string | number>;
  body: string;
} {
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: raw };

  const [, rawFrontmatter, body] = match;
  const frontmatter: Record<string, string | number> = {};

  for (const line of rawFrontmatter.split("\n")) {
    const [key, ...rest] = line.split(":");
    if (!key || rest.length === 0) continue;
    const value = rest.join(":").trim();
    frontmatter[key.trim()] = /^\d+$/.test(value) ? Number(value) : value;
  }

  return { frontmatter, body: body.trim() };
}

export function loadPromptTemplate(id: PromptTemplateId): PromptTemplate {
  const filePath = path.join(PROMPTS_DIR, `${id}.md`);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { frontmatter, body } = parseFrontmatter(raw);

  return { id, frontmatter, systemPrompt: body };
}
