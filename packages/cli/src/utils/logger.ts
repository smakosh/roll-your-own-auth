import { blue, bold, cyan, dim, green, red, yellow } from "kleur/colors";

export const logger = {
  info: (msg: string) => console.log(`${cyan("info")} ${msg}`),
  success: (msg: string) => console.log(`${green("✔")} ${msg}`),
  warn: (msg: string) => console.log(`${yellow("warn")} ${msg}`),
  error: (msg: string) => console.error(`${red("✖")} ${msg}`),
  step: (msg: string) => console.log(`${blue("›")} ${msg}`),
  plain: (msg: string) => console.log(msg),
  dim: (msg: string) => console.log(dim(msg)),
  break: () => console.log(""),
};

export const highlight = (msg: string) => bold(cyan(msg));
