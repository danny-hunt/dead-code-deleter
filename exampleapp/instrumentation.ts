// This file is automatically loaded by Next.js to set up instrumentation
// We use it to initialize our dead-code tracking runtime

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Server-side instrumentation
    await import("../instrument/dist/runtime");
  }
}




