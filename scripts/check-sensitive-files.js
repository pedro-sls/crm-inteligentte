const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const ignoredDirs = new Set([
  ".git",
  ".next",
  ".vercel",
  "coverage",
  "dist",
  "node_modules",
  "out",
  "next-scaffold",
]);

const blockedFileNames = new Set([".env", ".env.local", ".env.development", ".env.production"]);
const secretPatterns = [
  { name: "OpenAI API key", pattern: /sk-[A-Za-z0-9_-]{20,}/ },
  { name: "GitHub token", pattern: /gh[pousr]_[A-Za-z0-9_]{20,}/ },
  { name: "Private key", pattern: /-----BEGIN (RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/ },
  {
    name: "Concrete DATABASE_URL",
    pattern: /DATABASE_URL\s*=\s*["']?postgres(?:ql)?:\/\/(?!USER:PASSWORD@HOST)/i,
  },
];

const findings = [];

function walk(currentPath) {
  const entries = fs.readdirSync(currentPath, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = path.join(currentPath, entry.name);
    const relativePath = path.relative(root, absolutePath);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        walk(absolutePath);
      }
      continue;
    }

    if (blockedFileNames.has(entry.name)) {
      findings.push(`${relativePath}: arquivo sensivel nao deve ser versionado`);
      continue;
    }

    if (entry.name.endsWith(".pdf") || entry.name.endsWith(".png") || entry.name.endsWith(".ico")) {
      continue;
    }

    const content = fs.readFileSync(absolutePath, "utf8");

    for (const { name, pattern } of secretPatterns) {
      if (pattern.test(content)) {
        findings.push(`${relativePath}: possivel segredo detectado (${name})`);
      }
    }
  }
}

walk(root);

if (findings.length > 0) {
  console.error("Verificacao de segredos falhou:");
  for (const finding of findings) {
    console.error(`- ${finding}`);
  }
  process.exit(1);
}

console.log("Nenhum segredo obvio encontrado nos arquivos do projeto.");
