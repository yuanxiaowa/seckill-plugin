module.exports = {
  pages: {
    index: "src/main.ts",
    background: "src/background/main.ts",
  },
  filenameHashing: false,
  chainWebpack(config) {
    config.optimization.minimize(false);
    // config.plugins.delete("uglify");
    // config.optimization.minimizers.delete("terser");
    // config.optimization.minimizers.delete("splitChunks");
    // config.optimization.minimizer("terser").tap((options) => {
    //   var [option] = options;
    //   option.terserOptions.compress = {
    //     arrows: false,
    //     collapse_vars: false,
    //     comparisons: false,
    //     computed_props: false,
    //     hoist_funs: false,
    //     hoist_props: false,
    //     hoist_vars: false,
    //     inline: false,
    //     loops: false,
    //     negate_iife: false,
    //     properties: false,
    //     reduce_funcs: false,
    //     reduce_vars: false,
    //     switches: false,
    //     toplevel: false,
    //     typeofs: false,
    //     booleans: true,
    //     if_return: true,
    //     sequences: true,
    //     unused: true,
    //     conditionals: true,
    //     dead_code: true,
    //     evaluate: true,
    //   };
    //   console.log(option);
    //   return options;
    // });
    // config.optimization.clear();
  },
};
