import type { StyleOptions } from '@openng/optimus-ui-styled';
import type { TextareaTokenSections } from '@openng/optimus-ui-themes/types/textarea';

export * from '@openng/optimus-ui-themes/types/textarea';

declare const root: TextareaTokenSections.Root;
declare const css: TextareaTokenSections.CSS;
declare const _default: {
    root: TextareaTokenSections.Root;
    css: (options: StyleOptions) => string;
};

export { css, _default as default, root };
