#!/usr/bin/env node

/**
 * Script to upload function metadata to the platform
 */

import * as fs from "fs/promises";
import * as path from "path";

const EXAMPLEAPP_DIR = path.join(__dirname, "..", "exampleapp");
const METADATA_FILE = path.join(EXAMPLEAPP_DIR, "function-metadata.json");
const PLATFORM_URL = process.env.PLATFORM_URL || "http://localhost:3001";

async function uploadMetadata() {
  try {
    // Read metadata file
    const content = await fs.readFile(METADATA_FILE, "utf-8");
    const metadata = JSON.parse(content);

    if (!metadata.projectId) {
      console.error("Error: Metadata file missing projectId");
      process.exit(1);
    }

    const projectId = metadata.projectId;
    const url = `${PLATFORM_URL}/api/projects/${projectId}/metadata`;

    console.log(`Uploading metadata for project: ${projectId}`);
    console.log(`Platform URL: ${url}`);
    console.log(`Functions: ${metadata.functions.length}`);

    // Upload to platform
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Upload failed: ${response.status} ${response.statusText}`);
      console.error(`Error: ${errorText}`);
      process.exit(1);
    }

    const result = await response.json();
    console.log("Upload successful!");
    console.log(JSON.stringify(result, null, 2));
  } catch (error) {
    console.error("Error uploading metadata:", error);
    process.exit(1);
  }
}

uploadMetadata();

