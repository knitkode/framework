import { device } from "./device";
import { detect } from "./index";

const { phone } = device();

export const isPhone = phone;

export function detectPhone() {
  return detect(() => ["phone", phone], "is", "is-not");
}
