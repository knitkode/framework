import Variant from "../variant/outlined";
import "./outlined.scss";

export default function FormsInputOutlined() {
  const variant = Variant(".input");

  return {
    destroy() {
      variant.destroy();
    },
  };
}
