import { createApp } from "./app.js";
import { env } from "./config/env.js";

const app = createApp();

app.listen(env.port, () => {
  console.info(`Investor Portal API listening on port ${env.port}`);
});

