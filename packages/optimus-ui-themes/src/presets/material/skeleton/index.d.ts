import type { SkeletonTokenSections } from '@openng/optimus-ui-themes/types/skeleton';

export * from '@openng/optimus-ui-themes/types/skeleton';

declare const root: SkeletonTokenSections.Root;
declare const colorScheme: SkeletonTokenSections.ColorScheme;
declare const css: SkeletonTokenSections.CSS;
declare const _default: {
    root: SkeletonTokenSections.Root;
    colorScheme: SkeletonTokenSections.ColorScheme;
    css: string;
};

export { colorScheme, css, _default as default, root };
