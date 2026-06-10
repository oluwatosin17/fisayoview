/**
 * Cross-platform build wrapper — sets NEXT_TEST_WASM_DIR to an absolute path
 * before invoking `next build --webpack`. This avoids shell `$(pwd)` expansion
 * issues in Vercel's build environment.
 */
import { execSync } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const wasmDir = path.join(projectRoot, "node_modules", "@next", "swc-wasm-nodejs");

console.log(`[build] NEXT_TEST_WASM_DIR=${wasmDir}`);

execSync(`next build --webpack`, {
  stdio: "inherit",
  cwd: projectRoot,
  env: {
    ...process.env,
    NEXT_TEST_WASM_DIR: wasmDir,
  },
});
