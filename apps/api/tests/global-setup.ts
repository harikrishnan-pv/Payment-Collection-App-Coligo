import { execFileSync } from "node:child_process";
import path from "node:path";

/**
 * Migrate + seed a clean database before the test run.
 * Uses the same scripts a developer runs locally (pnpm db:reset equivalents).
 */
export function setup(): void {
  const pkgRoot = path.resolve(__dirname, "..");
  execFileSync("pnpm", ["exec", "tsx", "src/db/migrate.ts"], { cwd: pkgRoot, stdio: "inherit" });
  execFileSync("pnpm", ["exec", "tsx", "src/db/seed.ts"], { cwd: pkgRoot, stdio: "inherit" });
}
