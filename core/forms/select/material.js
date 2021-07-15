import Variant from "../variant/material";
import "./material.scss";

export default function FormsSelectMaterial() {
  const variant = Variant(".select");

  return {
    destroy() {
      variant.destroy();
    },
  };
}
