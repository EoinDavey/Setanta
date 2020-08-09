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
        eqeqeq: ["error", "always"]
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
