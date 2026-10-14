export interface ValidationInputFingerprint {
  contractSha256: string;
  workflowBlob: string;
  lockSha256: string;
  inputCount: number;
}

export function fingerprintValidationInputs(root?: string): ValidationInputFingerprint;
