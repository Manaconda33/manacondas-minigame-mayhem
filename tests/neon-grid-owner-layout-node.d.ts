declare module 'node:crypto' {
  interface Hash {
    update(data: string): Hash;
    digest(encoding: 'hex'): string;
  }
  export function createHash(algorithm: 'sha256'): Hash;
}

declare module 'node:child_process' {
  interface SpawnSyncResult {
    status: number | null;
    stdout: string;
    stderr: string;
  }
  export function spawnSync(
    command: string,
    args: string[],
    options: { encoding: 'utf8' },
  ): SpawnSyncResult;
}

declare module 'node:fs' {
  export function mkdtempSync(prefix: string): string;
  export function rmSync(path: string, options: { recursive: boolean; force: boolean }): void;
}

declare module 'node:os' {
  export function tmpdir(): string;
}

declare module 'node:path' {
  interface PathModule {
    resolve(...paths: string[]): string;
    join(...paths: string[]): string;
  }
  const path: PathModule;
  export default path;
}

declare const process: {
  execPath: string;
  env: Record<string, string | undefined>;
};
