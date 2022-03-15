const info = require("./package.json");

process.env.VUE_APP_VERSION = info.version;
process.env.VUE_APP_HOMEPAGE = info.homepage;

module.exports = {
  devServer: {
    proxy: "http://localhost:" + (process.env.SERVER_PORT || 3000)
  },
  outputDir: "./dist/web",
  pages: {
    index: {
      entry: "./src/main.js",
      title: "F1 Tunisa"
    }
  },
  css: {
    loaderOptions: {
      scss: {
        prependData: "@import '@/assets/main.scss';"
      }
    }
  },
  pluginOptions: {
    electronBuilder: {
      outputDir: "./dist/electron",
      nodeIntegration: true,
      builderOptions: {
        appId: "app.netlify.f1tunisia",
        productName: "F1 Web Viewer",
        publish: ["github"],
        win: {
          target: ["nsis"]
        },
        mac: {
          category: "public.app-category.sports",
          target: ["dmg"]
        },
        linux: {
          category: "AudioVideo",
          target: ["AppImage"]
        },
        directories: {
          buildResources: "build"
        }
      }
    }
  },
  transpileDependencies: ["vue-grid-layout"]
};
