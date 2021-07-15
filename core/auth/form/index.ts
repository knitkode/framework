import { setTimezone } from "../timezone";
import { updateFormsRedirectFromUrl } from "../redirect";

export function AuthForm() {
  setTimezone();
  updateFormsRedirectFromUrl();
}
