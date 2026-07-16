import { describe, expect, it } from 'vitest';
import { addDefaultImport } from './app-config';

describe('addDefaultImport', () => {
    it('inserts after the last import statement', () => {
        const input = `import { ApplicationConfig } from '@angular/core';\n` + `import { provideRouter } from '@angular/router';\n\n` + `export const appConfig: ApplicationConfig = {\n` + `    providers: [provideRouter([])]\n` + `};\n`;
        const result = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(result).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        // inserted after the last import, before the blank line / export statement
        const lines = result.split('\n');
        const auraIndex = lines.findIndex((line) => line.includes('Aura'));
        const routerIndex = lines.findIndex((line) => line.includes('provideRouter'));
        expect(auraIndex).toBeGreaterThan(routerIndex);
        expect(result).toContain(`export const appConfig`);
    });

    it('prepends the import when the file has no imports', () => {
        const input = `export const appConfig = {\n    providers: []\n};\n`;
        const result = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(result.startsWith(`import Aura from '@openng/optimus-ui-themes/aura';\n`)).toBe(true);
        expect(result).toContain(`export const appConfig`);
    });

    it('is idempotent when the default import is already present', () => {
        const input = `import Aura from '@openng/optimus-ui-themes/aura';\nexport const appConfig = { providers: [] };\n`;
        expect(addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura')).toBe(input);
    });

    it('does not treat a same-named import from a different module as already present', () => {
        const input = `import Aura from 'some-other-package/aura';\nexport const appConfig = { providers: [] };\n`;
        const result = addDefaultImport(input, 'Aura', '@openng/optimus-ui-themes/aura');
        expect(result).toContain(`import Aura from '@openng/optimus-ui-themes/aura';`);
        expect(result).toContain(`import Aura from 'some-other-package/aura';`);
    });
});
