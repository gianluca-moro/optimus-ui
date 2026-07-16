import { describe, expect, it } from 'vitest';
import { mapModuleSpecifier } from './mappings';
import { getPrimengMajor, swapDependencies } from './package-json';

describe('mapModuleSpecifier', () => {
    it('maps primeng root and secondary entry points', () => {
        expect(mapModuleSpecifier('primeng')).toBe('@openng/optimus-ui');
        expect(mapModuleSpecifier('primeng/button')).toBe('@openng/optimus-ui/button');
        expect(mapModuleSpecifier('primeng/config')).toBe('@openng/optimus-ui/config');
    });

    it('maps the five @primeuix packages including subpaths', () => {
        expect(mapModuleSpecifier('@primeuix/themes')).toBe('@openng/optimus-ui-themes');
        expect(mapModuleSpecifier('@primeuix/themes/aura')).toBe('@openng/optimus-ui-themes/aura');
        expect(mapModuleSpecifier('@primeuix/styled')).toBe('@openng/optimus-ui-styled');
        expect(mapModuleSpecifier('@primeuix/styles')).toBe('@openng/optimus-ui-styles');
        expect(mapModuleSpecifier('@primeuix/utils')).toBe('@openng/optimus-ui-utils');
        expect(mapModuleSpecifier('@primeuix/motion')).toBe('@openng/optimus-ui-motion');
    });

    it('leaves unrelated specifiers alone', () => {
        expect(mapModuleSpecifier('primeicons/primeicons.css')).toBeNull();
        expect(mapModuleSpecifier('tailwindcss-primeui')).toBeNull();
        expect(mapModuleSpecifier('primeng-extensions')).toBeNull();
        expect(mapModuleSpecifier('@angular/core')).toBeNull();
    });
});

describe('swapDependencies', () => {
    it('replaces primeng and only the @primeuix packages that are present', () => {
        const pkg: Record<string, any> = {
            dependencies: {
                primeng: '^21.0.2',
                '@primeuix/themes': '^1.2.0',
                'tailwindcss-primeui': '^0.6.1',
                primeicons: '^7.0.0'
            }
        };
        const result = swapDependencies(pkg);
        expect(result.changed).toBe(true);
        expect(pkg.dependencies.primeng).toBeUndefined();
        expect(pkg.dependencies['@primeuix/themes']).toBeUndefined();
        expect(pkg.dependencies['@openng/optimus-ui']).toBe('^21.1.9');
        expect(pkg.dependencies['@openng/optimus-ui-themes']).toBe('^2.0.3');
        expect(pkg.dependencies['@openng/optimus-ui-styled']).toBeUndefined();
        expect(pkg.dependencies['tailwindcss-primeui']).toBe('^0.6.1');
        expect(pkg.dependencies['primeicons']).toBe('^7.0.0');
        expect(result.removed.sort()).toEqual(['@primeuix/themes', 'primeng']);
    });

    it('handles devDependencies and reports no change when nothing matches', () => {
        const pkg: Record<string, any> = {
            dependencies: { '@angular/core': '^21.0.0' },
            devDependencies: { '@primeuix/utils': '^1.0.0' }
        };
        const result = swapDependencies(pkg);
        expect(result.changed).toBe(true);
        expect(pkg.devDependencies['@openng/optimus-ui-utils']).toBe('^0.7.2');

        const clean: Record<string, any> = { dependencies: { '@angular/core': '^21.0.0' } };
        expect(swapDependencies(clean).changed).toBe(false);
    });
});

describe('getPrimengMajor', () => {
    it('extracts the first major from common range formats', () => {
        expect(getPrimengMajor({ dependencies: { primeng: '^21.0.2' } })).toBe(21);
        expect(getPrimengMajor({ dependencies: { primeng: '~19.1.0' } })).toBe(19);
        expect(getPrimengMajor({ devDependencies: { primeng: '>=20.0.0 <22' } })).toBe(20);
        expect(getPrimengMajor({ dependencies: { primeng: '21.0.0-rc.1' } })).toBe(21);
    });

    it('returns null when primeng is absent or unparseable', () => {
        expect(getPrimengMajor({ dependencies: {} })).toBeNull();
        expect(getPrimengMajor({})).toBeNull();
        expect(getPrimengMajor({ dependencies: { primeng: 'latest' } })).toBeNull();
    });
});
