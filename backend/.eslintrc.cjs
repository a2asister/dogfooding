module.exports = {
  extends: '../.eslintrc.cjs',
  env: {
    node: true
  },
  parserOptions: {
    project: './tsconfig.json'
  },
  rules: {
    '@typescript-eslint/no-unsafe-argument': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off'
  }
};
