module.exports = {
  root: true ,
  env: {
    browser: true,
    es2021: true,
  },
  extends: [
    eslint:recommended
    'plugin:react/recommended',
    'airbnb',
    'prettier',
    "react-app",
    "react-app/jest",
    "plugin:import/errors",
    "plugin:import/warnings",
  ],
  overrides: [
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: [
    'react',
  ],
  rules: {
    'no-params-reassign':0,
    'import/prefer-default-export': 'off' || 'warn' || 'error',
    'react/prop-types': 'off',
    "react/jsx-filename-extension": [1, { "extensions": [".js", ".jsx"] }]

  },
};
