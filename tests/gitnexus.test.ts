import { describe, expect, it } from 'vitest';
import { mkdtempSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';
import { homedir, tmpdir } from 'os';
import {
  expandUserPath,
  extractFilesFromReadMany,
  extractPattern,
  findGitNexusRoot,
  normalizePathArg,
  resolveGitNexusCmd,
  validateRepoRelativePath,
} from '../src/gitnexus';

describe('gitnexus helpers', () => {
  it('prefers saved config over the empty default flag value', () => {
    expect(resolveGitNexusCmd('', 'npx gitnexus@latest')).toEqual(['npx', 'gitnexus@latest']);
    expect(resolveGitNexusCmd(undefined, 'npx gitnexus@latest')).toEqual(['npx', 'gitnexus@latest']);
    expect(resolveGitNexusCmd('gitnexus --debug', 'npx gitnexus@latest')).toEqual(['gitnexus', '--debug']);
  });

  it('finds the nearest gitnexus repo root even from deep nested directories', () => {
    const root = mkdtempSync(join(tmpdir(), 'pi-gitnexus-root-'));
    const nested = join(root, 'a', 'b', 'c', 'd', 'e', 'f', 'g');
    mkdirSync(join(root, '.gitnexus'));
    mkdirSync(nested, { recursive: true });

    try {
      expect(findGitNexusRoot(nested)).toBe(root);
    } finally {
      rmSync(root, { recursive: true, force: true });
    }
  });

  it('augments markdown reads and read_many batches', () => {
    expect(extractPattern('read', { path: '/repo/README.md' })).toBe('README');
    expect(
      extractFilesFromReadMany(
        {
          files: [
            { path: '/repo/docs/ARCHITECTURE.md' },
            { path: '/repo/src/index.ts' },
          ],
        },
        [],
      ),
    ).toEqual([
      { path: '/repo/docs/ARCHITECTURE.md', pattern: 'ARCHITECTURE' },
      { path: '/repo/src/index.ts', pattern: 'index' },
    ]);
  });

  it('normalizes path args with a leading @ prefix', () => {
    expect(normalizePathArg('@src/auth.ts')).toBe('src/auth.ts');
    expect(normalizePathArg('src/auth.ts')).toBe('src/auth.ts');
  });

  it('expands ~/ repo paths before filesystem resolution', () => {
    expect(expandUserPath('~/demo')).toBe(join(homedir(), 'demo'));
    expect(expandUserPath('/tmp/demo')).toBe('/tmp/demo');
  });

  it('rejects invalid repo-relative paths', () => {
    expect(validateRepoRelativePath('src/auth.ts')).toBe('src/auth.ts');
    expect(validateRepoRelativePath('../etc/passwd')).toBeNull();
    expect(validateRepoRelativePath('/etc/passwd')).toBeNull();
    expect(validateRepoRelativePath('')).toBeNull();
  });
});
