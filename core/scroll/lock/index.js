import {
  clearAllBodyScrollLocks as reset,
  disableBodyScroll as disable,
  enableBodyScroll as enable,
} from "./custom";
export { ATTR_SCROLLGAP, fillGapsOf } from "./custom";
// import {
//   // clearAllBodyScrollLocks as clear
//   disableBodyScroll as disable,
//   enableBodyScroll as enable
// } from "body-scroll-lock";

// import {
//   disablePageScroll as disable,
//   enablePageScroll as enable,
//   addFillGapTarget
// } from "scroll-lock";
// export const fillGapOf = addFillGapTarget;

const scrollLock = {
  reset,
  disable,
  enable,
};

export default scrollLock;
