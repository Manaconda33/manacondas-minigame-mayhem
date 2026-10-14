export interface ChangeRecord {
  status: string;
  path: string;
  previousPath?: string;
  oldMode: string;
  newMode: string;
}

export function classifyChanges(input: { complete: boolean; records: ChangeRecord[] }): {
  docsOnly: boolean;
  reason: string;
  records?: ChangeRecord[];
};

export function parseRawDiff(rawDiff: string | Uint8Array): ChangeRecord[];

export function classifyGitRange(input: { baseSha: string; headSha: string }): {
  docsOnly: boolean;
  reason: string;
  records: ChangeRecord[];
};
