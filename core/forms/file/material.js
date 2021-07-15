import "./index";
import Variant from "../variant/material";
import "./material.scss";

export default function FormsFileMaterial() {
  const variant = Variant(".file");

  return {
    destroy() {
      variant.destroy();
    },
  };
}
