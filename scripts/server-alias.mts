// Lets a script load the app's server code, whose imports start "@/" (tsconfig's paths), as Next does: "@/lib/wall"
// is the file lib/wall.ts at the repository root. Loaded with --import before the script.

import { register } from "node:module";
import { pathToFileURL } from "node:url";

const root = pathToFileURL(`${process.cwd()}/`).href;
const hooks = `
import { existsSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
export async function resolve(specifier, context, next) {
  if (specifier.startsWith("@/")) {
    for (const ending of ["", ".ts", ".tsx", "/index.ts"]) {
      const url = new URL(specifier.slice(2) + ending, ${JSON.stringify(root)});
      const path = fileURLToPath(url);
      if (existsSync(path) && statSync(path).isFile()) return next(url.href, context);
    }
  }
  return next(specifier, context);
}`;
register(`data:text/javascript,${encodeURIComponent(hooks)}`);
