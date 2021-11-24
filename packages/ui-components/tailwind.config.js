module.exports = {
  purge: ['./src/**/*.html', './src/**/*.tsx'],
  darkMode: false, // or 'media' or 'class'
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
  },
  variants: {
    extend: {
      backgroundColor: ['active', 'disabled'],
      textColor: ['active', 'disabled'],
      borderColor: ['active', 'disabled'],
    },
  },
  plugins: [],
};
