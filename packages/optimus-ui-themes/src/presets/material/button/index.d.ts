import type { StyleOptions } from '@openng/optimus-ui-styled';
import type { ButtonTokenSections } from '@openng/optimus-ui-themes/types/button';

export * from '@openng/optimus-ui-themes/types/button';

declare const root: ButtonTokenSections.Root;
declare const colorScheme: ButtonTokenSections.ColorScheme;
declare const css: ButtonTokenSections.CSS;
declare const _default: {
    root: ButtonTokenSections.Root;
    colorScheme: ButtonTokenSections.ColorScheme;
    css: (options: StyleOptions) => string;
};

export { colorScheme, css, _default as default, root };
