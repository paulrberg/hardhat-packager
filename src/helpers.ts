import fsExtra from "fs-extra";
import { resolve } from "path";

/**
 * Recurses over all the bindings factories generated by TypeChain on a depth-first basis.
 * Re-evaluates the the status of the directories after performing the search to check whether
 * the directory has become empty in the meantime.
 */
export async function* getEmptyDirectoriesRecursively(directory: string): AsyncIterable<string> {
  const initialEntries = await fsExtra.readdir(directory, { withFileTypes: true });
  for (const initialEntry of initialEntries) {
    const result = resolve(directory, initialEntry.name);
    if (initialEntry.isDirectory()) {
      yield* getEmptyDirectoriesRecursively(result);
    }
  }
  // Needed to cover the case when a file is nested in two or more directories.
  const updatedEntries = await fsExtra.readdir(directory, { withFileTypes: true });
  if (updatedEntries.length == 0) {
    yield directory;
  }
}

/**
 * Recurses over all the bindings generated by TypeChain, but excludes the "factories" directory.
 */
export async function* getFilesRecursively(directory: string): AsyncIterable<string> {
  const entries = await fsExtra.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const result = resolve(directory, entry.name);
    if (entry.isDirectory()) {
      // Do not recurse into the "factories" directory
      if (entry.name === "factories") {
        continue;
      }
      yield* getFilesRecursively(result);
    } else {
      yield result;
    }
  }
}
