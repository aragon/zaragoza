module.exports = {
  purge: ['./src/**/*.html', './src/**/*.tsx'],
  darkMode: false,
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#F5F8FF',
          100: '#C4D7FF',
          200: '#93B2FF',
          300: '#628CFE',
          400: '#3164FA',
          500: '#003BF5',
          600: '#0037D2',
          700: '#0031AD',
          800: '#002985',
          900: '#001F5C',
        },
        ui: {
          0: '#FFFFFF',
          50: '#F5F7FA',
          100: '#E4E7EB',
          200: '#CBD2D9',
          300: '#9AA5B1',
          400: '#7B8794',
          500: '#616E7C',
          600: '#52606D',
          700: '#3E4C59',
          800: '#323F4B',
          900: '#1F2933',
        },
        success: {
          100: '#F3FCCC',
          200: '#E4F99A',
          300: '#CCEF66',
          400: '#B2E040',
          500: '#8ECC0A',
          600: '#74AF07',
          700: '#5C9205',
          800: '#467603',
          900: '#366101',
        },
        critical: {
          100: '#FEE4D6',
          200: '#FEC3AE',
          300: '#FD9A86',
          400: '#FB7467',
          500: '#F93636',
          600: '#D62736',
          700: '#B31B35',
          800: '#901132',
          900: '#770A30',
        },
      },
      spacing: {
        0.5: '4px',
        1: '8px',
        1.5: '12px',
        2: '16px',
        2.5: '20px',
        3: '24px',
        4: '32px',
        5: '40px',
        6: '48px',
        8: '64px',
        10: '80px',
        14: '112px',
        25: '200px',
      },
    },
    screens: {
      tablet: '768px',
      desktop: '1440px',
      wide: '1920px',
    },
    fontFamily: {
      sans: ['Manrope'],
    },
    fluidType: {
      settings: {
        fontSizeMin: 1.125, // 1.125rem === 18px
        fontSizeMax: 1.25, // 1.25rem === 20px
        ratioMin: 1.125, // Multiplicator Min
        ratioMax: 1.25, // Multiplicator Max
        screenMin: 20, // 20rem === 320px
        screenMax: 96, // 96rem === 1536px
        unit: 'rem',
        prefix: '',
      },
      // Creates the text-xx classes
      // These are the default settings and analoguos to the tailwindcss'
      // default settings. Each `lineHeight` is set unitless
      values: {
        xs: [-2, 1.6],
        sm: [-1, 1.6],
        base: [0, 1.6],
        lg: [1, 1.6],
        xl: [2, 1.2],
        '2xl': [3, 1.2],
        '3xl': [4, 1.2],
        '4xl': [5, 1.1],
        '5xl': [6, 1.1],
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      borderColor: ['active', 'disabled'],
    },
    fluidType: ['responsive'],
  },
  plugins: [require('tailwindcss-fluid-type')],
};
