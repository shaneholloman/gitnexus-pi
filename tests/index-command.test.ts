import { beforeEach, describe, expect, it, vi } from 'vitest';

const callToolMock = vi.fn();
const sendUserMessageMock = vi.fn();
const notifyMock = vi.fn();
const registerCommandMock = vi.fn();
const registerToolMock = vi.fn();
const registerFlagMock = vi.fn();
const onMock = vi.fn();
const getFlagMock = vi.fn(() => '');

vi.mock('../src/mcp-client', () => ({
  mcpClient: {
    callTool: callToolMock,
    stop: vi.fn(),
  },
}));

vi.mock('../src/tools', () => ({
  registerTools: vi.fn(),
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
    clearIndexCache: vi.fn(),
  };
});

describe('/gitnexus command error handling', () => {
  beforeEach(() => {
    callToolMock.mockReset();
    sendUserMessageMock.mockReset();
    notifyMock.mockReset();
    registerCommandMock.mockReset();
  });

  it('catches MCP errors in slash commands and notifies the user', async () => {
    callToolMock.mockRejectedValue(new Error('[GitNexus] repo selection failed'));

    const { default: register } = await import('../src/index');
    register({
      registerTool: registerToolMock,
      registerCommand: registerCommandMock,
      registerFlag: registerFlagMock,
      on: onMock,
      getFlag: getFlagMock,
      sendUserMessage: sendUserMessageMock,
    } as any);

    const command = registerCommandMock.mock.calls[0][1];
    await command.handler('query auth', { cwd: '/outside/repo', ui: { notify: notifyMock } });

    expect(notifyMock).toHaveBeenCalledWith('[GitNexus] repo selection failed', 'error');
    expect(sendUserMessageMock).not.toHaveBeenCalled();
  });
});
