import Variant from "../variant/material";
import "./material.scss";

export default function FormsInputMaterial() {
  const variant = Variant(".input");

  return {
    destroy() {
      variant.destroy();
    },
  };
}
