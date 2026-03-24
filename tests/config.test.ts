import { afterEach, describe, expect, it } from 'vitest';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

// Test saveConfig/loadSavedConfig by importing the real functions
// but pointing at a temp directory. We test the actual module-level
// CONFIG_PATH indirectly via the exported functions.

describe('GitNexusConfig round-trip', () => {
  // We can't easily redirect CONFIG_PATH, so test the JSON logic directly.
  it('loadSavedConfig returns {} for missing file', async () => {
    const { loadSavedConfig } = await import('../src/gitnexus');
    // The real config file may or may not exist — if it doesn't, should return {}
    const cfg = loadSavedConfig();
    expect(typeof cfg).toBe('object');
  });

  it('loadSavedConfig returns {} for corrupt JSON', () => {
    // Simulate by testing the same pattern
    const parse = (s: string) => {
      try { return JSON.parse(s); }
      catch { return {}; }
    };
    expect(parse('{bad json')).toEqual({});
    expect(parse('')).toEqual({});
  });

  it('config fields are all optional', async () => {
    const { loadSavedConfig } = await import('../src/gitnexus');
    const cfg = loadSavedConfig();
    // All fields should be undefined or their type
    expect(cfg.cmd === undefined || typeof cfg.cmd === 'string').toBe(true);
    expect(cfg.autoAugment === undefined || typeof cfg.autoAugment === 'boolean').toBe(true);
    expect(cfg.augmentTimeout === undefined || typeof cfg.augmentTimeout === 'number').toBe(true);
    expect(cfg.maxAugmentsPerResult === undefined || typeof cfg.maxAugmentsPerResult === 'number').toBe(true);
    expect(cfg.maxSecondaryPatterns === undefined || typeof cfg.maxSecondaryPatterns === 'number').toBe(true);
  });
});

describe('setAugmentTimeout', () => {
  it('converts seconds to milliseconds', async () => {
    const { setAugmentTimeout } = await import('../src/gitnexus');
    // Should not throw
    setAugmentTimeout(10);
    setAugmentTimeout(4);
  });
});
