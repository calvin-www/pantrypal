module.exports = {
    presets: ["next/babel"],
    plugins: [
        ["@babel/plugin-transform-runtime",
            {
                regenerator: true,
                helpers: true,
                useESModules: false
            }
        ]
    ]
};