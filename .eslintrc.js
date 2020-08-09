module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    plugins: [
        '@typescript-eslint',
    ],
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    rules: {
        "eqeqeq": ["error", "always"],
        "no-promise-executor-return": "error",
        "no-template-curly-in-string": "error",
        "no-else-return": ["error", {allowElseIf: false}],
        "no-eval": "error",
        "no-implied-eval": "error",
        "no-loop-func": "error",
    },
    overrides: [
        {
            // Disabling non-null assertions checks in tests because we are asserting
            // them to be non-null with jest, the type system is just not aware of
            // that
            files: ["**/*.test.ts"],
            rules: {
                "@typescript-eslint/no-non-null-assertion": "off"
            }
        }
    ]
};
