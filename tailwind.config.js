/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [],
  theme: {
    extend: {
      typography: theme => ({
        DEFAULT: {
          css: {
            '--tw-prose-pre-bg': theme('colors.stone[50]'),
            '--tw-prose-invert-pre-bg': theme('colors.slate[700]'),
            "div.code-group pre": {
              margin: "0",
              padding: "0",
              '--tw-prose-pre-bg': 'transparent',
              '--tw-prose-invert-pre-bg': 'transparent',
            },
            "input": {    
              display: 'block',
              fontSize: '.9rem',
              padding: '.5em 1em .4em',
              border: '1px solid #e2e2e3',
              borderRadius: '4px',
              outline: 'none',
              margin: '.5rem 0',
            },
            "input:focus": {    
              border: '1px solid #c2c2c4 !important',
            },
            ".dark input": {    
              color: '#374151',
            }
          },
        }
      }),
      aspectRatio: {
        '16/9': '16 / 9',
        '2/1': '2 / 1',
        '1/1': '1 / 1',
      }
    }, 
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}

