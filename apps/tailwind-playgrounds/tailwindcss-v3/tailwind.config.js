import OptimusUiTailwind from '@openng/optimus-ui-tailwindcss';

/** @type {import('tailwindcss').Config} */
export default {
    content: ['index.html'],
    theme: {
        extend: {
            colors: {}
        }
    },
    plugins: [OptimusUiTailwind]
};
