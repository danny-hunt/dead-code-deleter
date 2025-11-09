#!/usr/bin/env node

/**
 * Static analysis script to extract all functions from exampleapp
 * and track contributors using git blame
 */

import * as ts from "typescript";
import * as fs from "fs/promises";
import * as path from "path";
import { execSync } from "child_process";
import { FunctionMetadata, FunctionMetadataFile, Contributor } from "./types";

const EXAMPLEAPP_DIR = path.join(__dirname, "..", "exampleapp");
const OUTPUT_FILE = path.join(EXAMPLEAPP_DIR, "function-metadata.json");
const PROJECT_ID = "example-app";

// Exclusions matching Babel plugin
const EXCLUDED_PATTERNS = [
  /node_modules/,
  /\.next/,
  /dist/,
  /instrument/,
  /@dead-code-deleter/,
];

/**
 * Check if a file path should be excluded
 */
function shouldExclude(filePath: string): boolean {
  const normalizedPath = filePath.replace(/\\/g, "/");
  return EXCLUDED_PATTERNS.some((pattern) => pattern.test(normalizedPath));
}

/**
 * Check if a file defines __trackFn (to avoid self-instrumentation)
 */
async function definesTrackFn(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    return (
      content.includes("__trackFn") &&
      (content.includes("export function __trackFn") ||
        content.includes("function __trackFn") ||
        content.includes("const __trackFn"))
    );
  } catch {
    return false;
  }
}

/**
 * Get all TypeScript/JavaScript files recursively
 */
async function getAllSourceFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!shouldExclude(fullPath)) {
        files.push(...(await getAllSourceFiles(fullPath)));
      }
    } else if (
      entry.isFile() &&
      (entry.name.endsWith(".ts") ||
        entry.name.endsWith(".tsx") ||
        entry.name.endsWith(".js") ||
        entry.name.endsWith(".jsx"))
    ) {
      if (!shouldExclude(fullPath)) {
        files.push(fullPath);
      }
    }
  }

  return files;
}

/**
 * Extract functions from a TypeScript source file
 */
function extractFunctions(
  sourceFile: ts.SourceFile,
  filePath: string
): Array<{ name: string; line: number; startLine: number; endLine: number }> {
  const functions: Array<{
    name: string;
    line: number;
    startLine: number;
    endLine: number;
  }> = [];

  function visit(node: ts.Node) {
    // Function declarations
    if (ts.isFunctionDeclaration(node) && node.name) {
      const startLine =
        sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const endLine =
        sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      functions.push({
        name: node.name.text,
        line: startLine,
        startLine,
        endLine,
      });
    }

    // Arrow functions and function expressions
    if (
      ts.isVariableDeclaration(node) &&
      node.initializer &&
      (ts.isArrowFunction(node.initializer) ||
        ts.isFunctionExpression(node.initializer))
    ) {
      const name = ts.isIdentifier(node.name) ? node.name.text : "anonymous";
      const startLine =
        sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const endLine =
        sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      functions.push({ name, line: startLine, startLine, endLine });
    }

    // Class methods
    if (ts.isMethodDeclaration(node) && node.name) {
      const methodName = ts.isIdentifier(node.name)
        ? node.name.text
        : ts.isStringLiteral(node.name)
        ? node.name.text
        : "method";
      const startLine =
        sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const endLine =
        sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      functions.push({ name: methodName, line: startLine, startLine, endLine });
    }

    // React components (function declarations with PascalCase)
    if (
      ts.isFunctionDeclaration(node) &&
      node.name &&
      /^[A-Z]/.test(node.name.text)
    ) {
      const startLine =
        sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
      const endLine =
        sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      // Only add if not already added as function declaration
      if (
        !functions.some(
          (f) => f.name === node.name!.text && f.line === startLine
        )
      ) {
        functions.push({
          name: node.name.text,
          line: startLine,
          startLine,
          endLine,
        });
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return functions;
}

/**
 * Get git blame contributors for a specific line range
 */
function getGitBlameContributors(
  filePath: string,
  startLine: number,
  endLine: number
): Contributor[] {
  try {
    // Get relative path from git root
    const gitRoot = execSync("git rev-parse --show-toplevel", {
      encoding: "utf-8",
    }).trim();
    const relativePath = path.relative(gitRoot, filePath).replace(/\\/g, "/");

    // Run git blame with line range
    const blameOutput = execSync(
      `git blame -L ${startLine},${endLine} "${relativePath}"`,
      {
        encoding: "utf-8",
        cwd: gitRoot,
        stdio: ["pipe", "pipe", "pipe"],
      }
    );

    // Parse blame output to extract unique authors
    // Format: <commit> (<author> <date> <line>) <code>
    // Or with email: <commit> (<author> <email> <date> <line>) <code>
    const authorMap = new Map<string, Contributor>();

    for (const line of blameOutput.split("\n")) {
      if (!line.trim()) continue;

      // Skip lines that don't have the expected format
      if (!line.includes("(") || !line.includes(")")) continue;

      // Extract author name and email from blame output
      // Format: (author <email> timestamp line) or (author timestamp line)
      const authorMatch = line.match(/\(([^)]+)\)/);
      if (authorMatch) {
        const authorInfo = authorMatch[1];
        
        // Try to extract name and email
        // Pattern: "Name <email> timestamp" or "Name timestamp"
        // Email pattern: name <email> followed by numbers (timestamp)
        const emailMatch = authorInfo.match(/^(.+?)\s*<([^>]+)>\s*(\d+)/);
        if (emailMatch) {
          const name = emailMatch[1].trim();
          const email = emailMatch[2].trim();
          const key = `${name.toLowerCase()}:${email.toLowerCase()}`;
          if (!authorMap.has(key)) {
            authorMap.set(key, { name, email });
          }
        } else {
          // No email, try to extract just name before timestamp
          // Pattern: "Name" followed by whitespace and numbers
          const nameMatch = authorInfo.match(/^(.+?)\s+(\d+)/);
          if (nameMatch) {
            const name = nameMatch[1].trim();
            // Skip if it looks like a timestamp or commit hash
            if (name && !/^\d+$/.test(name) && name.length > 0) {
              const key = `${name.toLowerCase()}:`;
              if (!authorMap.has(key)) {
                authorMap.set(key, { name, email: "" });
              }
            }
          }
        }
      }
    }

    return Array.from(authorMap.values());
  } catch (error) {
    console.warn(
      `Failed to get git blame for ${filePath}:${startLine}-${endLine}:`,
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

/**
 * Main analysis function
 */
async function analyzeFunctions(): Promise<void> {
  console.log("Starting function analysis...");
  console.log(`Scanning directory: ${EXAMPLEAPP_DIR}`);

  // Get all source files
  const sourceFiles = await getAllSourceFiles(EXAMPLEAPP_DIR);
  console.log(`Found ${sourceFiles.length} source files`);

  const allFunctions: FunctionMetadata[] = [];

  // Process each file
  for (const filePath of sourceFiles) {
    // Skip if file defines __trackFn
    if (await definesTrackFn(filePath)) {
      console.log(`Skipping ${filePath} (defines __trackFn)`);
      continue;
    }

    try {
      const content = await fs.readFile(filePath, "utf-8");
      const sourceFile = ts.createSourceFile(
        filePath,
        content,
        ts.ScriptTarget.Latest,
        true
      );

      const functions = extractFunctions(sourceFile, filePath);
      console.log(`Found ${functions.length} functions in ${filePath}`);

      // Get git blame for each function
      for (const func of functions) {
        const contributors = getGitBlameContributors(
          filePath,
          func.startLine,
          func.endLine
        );

        // Use relative path from exampleapp directory
        const relativePath = path.relative(EXAMPLEAPP_DIR, filePath).replace(/\\/g, "/");

        allFunctions.push({
          file: relativePath,
          name: func.name,
          line: func.line,
          contributors,
        });
      }
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
    }
  }

  // Create metadata file
  const metadata: FunctionMetadataFile = {
    projectId: PROJECT_ID,
    analyzedAt: Date.now(),
    functions: allFunctions,
  };

  // Write output
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(metadata, null, 2), "utf-8");

  console.log(`\nAnalysis complete!`);
  console.log(`Found ${allFunctions.length} total functions`);
  console.log(`Output written to: ${OUTPUT_FILE}`);
}

// Run analysis
analyzeFunctions().catch((error) => {
  console.error("Analysis failed:", error);
  process.exit(1);
});

