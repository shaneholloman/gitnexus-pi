import { beforeEach, describe, expect, it, vi } from 'vitest';

const registerCommandMock = vi.fn();

vi.mock('../src/mcp-client', () => ({
  mcpClient: { callTool: vi.fn(), stop: vi.fn() },
}));

vi.mock('../src/tools', () => ({
  registerTools: vi.fn(),
}));

vi.mock('../src/ui/main-menu', () => ({
  openMainMenu: vi.fn(),
}));

vi.mock('../src/gitnexus', async () => {
  const actual = await vi.importActual<typeof import('../src/gitnexus')>('../src/gitnexus');
  return {
    ...actual,
    findGitNexusRoot: vi.fn(() => '/repo-root'),
    findGitNexusIndex: vi.fn(() => true),
    loadSavedConfig: vi.fn(() => ({})),
    runAugment: vi.fn(async () => null),
    resolveGitNexusCmd: vi.fn(() => ['gitnexus']),
    updateSpawnEnv: vi.fn(),
    setGitnexusCmd: vi.fn(),
    setAugmentTimeout: vi.fn(),
    clearIndexCache: vi.fn(),
    spawnEnv: process.env,
    gitnexusCmd: ['gitnexus'],
  };
});

describe('getArgumentCompletions', () => {
  beforeEach(() => {
    registerCommandMock.mockReset();
  });

  it('returns matching subcommands for prefix', async () => {
    const { default: register } = await import('../src/index');
    register({
      registerTool: vi.fn(),
      registerCommand: registerCommandMock,
      registerFlag: vi.fn(),
      on: vi.fn(),
      getFlag: vi.fn(() => ''),
      sendUserMessage: vi.fn(),
    } as any);

    const command = registerCommandMock.mock.calls[0][1];
    const completions = command.getArgumentCompletions;

    expect(completions('st')).toEqual([{ value: 'status', label: 'status' }]);
    expect(completions('an')).toEqual([{ value: 'analyze', label: 'analyze' }]);
    expect(completions('se')).toEqual([{ value: 'settings', label: 'settings' }]);
    expect(completions('he')).toEqual([{ value: 'help', label: 'help' }]);
    expect(completions('o')).toEqual([
      { value: 'on', label: 'on' },
      { value: 'off', label: 'off' },
    ]);
  });

  it('returns null for no match', async () => {
    const { default: register } = await import('../src/index');
    register({
      registerTool: vi.fn(),
      registerCommand: registerCommandMock,
      registerFlag: vi.fn(),
      on: vi.fn(),
      getFlag: vi.fn(() => ''),
      sendUserMessage: vi.fn(),
    } as any);

    const command = registerCommandMock.mock.calls[0][1];
    expect(command.getArgumentCompletions('zzz')).toBeNull();
  });

  it('returns all subcommands for empty prefix', async () => {
    const { default: register } = await import('../src/index');
    register({
      registerTool: vi.fn(),
      registerCommand: registerCommandMock,
      registerFlag: vi.fn(),
      on: vi.fn(),
      getFlag: vi.fn(() => ''),
      sendUserMessage: vi.fn(),
    } as any);

    const command = registerCommandMock.mock.calls[0][1];
    const all = command.getArgumentCompletions('');
    expect(all.length).toBeGreaterThan(5);
    expect(all.map((c: any) => c.value)).toContain('status');
    expect(all.map((c: any) => c.value)).toContain('analyze');
    expect(all.map((c: any) => c.value)).toContain('settings');
  });
});
