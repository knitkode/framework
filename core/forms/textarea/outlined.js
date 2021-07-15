import Variant from "../variant/outlined";
import "./outlined.scss";

export default function FormsTextareaOutlined() {
  const variant = Variant(".textarea");

  return {
    destroy() {
      variant.destroy();
    },
  };
}
