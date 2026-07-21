import { SchematicsException } from '@angular-devkit/schematics';
import { UnitTestTree } from '@angular-devkit/schematics/testing';
import { describe, expect, it } from 'vitest';
import { createAppTree, createRealAppTree, createRunner, DEFAULT_PKG } from './helpers';

function findFileContaining(tree: UnitTestTree, substring: string): string {
    const path = tree.files.find((file) => file.endsWith('.ts') && tree.readContent(file).includes(substring));
    if (!path) {
        throw new Error(`No file in the tree contains "${substring}". Files: ${tree.files.join(', ')}`);
    }
    return path;
}

describe('ng-add', () => {
    it('fresh standalone project (real CLI tree): adds the themes dependency and wires provideOptimus', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: true });
        const result = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        const pkg = JSON.parse(result.readContent('/package.json'));
        expect(pkg.dependencies['@openng/optimus-ui-themes']).toBe('^2.0.3');

        const appConfigPath = findFileContaining(result, 'provideOptimus');
        expect(appConfigPath).toBe('/src/app/app.config.ts');
        const appConfig = result.readContent(appConfigPath);
        expect(appConfig).toContain(`import { provideOptimus } from '@openng/optimus-ui/config';`);
        expect(appConfig).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(appConfig).toContain(`provideOptimus({ theme: { preset: Aura } })`);
    });

    it.each([
        ['Lara', 'lara'],
        ['Material', 'material'],
        ['Nora', 'nora']
    ] as const)('fresh standalone project with --theme %s: wires the chosen preset', async (theme, module) => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: true });
        const result = await runner.runSchematic('ng-add', { skipInstall: true, theme }, appTree);

        const appConfig = result.readContent('/src/app/app.config.ts');
        expect(appConfig).toContain(`import ${theme} from '@openng/optimus-ui-themes/${module}';`);
        expect(appConfig).toContain(`provideOptimus({ theme: { preset: ${theme} } })`);
        expect(appConfig).not.toContain('Aura');
    });

    it('fresh NgModule project (real CLI tree, standalone: false): wires provideOptimus into the AppModule providers', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner, { standalone: false });
        const result = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        const pkg = JSON.parse(result.readContent('/package.json'));
        expect(pkg.dependencies['@openng/optimus-ui-themes']).toBe('^2.0.3');

        const modulePath = findFileContaining(result, 'provideOptimus');
        expect(modulePath).toBe('/src/app/app-module.ts');
        const moduleSource = result.readContent(modulePath);
        expect(moduleSource).toContain(`import { provideOptimus } from '@openng/optimus-ui/config';`);
        expect(moduleSource).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(moduleSource).toMatch(/providers:\s*\[[\s\S]*provideOptimus\(\{ theme: \{ preset: Aura \} \}\)/);
    });

    it('nonexistent --project rejects with SchematicsException (real CLI tree)', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner);
        await expect(runner.runSchematic('ng-add', { skipInstall: true, project: 'does-not-exist' }, appTree)).rejects.toThrow(SchematicsException);
    });

    it('re-running on an already-configured project (real CLI tree) logs an informational message and leaves the file untouched', async () => {
        const runner = createRunner();
        const appTree = await createRealAppTree(runner);
        const first = await runner.runSchematic('ng-add', { skipInstall: true }, appTree);

        const logs: string[] = [];
        runner.logger.subscribe((entry) => logs.push(entry.message));
        const second = await runner.runSchematic('ng-add', { skipInstall: true }, first);

        expect(logs.join('\n')).toContain('provideOptimus already configured in');
        expect(logs.join('\n')).not.toContain('Added provideOptimus');
        expect(second.readContent('/src/app/app.config.ts')).toBe(first.readContent('/src/app/app.config.ts'));
    });

    it('fresh project on a minimal hand-built tree (no build target): leaves files alone and logs instructions', async () => {
        // createAppTree's angular.json has no `architect`/`build` target, so addRootProvider can't
        // locate a main file — this exercises the degrade-to-manual-instructions path.
        const runner = createRunner();
        const tree = createAppTree();
        const logs: string[] = [];
        runner.logger.subscribe((entry) => logs.push(entry.message));

        const result = await runner.runSchematic('ng-add', { skipInstall: true }, tree);
        expect(logs.join('\n')).toContain('provideOptimus');
        expect(JSON.parse(result.readContent('/package.json')).dependencies['@openng/optimus-ui-themes']).toBe('^2.0.3');
        expect(result.readContent('/src/app/app.config.ts')).not.toContain('provideOptimus');
    });

    it('primeng project: runs the migration instead', async () => {
        const runner = createRunner();
        const tree = createAppTree(
            { '/src/app/app.config.ts': `import { providePrimeNG } from 'primeng/config';\nexport const appConfig = { providers: [providePrimeNG()] };\n` },
            { ...DEFAULT_PKG, dependencies: { '@angular/core': '^21.0.0', primeng: '^21.0.2' } }
        );
        const result = await runner.runSchematic('ng-add', { skipInstall: true }, tree);

        const pkg = JSON.parse(result.readContent('/package.json'));
        expect(pkg.dependencies.primeng).toBeUndefined();
        expect(pkg.dependencies['@openng/optimus-ui']).toBe('^21.1.9');
        expect(result.readContent('/src/app/app.config.ts')).toContain('provideOptimus()');
    });

    it('schedules an install task unless skipInstall is set', async () => {
        const runner = createRunner();
        await runner.runSchematic('ng-add', {}, createAppTree());
        expect(runner.tasks.some((t) => t.name === 'node-package')).toBe(true);
    });

    it('primeng only in a workspace sub-package: chains to the migration', async () => {
        const runner = createRunner();
        const tree = createAppTree({
            '/libs/app/package.json': JSON.stringify({ name: 'app-lib', dependencies: { primeng: '^21.0.2' } }, null, 2) + '\n'
        });
        const logs: string[] = [];
        runner.logger.subscribe((entry) => logs.push(entry.message));

        const result = await runner.runSchematic('ng-add', { skipInstall: true }, tree);
        expect(logs.join('\n')).toContain('primeng detected');
        const libPkg = JSON.parse(result.readContent('/libs/app/package.json'));
        expect(libPkg.dependencies.primeng).toBeUndefined();
        expect(libPkg.dependencies['@openng/optimus-ui']).toBe('^21.1.9');
    });

    it('primeng pinned to "latest" in a workspace sub-package: still chains to the migration, which rejects on the unparseable version', async () => {
        const runner = createRunner();
        const tree = createAppTree({
            '/libs/app/package.json': JSON.stringify({ name: 'app-lib', dependencies: { primeng: 'latest' } }, null, 2) + '\n'
        });

        await expect(runner.runSchematic('ng-add', { skipInstall: true }, tree)).rejects.toThrow(/primeng is not installed in this workspace \(or its version could not be parsed\)\. Use --force to run the code migration anyway\./);
    });
});
