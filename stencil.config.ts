import { Config } from "@stencil/core";

export const config: Config = {
  namespace: "my-components",
  taskQueue: "async",
  globalStyle: "src/global/style.css",
  outputTargets: [
    {
      type: "dist",
      esmLoaderPath: "../loader",
    },
    {
      type: "docs-readme",
    },
    {
      type: "www",
      serviceWorker: null, // disable service workers
    },
  ],
};
