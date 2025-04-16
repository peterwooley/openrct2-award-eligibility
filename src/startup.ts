import { getAwardsWindow } from "./ui";

export function startup() {
  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Award Eligibility", () => {
      getAwardsWindow().open();
    });
  }
}
