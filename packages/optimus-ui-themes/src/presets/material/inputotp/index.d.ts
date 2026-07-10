import type { InputOtpTokenSections } from '@openng/optimus-ui-themes/types/inputotp';

export * from '@openng/optimus-ui-themes/types/inputotp';

declare const root: InputOtpTokenSections.Root;
declare const input: InputOtpTokenSections.Input;
declare const css: InputOtpTokenSections.CSS;
declare const _default: {
    root: InputOtpTokenSections.Root;
    input: InputOtpTokenSections.Input;
    css: string;
};

export { css, _default as default, input, root };
