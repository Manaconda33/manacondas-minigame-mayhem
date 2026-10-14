export interface ValidationExpectation {
  runtimeId: string;
  sourceSha: string;
  sourceTree: string;
  runtimeLockSha256: string;
  lfsInventorySha256: string;
  contractSha256: string;
  workflowBlob: string;
  contractLockSha256: string;
  nodeVersion: string;
  npmVersion: string;
  runnerImage: string;
  toolchainSha256: string;
  commands: string[];
  artifactName: string;
}

export function validationToolchainFingerprint(input: {
  nodeVersion: string;
  npmVersion: string;
  runnerImage: string;
}): string;

export function validationEvidenceName(
  runtimeId: string,
  sourceSha: string,
  contractSha256: string,
  toolchainSha256: string,
): string;

export function validationCommands(runtimeId: string, previewBase: string): string[];
export function normalizeLfsInventory(output: string): string;

export function decideValidationReuse(input: {
  artifact: unknown;
  evidence: unknown;
  run: unknown;
  expected: ValidationExpectation;
}): { reuse: boolean; reason: string };

export function findTrustedValidationArtifact(input: {
  repository: string;
  token: string;
  expected: ValidationExpectation;
  fetchImpl?: typeof fetch;
}): Promise<{ artifact: unknown; run: unknown; reason: string }>;

export function restoreTrustedValidationEvidence(input: {
  repository: string;
  token: string;
  expected: ValidationExpectation;
  destination: string;
  fetchImpl?: typeof fetch;
}): Promise<{
  artifact: unknown;
  run: unknown;
  evidence: unknown;
  reason: string;
}>;
