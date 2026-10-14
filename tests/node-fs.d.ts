declare module 'node:fs' {
  export function readFileSync(path: string, encoding: 'utf8' | 'base64'): string;
  export function mkdirSync(path: string, options: { recursive: true }): string | undefined;
  export function mkdtempSync(prefix: string): string;
  export function rmSync(path: string, options: { recursive: true; force: true }): void;
  export function writeFileSync(path: string, data: string): void;
}

declare module 'node:child_process' {
  export function execFileSync(command: string, args: string[]): Buffer;
}

declare module 'node:os' {
  export function tmpdir(): string;
}

declare module 'node:path' {
  export function join(...parts: string[]): string;
}
