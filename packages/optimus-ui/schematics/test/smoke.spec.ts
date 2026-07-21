import { describe, expect, it } from 'vitest';
import { createAppTree, createRunner } from './helpers';

describe('collection smoke', () => {
    it('loads and runs ng-add against a minimal tree', async () => {
        const runner = createRunner();
        const tree = await runner.runSchematic('ng-add', { skipInstall: true }, createAppTree());
        expect(tree.files).toContain('/src/app/app.config.ts');
    });

    it('loads and runs migrate-from-primeng', async () => {
        const runner = createRunner();
        const tree = await runner.runSchematic('migrate-from-primeng', { skipInstall: true, force: true }, createAppTree());
        expect(tree.files).toContain('/package.json');
    });
});
