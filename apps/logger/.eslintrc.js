const path = require('node:path')

module.exports = {
  extends: ["../../.eslintrc.js"],
  ignorePatterns: ["!**/*"],
  parserOptions: {
    project: [path.join(__dirname,"tsconfig.app.json")]
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      rules: {}
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
