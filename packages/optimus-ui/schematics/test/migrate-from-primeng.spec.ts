import { describe, expect, it } from 'vitest';
import { createAppTree, createRunner, DEFAULT_PKG } from './helpers';

const PRIMENG_PKG = {
    ...DEFAULT_PKG,
    dependencies: {
        '@angular/core': '^21.0.0',
        primeng: '^21.0.2',
        '@primeuix/themes': '^1.2.0',
        'tailwindcss-primeui': '^0.6.1'
    }
};

const APP_CONFIG_PRIMENG = `import { ApplicationConfig } from '@angular/core';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

export const appConfig: ApplicationConfig = {
    providers: [providePrimeNG({ theme: { preset: Aura } })]
};
`;

function primengTree(extraFiles: Record<string, string> = {}, pkg: object = PRIMENG_PKG) {
    return createAppTree({ '/src/app/app.config.ts': APP_CONFIG_PRIMENG, ...extraFiles }, pkg);
}

describe('migrate-from-primeng', () => {
    it('aborts when primeng is older than 21', async () => {
        const runner = createRunner();
        const tree = primengTree({}, { ...PRIMENG_PKG, dependencies: { ...PRIMENG_PKG.dependencies, primeng: '^19.0.0' } });
        await expect(runner.runSchematic('migrate-from-primeng', { skipInstall: true }, tree)).rejects.toThrow(/v21/);
    });

    it('aborts when primeng is not installed', async () => {
        const runner = createRunner();
        await expect(runner.runSchematic('migrate-from-primeng', { skipInstall: true }, createAppTree())).rejects.toThrow(/not installed/);
    });

    it('proceeds on old versions with --force', async () => {
        const runner = createRunner();
        const tree = primengTree({}, { ...PRIMENG_PKG, dependencies: { ...PRIMENG_PKG.dependencies, primeng: '^19.0.0' } });
        const result = await runner.runSchematic('migrate-from-primeng', { skipInstall: true, force: true }, tree);
        expect(JSON.parse(result.readContent('/package.json')).dependencies['@openng/optimus-ui']).toBe('^21.1.9');
    });

    it('succeeds when primeng is only present in a workspace sub-package (not the root)', async () => {
        const runner = createRunner();
        const tree = createAppTree({
            '/libs/app/package.json': JSON.stringify({ name: 'app-lib', dependencies: { primeng: '^21.0.2' } }, null, 2) + '\n'
        });
        const result = await runner.runSchematic('migrate-from-primeng', { skipInstall: true }, tree);
        const libPkg = JSON.parse(result.readContent('/libs/app/package.json'));
        expect(libPkg.dependencies.primeng).toBeUndefined();
        expect(libPkg.dependencies['@openng/optimus-ui']).toBe('^21.1.9');
    });

    it('swaps dependencies in every workspace package.json', async () => {
        const runner = createRunner();
        const tree = primengTree({
            '/libs/ui/package.json': JSON.stringify({ name: 'ui', dependencies: { '@primeuix/styled': '^1.0.0' } }, null, 2) + '\n'
        });
        const result = await runner.runSchematic('migrate-from-primeng', { skipInstall: true }, tree);

        const rootPkg = JSON.parse(result.readContent('/package.json'));
        expect(rootPkg.dependencies.primeng).toBeUndefined();
        expect(rootPkg.dependencies['@openng/optimus-ui']).toBe('^21.1.9');
        expect(rootPkg.dependencies['@openng/optimus-ui-themes']).toBe('^2.0.3');
        expect(rootPkg.dependencies['tailwindcss-primeui']).toBe('^0.6.1');

        const libPkg = JSON.parse(result.readContent('/libs/ui/package.json'));
        expect(libPkg.dependencies['@openng/optimus-ui-styled']).toBe('^0.7.4');
    });

    it('rewrites TypeScript sources', async () => {
        const runner = createRunner();
        const tree = primengTree({
            '/src/app/list.component.ts':
                `import { TableModule } from 'primeng/table';\n` + `import { PrimeNG } from 'primeng/config';\n` + `import { inject } from '@angular/core';\n` + `export class ListComponent {\n` + `    config = inject(PrimeNG);\n` + `}\n`
        });
        const result = await runner.runSchematic('migrate-from-primeng', { skipInstall: true }, tree);

        const appConfig = result.readContent('/src/app/app.config.ts');
        expect(appConfig).toContain(`import { provideOptimus } from '@openng/optimus-ui/config';`);
        expect(appConfig).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(appConfig).toContain(`provideOptimus({ theme: { preset: Aura } })`);

        const component = result.readContent('/src/app/list.component.ts');
        expect(component).toContain(`from '@openng/optimus-ui/table'`);
        expect(component).toContain(`inject(Optimus)`);
    });

    it('does not touch node_modules or dist', async () => {
        const runner = createRunner();
        const content = `import { X } from 'primeng/button';\n`;
        const tree = primengTree({
            '/node_modules/somepkg/index.ts': content,
            '/dist/app/main.ts': content
        });
        const result = await runner.runSchematic('migrate-from-primeng', { skipInstall: true }, tree);
        expect(result.readContent('/node_modules/somepkg/index.ts')).toBe(content);
        expect(result.readContent('/dist/app/main.ts')).toBe(content);
    });

    it('warns about leftover mentions in non-TS files', async () => {
        const runner = createRunner();
        const tree = primengTree({
            '/src/styles.scss': `/* uses primeng theme vars */\n`
        });
        const warnings: string[] = [];
        runner.logger.subscribe((entry) => {
            if (entry.level === 'warn') {
                warnings.push(entry.message);
            }
        });
        await runner.runSchematic('migrate-from-primeng', { skipInstall: true }, tree);
        expect(warnings.join('\n')).toContain('/src/styles.scss:1');
    });

    it('schedules an install task unless skipInstall is set', async () => {
        const runner = createRunner();
        await runner.runSchematic('migrate-from-primeng', {}, primengTree());
        expect(runner.tasks.some((t) => t.name === 'node-package')).toBe(true);
    });

    it('does not warn about lockfiles but still warns about genuine leftovers', async () => {
        const runner = createRunner();
        const tree = primengTree({
            '/package-lock.json': JSON.stringify(
                {
                    name: 'test-app',
                    lockfileVersion: 3,
                    packages: {
                        'node_modules/primeng': {
                            resolved: 'https://registry.npmjs.org/primeng/-/primeng-21.0.2.tgz'
                        }
                    }
                },
                null,
                2
            ),
            '/src/styles.scss': `/* uses primeng theme vars */\n`
        });
        const warnings: string[] = [];
        runner.logger.subscribe((entry) => {
            if (entry.level === 'warn') {
                warnings.push(entry.message);
            }
        });
        await runner.runSchematic('migrate-from-primeng', { skipInstall: true }, tree);
        const combined = warnings.join('\n');
        expect(combined).not.toContain('package-lock.json');
        expect(combined).toContain('/src/styles.scss:1');
    });
});
