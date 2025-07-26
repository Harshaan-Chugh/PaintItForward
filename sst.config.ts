import { SSTConfig } from "sst";
import { PaintItForwardStack } from "./stacks/MyStack";

export default {
  config(_input) {
    return {
      name: "paintitforward",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(PaintItForwardStack);
  }
} satisfies SSTConfig;
