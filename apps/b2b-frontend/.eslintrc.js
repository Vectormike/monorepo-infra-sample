const path = require('node:path');

module.exports = {
  extends: ["../../.eslintrc.js"],
  ignorePatterns: ["!**/*", "**/*.stories.tsx"],
  parserOptions: {
    project: [path.join(__dirname, "tsconfig.app.json"), path.join(__dirname, "tsconfig.spec.json")]
  },
  overrides: [
    {
      "files": ["*.ts", "*.tsx", "*.js", "*.jsx"],
      "rules": {
        "max-len": [
          "error",
          {
            "ignoreStrings": true,
            "ignoreTemplateLiterals": true,
            "code": 160
          }
        ],
        "react/destructuring-assignment": 0,
        "react/function-component-definition": 0,
        "react/react-in-jsx-scope": 0,
        "react/jsx-no-useless-fragment": 0,
        "react/jsx-props-no-spreading": 0,
        "react/no-array-index-key": 0,
        "react-hooks/exhaustive-deps": 0,
        "import/no-extraneous-dependencies": 0,
        "import/prefer-default-export": 0,
        "no-param-reassign": 0,
        "jsx-a11y/label-has-associated-control": 0,
        "jsx-a11y/click-events-have-key-events": 0,
        "jsx-a11y/interactive-supports-focus": 0,
        "import/no-cycle": 0,
        "no-plusplus": 0,
        "react/prop-types": 0,
        "react/button-has-type": 0,
        "react/no-unused-prop-types": 0,
        "global-require": 0,
        "no-nested-ternary": 0,
        "no-else-return": 0,
        "array-callback-return": 0,
        "no-use-before-define": "off",
        "@typescript-eslint/no-use-before-define": ["error"],
        "no-shadow": "off",
        "@typescript-eslint/no-shadow": ["error"],
        "react/require-default-props": "off",
        "react/jsx-filename-extension": ["warn", { "extensions": [".tsx"] }],
        "@typescript-eslint/no-empty-function": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-console": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/ban-ts-comment": "off",
        "comma-dangle": "off",
        "@typescript-eslint/comma-dangle": "off",
        "indent": "off",
        "@typescript-eslint/indent": "error"
      }
    }
  ]
}
