import "./index";
import Variant from "../variant/outlined";
import "./outlined.scss";

export default function FormsFileOutlined() {
  const variant = Variant(".file");

  return {
    destroy() {
      variant.destroy();
    },
  };
}
