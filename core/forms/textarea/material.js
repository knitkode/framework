import Variant from "../variant/material";
import "./material.scss";

export default function FormsTextareaMaterial() {
  const variant = Variant(".textarea");

  return {
    destroy() {
      variant.destroy();
    },
  };
}
