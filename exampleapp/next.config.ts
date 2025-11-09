import type { NextConfig } from "next";
import withInstrumentation from "../instrument/dist/next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default withInstrumentation({
  platformUrl: "https://dead-code-deleter.vercel.app/api/usage",
  projectId: "example-app",
  debug: true,
  uploadInterval: 10000,
})(nextConfig);
