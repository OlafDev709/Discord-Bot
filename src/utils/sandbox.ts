export type SandboxContext = Record<string, unknown>;

export interface SandboxOptions {
  code: string;
  context: SandboxContext;
  timeoutMs?: number;
  allowRequire?: boolean;
  allowedModules?: string[];
}

export async function runInSandbox({
  code,
  context,
  timeoutMs = 5000,
  allowRequire = false,
  allowedModules = [],
}: SandboxOptions): Promise<
  { ok: true; result: unknown } | { ok: false; error: string }
> {
  if (allowRequire) {
    context.require = (moduleName: string) => {
      if (!allowedModules.includes(moduleName)) {
        throw new Error(`Module '${moduleName}' is not permitted.`);
      }
      return require(moduleName);
    };
  }

  const keys = Object.keys(context);
  const values = Object.values(context);

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor;

  try {
    const runner = new AsyncFunction(...keys, `"use strict";\n${code}`);
    const result = await Promise.race([
      runner(...values),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Execution timed out')), timeoutMs)
      ),
    ]);
    return { ok: true, result };
  } catch (err: unknown) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
