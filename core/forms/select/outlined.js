import Variant from "../variant/outlined";
import "./outlined.scss";

export default function FormsSelectOutlined() {
  const variant = Variant(".select");

  return {
    destroy() {
      variant.destroy();
    },
  };
}
