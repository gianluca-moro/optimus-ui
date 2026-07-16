import { describe, expect, it } from 'vitest';
import { rewriteSource } from './rewrite';

const rw = (text: string) => rewriteSource('/src/test.ts', text);

describe('rewriteSource — module specifiers', () => {
    it('rewrites primeng and @primeuix import paths', () => {
        const { text, changed } = rw(`import { ButtonModule } from 'primeng/button';\n` + `import { MessageService } from 'primeng/api';\n` + `import Aura from '@primeuix/themes/aura';\n`);
        expect(changed).toBe(true);
        expect(text).toContain(`from '@openng/optimus-ui/button'`);
        expect(text).toContain(`from '@openng/optimus-ui/api'`);
        expect(text).toContain(`import Aura from '@openng/optimus-ui-themes/aura'`);
    });

    it('rewrites export-from and dynamic import()', () => {
        const { text } = rw(`export { ButtonModule } from 'primeng/button';\n` + `const mod = await import('primeng/chart');\n`);
        expect(text).toContain(`export { ButtonModule } from '@openng/optimus-ui/button'`);
        expect(text).toContain(`import('@openng/optimus-ui/chart')`);
    });

    it('preserves quote style and leaves unrelated modules untouched', () => {
        const { text } = rw(`import { X } from "primeng/table";\nimport 'tailwindcss-primeui';\n`);
        expect(text).toContain(`from "@openng/optimus-ui/table"`);
        expect(text).toContain(`import 'tailwindcss-primeui';`);
    });

    it('rewrites the primeicons stylesheet import to the renamed file', () => {
        const { text, changed } = rw(`import 'primeicons/primeicons.css';\n`);
        expect(changed).toBe(true);
        expect(text).toContain(`import '@openng/icons/openng-icons.css';`);
    });

    it('reports changed: false for untouched files', () => {
        const input = `import { Component } from '@angular/core';\n`;
        const result = rw(input);
        expect(result.changed).toBe(false);
        expect(result.text).toBe(input);
    });
});

describe('rewriteSource — identifier renames', () => {
    it('renames providePrimeNG import and its usages', () => {
        const { text } = rw(`import { providePrimeNG } from 'primeng/config';\n` + `export const appConfig = { providers: [providePrimeNG({ ripple: true })] };\n`);
        expect(text).toContain(`import { provideOptimus } from '@openng/optimus-ui/config'`);
        expect(text).toContain(`provideOptimus({ ripple: true })`);
        expect(text).not.toContain('providePrimeNG');
    });

    it('renames the PrimeNG class and PrimeNGConfigType, including type positions', () => {
        const { text } = rw(`import { PrimeNG, PrimeNGConfigType } from 'primeng/config';\n` + `import { inject } from '@angular/core';\n` + `const config: PrimeNGConfigType = {};\n` + `const svc = inject(PrimeNG);\n`);
        expect(text).toContain(`import { Optimus, OptimusConfigType } from '@openng/optimus-ui/config'`);
        expect(text).toContain(`const config: OptimusConfigType = {}`);
        expect(text).toContain(`inject(Optimus)`);
    });

    it('only rewrites the imported name for aliased imports', () => {
        const { text } = rw(`import { PrimeNG as Cfg } from 'primeng/config';\n` + `const svc: Cfg = null!;\n`);
        expect(text).toContain(`import { Optimus as Cfg } from '@openng/optimus-ui/config'`);
        expect(text).toContain(`const svc: Cfg = null!;`);
    });

    it('does not rename identifiers that are not imported from primeng', () => {
        const { text, changed } = rw(`class PrimeNG {}\nconst x = new PrimeNG();\n`);
        expect(changed).toBe(false);
        expect(text).toContain('class PrimeNG {}');
    });

    it('renames the PrimeIcons constants class and its usages', () => {
        const { text } = rw(`import { PrimeIcons } from 'primeng/api';\n` + `const item = { icon: PrimeIcons.PLUS };\n`);
        expect(text).toContain(`import { OpenngIcons } from '@openng/optimus-ui/api'`);
        expect(text).toContain(`icon: OpenngIcons.PLUS`);
        expect(text).not.toContain('PrimeIcons');
    });

    it('does not touch strings, comments, or property names', () => {
        const { text } = rw(`import { PrimeNG } from 'primeng/config';\n` + `// PrimeNG is great\n` + `const label = 'PrimeNG';\n` + `const obj = { PrimeNG: 1 };\n` + `const y = obj.PrimeNG;\n` + `const svc = new PrimeNG();\n`);
        expect(text).toContain(`// PrimeNG is great`);
        expect(text).toContain(`const label = 'PrimeNG';`);
        expect(text).toContain(`const obj = { PrimeNG: 1 };`);
        expect(text).toContain(`const y = obj.PrimeNG;`);
        expect(text).toContain(`const svc = new Optimus();`);
    });

    it('expands shorthand property usages', () => {
        const { text } = rw(`import { PrimeNG } from 'primeng/config';\nconst box = { PrimeNG };\n`);
        expect(text).toContain(`const box = { PrimeNG: Optimus };`);
    });

    it('renames re-exports', () => {
        const { text } = rw(`export { providePrimeNG } from 'primeng/config';\n`);
        expect(text).toContain(`export { provideOptimus } from '@openng/optimus-ui/config';`);
    });

    it('renames a local re-export of the imported symbol', () => {
        const { text } = rw(`import { PrimeNG } from 'primeng/config';\nexport { PrimeNG };\n`);
        expect(text).toContain(`export { Optimus };`);
        expect(text).not.toMatch(/\bPrimeNG\b/);
    });

    it('renames an aliased local re-export of the imported symbol', () => {
        const { text } = rw(`import { PrimeNG } from 'primeng/config';\nexport { PrimeNG as Legacy };\n`);
        expect(text).toContain(`export { Optimus as Legacy };`);
    });

    it('leaves a pure export alias untouched', () => {
        const { text } = rw(`import { PrimeNG } from 'primeng/config';\n` + `const x = new PrimeNG();\n` + `export { x as PrimeNG };\n`);
        expect(text).toContain(`export { x as PrimeNG };`);
        expect(text).toContain(`const x = new Optimus();`);
    });

    it('falls back to an aliased import when the original name is shadowed elsewhere', () => {
        const { text } = rw(`import { PrimeNG } from 'primeng/config';\n` + `const svc = new PrimeNG();\n` + `function g(PrimeNG: number) { return PrimeNG + 1; }\n`);
        expect(text).toContain(`import { Optimus as PrimeNG } from '@openng/optimus-ui/config';`);
        expect(text).toContain(`const svc = new PrimeNG();`);
        expect(text).toContain(`function g(PrimeNG: number) { return PrimeNG + 1; }`);
    });

    it('does not corrupt a destructuring property key that matches the imported name', () => {
        const { text } = rw(`import { PrimeNG } from 'primeng/config';\n` + `const { PrimeNG: renamed } = getObj();\n` + `const svc = new PrimeNG();\n`);
        expect(text).toContain(`const { PrimeNG: renamed } = getObj();`);
        expect(text).toContain(`const svc = new Optimus();`);
    });
});
