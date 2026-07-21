export const MODULE_MAP: ReadonlyMap<string, string> = new Map([
    ['primeng', '@openng/optimus-ui'],
    ['primeicons', '@openng/icons'],
    ['@primeuix/themes', '@openng/optimus-ui-themes'],
    ['@primeuix/styled', '@openng/optimus-ui-styled'],
    ['@primeuix/styles', '@openng/optimus-ui-styles'],
    ['@primeuix/utils', '@openng/optimus-ui-utils'],
    ['@primeuix/motion', '@openng/optimus-ui-motion']
]);

// Files that were renamed inside a package, so the prefix mapping alone would produce a
// broken path. Checked before MODULE_MAP for module specifiers, and applied verbatim to
// stylesheets and angular.json/project.json (e.g. "node_modules/primeicons/primeicons.css").
export const SPECIFIER_RENAMES: ReadonlyMap<string, string> = new Map([['primeicons/primeicons.css', '@openng/icons/openng-icons.css']]);

export const IDENTIFIER_RENAMES: ReadonlyMap<string, string> = new Map([
    ['providePrimeNG', 'provideOptimus'],
    ['PrimeNG', 'Optimus'],
    ['PrimeNGConfigType', 'OptimusConfigType'],
    // The icon constants class was renamed alongside the primeicons -> @openng/icons package.
    // @openng/optimus-ui/api keeps a deprecated PrimeIcons alias, so unmigrated code still
    // compiles, but rewriting to OpenngIcons moves users onto the current API.
    ['PrimeIcons', 'OpenngIcons']
]);

// Baked at release time; bump when a replacement package releases a new major.
export const VERSIONS: Readonly<Record<string, string>> = {
    '@openng/optimus-ui': '^21.1.9',
    '@openng/icons': '^1.0.0',
    '@openng/optimus-ui-themes': '^2.0.3',
    '@openng/optimus-ui-styled': '^0.7.4',
    '@openng/optimus-ui-styles': '^2.0.3',
    '@openng/optimus-ui-utils': '^0.7.2',
    '@openng/optimus-ui-motion': '^0.0.10'
};

export function mapModuleSpecifier(spec: string): string | null {
    const renamed = SPECIFIER_RENAMES.get(spec);
    if (renamed !== undefined) {
        return renamed;
    }
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
