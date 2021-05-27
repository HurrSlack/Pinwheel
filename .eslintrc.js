module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
    "jest/globals": true
  },
  extends: ["eslint:recommended", "prettier"],
  parserOptions: {
    ecmaVersion: 12,
  },
  plugins: ["jest"],
  rules: {},
};
