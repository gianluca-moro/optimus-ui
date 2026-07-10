import type { VirtualScrollerDesignTokens, VirtualScrollerTokenSections } from '@openng/optimus-ui-themes/types/virtualscroller';

export const loader: VirtualScrollerTokenSections.Loader = {
    mask: {
        background: '{content.background}',
        color: '{text.muted.color}'
    },
    icon: {
        size: '2rem'
    }
};

export default {
    loader
} satisfies VirtualScrollerDesignTokens;
