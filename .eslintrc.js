const path = require('node:path')

module.exports = {
  root: true,
  ignorePatterns: ["**/*"],
  plugins: ["@nrwl/nx"],
  extends: ["airbnb", "airbnb-typescript", "airbnb/hooks"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./tsconfig.base.json"]
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.js", "*.jsx"],
      rules: {
        "@typescript-eslint/naming-convention": "off",
        "import/prefer-default-export": "off",
        "import/no-extraneous-dependencies": ["error", { packageDir: path.join(__dirname, "./") }],
        // merge airbnb-typescript with custom rules
        // https://github.com/iamturns/eslint-config-airbnb-typescript/blob/master/lib/shared.js#L183
        // references -- https://github.com/airbnb/javascript/blob/master/packages/eslint-config-airbnb-base/rules/variables.js#L51
        '@typescript-eslint/no-unused-vars': ['error',
          {
            vars: 'all',
            args: 'after-used',
            ignoreRestSiblings: true,
            // allow prefixing with an underscore to indicate unused
            argsIgnorePattern: "^_",
            varsIgnorePattern: "^_",
            caughtErrorsIgnorePattern: "^_"
          }
        ],
        // Don't think we need to follow this rule right now -- will have to think about our repo's setup
        // before determining if it makes sense to conform to this rule
        // https://github.com/nrwl/nx/issues/4829
        // "@nrwl/nx/enforce-module-boundaries": [
        //   "error",
        //   {
        //     "enforceBuildableLibDependency": true,
        //     "allow": [],
        //     "depConstraints": [
        //       {
        //         "sourceTag": "*",
        //         "onlyDependOnLibsWithTags": ["*"]
        //       }
        //     ]
        //   }
        // ]
      }
    }
  ]
}
