import type { PopoverTokenSections } from '@openng/optimus-ui-themes/types/popover';

export * from '@openng/optimus-ui-themes/types/popover';

declare const root: PopoverTokenSections.Root;
declare const content: PopoverTokenSections.Content;
declare const css: PopoverTokenSections.CSS;
declare const _default: {
    root: PopoverTokenSections.Root;
    content: PopoverTokenSections.Content;
    css: string;
};

export { content, css, _default as default, root };
