module.exports = {
  pages: {
    index: "src/main.ts",
    background: "src/background/main.ts"
  },
  chainWebpack(config) {
    config.optimization.minimizer("terser").tap(options => {
      var [option] = options;
      option.terserOptions.compress = false;
      return options;
    });
  }
};
