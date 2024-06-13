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
    },
    {
      files: ["*.ts", "*.tsx"],
      rules: {}
    },
    {
      files: ["*.js", "*.jsx"],
      rules: {}
    },
    {
      files: ["test/*.ts"],
      rules: {
        "import/no-extraneous-dependencies": "off",
      }
    },
    {
      files: ["test/global(Setup|Teardown).ts"],
      rules: {
        "no-console": "off",
      },
    },
  ]
}
