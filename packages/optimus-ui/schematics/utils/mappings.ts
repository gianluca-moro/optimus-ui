export const MODULE_MAP: ReadonlyMap<string, string> = new Map([
    ['primeng', '@openng/optimus-ui'],
    ['@primeuix/themes', '@openng/optimus-ui-themes'],
    ['@primeuix/styled', '@openng/optimus-ui-styled'],
    ['@primeuix/styles', '@openng/optimus-ui-styles'],
    ['@primeuix/utils', '@openng/optimus-ui-utils'],
    ['@primeuix/motion', '@openng/optimus-ui-motion']
]);

export const IDENTIFIER_RENAMES: ReadonlyMap<string, string> = new Map([
    ['providePrimeNG', 'provideOptimus'],
    ['PrimeNG', 'Optimus'],
    ['PrimeNGConfigType', 'OptimusConfigType']
]);

// Baked at release time; bump when a replacement package releases a new major.
export const VERSIONS: Readonly<Record<string, string>> = {
    '@openng/optimus-ui': '^21.1.9',
    '@openng/optimus-ui-themes': '^2.0.3',
    '@openng/optimus-ui-styled': '^0.7.4',
    '@openng/optimus-ui-styles': '^2.0.3',
    '@openng/optimus-ui-utils': '^0.7.2',
    '@openng/optimus-ui-motion': '^0.0.10'
};

export function mapModuleSpecifier(spec: string): string | null {
    for (const [from, to] of MODULE_MAP) {
        if (spec === from) {
            return to;
        }
        if (spec.startsWith(from + '/')) {
            return to + spec.slice(from.length);
        }
    }
    return null;
}
