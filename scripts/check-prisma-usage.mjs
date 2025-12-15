import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const appDir = path.join(process.cwd(), "src", "app");
const violations = [];
const targetExtensions = new Set([".ts", ".tsx"]);

const walk = (currentPath) => {
  const entries = readdirSync(currentPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(currentPath, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath);
      continue;
    }
    if (!targetExtensions.has(path.extname(entry.name))) {
      continue;
    }
    const content = readFileSync(fullPath, "utf8");
    if (content.includes("prisma.")) {
      violations.push(path.relative(process.cwd(), fullPath));
    }
  }
};

try {
  const stats = statSync(appDir);
  if (stats.isDirectory()) {
    walk(appDir);
  }
} catch {
  // Ignore missing directory (should not happen in this project)
}

if (violations.length > 0) {
  console.error(
    [
      "Direct prisma access detected in src/app/.",
      "Use repositories from src/lib/repositories au lieu d'appeler prisma.*.",
      "Files en infraction:",
      ...violations.map((file) => ` - ${file}`),
    ].join("\n"),
  );
  process.exit(1);
}
