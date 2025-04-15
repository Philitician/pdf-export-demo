import { match } from "ts-pattern";

export const sizeMatch = (size: string) => {
  return match(size)
    .with("sm", () => ({ width: 10, height: 10 }))
    .with("md", () => ({ width: 20, height: 20 }))
    .with("lg", () => ({ width: 30, height: 30 }))
    .otherwise(() => ({ width: 40, height: 40 }));
};
