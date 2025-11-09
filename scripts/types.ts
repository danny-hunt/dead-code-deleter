/**
 * Types for function metadata analysis
 */

export interface Contributor {
  name: string;
  email: string;
}

export interface FunctionMetadata {
  file: string;
  name: string;
  line: number;
  contributors: Contributor[];
}

export interface FunctionMetadataFile {
  projectId: string;
  analyzedAt: number;
  functions: FunctionMetadata[];
}

