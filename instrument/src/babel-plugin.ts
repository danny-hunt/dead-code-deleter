import { PluginObj } from "@babel/core";
import * as t from "@babel/types";
import { NodePath } from "@babel/traverse";

interface PluginState {
  filename?: string;
  file: any;
  opts: {
    runtimePath?: string;
  };
}

/**
 * Babel plugin that instruments functions with usage tracking
 */
export default function instrumentationPlugin(): PluginObj<PluginState> {
  return {
    name: "dead-code-deleter-instrumentation",

    visitor: {
      Program(path, state) {
        // Skip if no filename or if it's in node_modules
        const filename = state.filename || state.file.opts.filename;

        // More robust check for node_modules - check the actual path
        if (!filename) {
          return;
        }

        // Normalize the path
        const normalizedPath = filename.replace(/\\/g, "/");

        // Skip if it's node_modules, .next, dist, or our own instrumentation code
        if (
          normalizedPath.includes("/node_modules/") ||
          normalizedPath.includes("node_modules/") ||
          normalizedPath.includes("/@dead-code-deleter/") ||
          normalizedPath.includes("/instrument/dist/") ||
          normalizedPath.includes("/instrument/src/") ||
          normalizedPath.includes("/instrument/runtime") ||
          normalizedPath.includes("instrument/runtime") ||
          normalizedPath.includes("/.next/") ||
          normalizedPath.includes("/dist/")
        ) {
          return;
        }

        // CRITICAL: Check if this file defines __trackFn to prevent self-instrumentation
        const defines__trackFn = path.node.body.some((node) => {
          // Check for export function __trackFn
          if (t.isExportNamedDeclaration(node) && t.isFunctionDeclaration(node.declaration)) {
            return node.declaration.id?.name === "__trackFn";
          }
          // Check for function __trackFn
          if (t.isFunctionDeclaration(node) && node.id?.name === "__trackFn") {
            return true;
          }
          // Check for const __trackFn = ...
          if (t.isVariableDeclaration(node)) {
            return node.declarations.some((decl) => t.isIdentifier(decl.id) && decl.id.name === "__trackFn");
          }
          return false;
        });

        if (defines__trackFn) {
          // This file defines __trackFn, don't instrument it
          return;
        }

        // Store filename in state for use in other visitors
        state.filename = filename;

        // Import the __trackFn function at the top of the file
        const importStatement = t.importDeclaration(
          [t.importSpecifier(t.identifier("__trackFn"), t.identifier("__trackFn"))],
          t.stringLiteral("@dead-code-deleter/instrument")
        );

        // Check if the import already exists
        const hasImport = path.node.body.some(
          (node) => t.isImportDeclaration(node) && node.source.value === "@dead-code-deleter/instrument"
        );

        if (!hasImport) {
          path.unshiftContainer("body", importStatement);
        }
      },

      FunctionDeclaration(path, state) {
        instrumentFunction(path, state, path.node.id?.name || "anonymous");
      },

      FunctionExpression(path, state) {
        // Try to get a meaningful name from the variable or property
        const name = getFunctionName(path) || "anonymous";
        instrumentFunction(path, state, name);
      },

      ArrowFunctionExpression(path, state) {
        const name = getFunctionName(path) || "anonymous";
        instrumentFunction(path, state, name);
      },

      ClassMethod(path, state) {
        const className = getClassName(path);
        const methodName = getMethodName(path);
        const name = className ? `${className}.${methodName}` : methodName;
        instrumentFunction(path, state, name);
      },
    },
  };
}

/**
 * Inject tracking call at the start of a function
 */
function instrumentFunction(path: NodePath<t.Function>, state: PluginState, functionName: string): void {
  const filename = state.filename;
  if (!filename) return;

  // CRITICAL: Never instrument __trackFn itself to prevent infinite recursion
  if (functionName === "__trackFn") {
    return;
  }

  // Skip if already instrumented
  const body = path.node.body;
  if (!t.isBlockStatement(body)) {
    // Arrow functions with expression bodies: () => expression
    // We need to convert to block statement
    const returnStatement = t.returnStatement(body as t.Expression);
    const trackingCall = createTrackingCall(filename, functionName, path.node.loc?.start.line || 0);
    path.node.body = t.blockStatement([t.expressionStatement(trackingCall), returnStatement]);
    return;
  }

  // Check if first statement is already a tracking call
  if (body.body.length > 0 && isTrackingCall(body.body[0])) {
    return;
  }

  // Create and inject the tracking call
  const line = path.node.loc?.start.line || 0;
  const trackingCall = createTrackingCall(filename, functionName, line);

  body.body.unshift(t.expressionStatement(trackingCall));
}

/**
 * Create a __trackFn() call expression
 */
function createTrackingCall(filename: string, functionName: string, line: number): t.CallExpression {
  return t.callExpression(t.identifier("__trackFn"), [
    t.stringLiteral(filename),
    t.stringLiteral(functionName),
    t.numericLiteral(line),
  ]);
}

/**
 * Check if a statement is a __trackFn call
 */
function isTrackingCall(statement: t.Statement): boolean {
  return (
    t.isExpressionStatement(statement) &&
    t.isCallExpression(statement.expression) &&
    t.isIdentifier(statement.expression.callee) &&
    statement.expression.callee.name === "__trackFn"
  );
}

/**
 * Get a meaningful function name from its context
 */
function getFunctionName(path: NodePath<t.Function>): string | null {
  const parent = path.parent;

  // Variable declaration: const myFunc = () => {}
  if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
    return parent.id.name;
  }

  // Object property: { myFunc: () => {} }
  if (t.isObjectProperty(parent)) {
    if (t.isIdentifier(parent.key)) {
      return parent.key.name;
    }
    if (t.isStringLiteral(parent.key)) {
      return parent.key.value;
    }
  }

  // Class property: myFunc = () => {}
  if (t.isClassProperty(parent) && t.isIdentifier(parent.key)) {
    return parent.key.name;
  }

  // Assignment: myFunc = () => {}
  if (t.isAssignmentExpression(parent) && t.isIdentifier(parent.left)) {
    return parent.left.name;
  }

  // Export default
  if (t.isExportDefaultDeclaration(parent)) {
    return "default";
  }

  return null;
}

/**
 * Get the class name from a class method path
 */
function getClassName(path: NodePath<t.ClassMethod>): string | null {
  const classPath = path.findParent((p) => p.isClassDeclaration() || p.isClassExpression());

  if (!classPath) return null;

  const classNode = classPath.node as t.ClassDeclaration | t.ClassExpression;

  if (t.isClassDeclaration(classNode) && classNode.id) {
    return classNode.id.name;
  }

  // Try to get name from variable declaration
  if (t.isClassExpression(classNode)) {
    const parent = classPath.parent;
    if (t.isVariableDeclarator(parent) && t.isIdentifier(parent.id)) {
      return parent.id.name;
    }
  }

  return null;
}

/**
 * Get the method name from a class method
 */
function getMethodName(path: NodePath<t.ClassMethod>): string {
  const key = path.node.key;

  if (t.isIdentifier(key)) {
    return key.name;
  }

  if (t.isStringLiteral(key)) {
    return key.value;
  }

  return "method";
}
