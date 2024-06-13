const path = require('node:path');

module.exports = {
  extends: ["../../.eslintrc.js"],
  ignorePatterns: ["!**/*"],
  parserOptions: {
    project: [path.join(__dirname, "tsconfig.lib.json"), path.join(__dirname, "tsconfig.spec.json")]
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      rules: {}
      // if you're tempted to disable radix here...
      // radix doesn't always default to 10, so for additional safety, always specify the radix as 10
      // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/parseInt#description
    },
    {
      files: ["*.ts", "*.tsx"],
      rules: {}
    },
    {
      files: ["*.js", "*.jsx"],
      rules: {}
    }
  ]
}
