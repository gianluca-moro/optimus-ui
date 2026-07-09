import type { InplaceTokenSections } from '@openng/optimus-ui-themes/types/inplace';

export * from '@openng/optimus-ui-themes/types/inplace';

declare const root: InplaceTokenSections.Root;
declare const display: InplaceTokenSections.Display;
declare const _default: {
    root: InplaceTokenSections.Root;
    display: InplaceTokenSections.Display;
};

export { _default as default, display, root };
