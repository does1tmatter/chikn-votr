module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        shadows: 'Abril Fatface'
      },
      colors: {
        red: {
          50: '#ECF0F8',
          100: '#DAE1F1',
          200: '#B4C2E4',
          300: '#8FA4D6',
          400: '#6986C9',
          500: '#4366BA',
          600: '#365396',
          700: '#293E70',
          800: '#1B294B',
          900: '#0E1525'
        },
        gold: {
          50: '#FFFBF0',
          100: '#FEF7E1',
          200: '#FEEFC3',
          300: '#FDE6A0',
          400: '#FCDE82',
          500: '#FBD255',
          600: '#F4B906',
          700: '#D6A205',
          800: '#B38804',
          900: '#826203'
        }
      }
    }
  },
  plugins: [],
}