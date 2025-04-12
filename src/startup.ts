import { getAwardsWindow } from "./ui";

export function startup() {
  // Register a menu item under the map icon:
  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Award Eligibility", () => {
      // Show the awards window when the player clicks the menu item under the map icon.
      getAwardsWindow().open();
    });
  }
}
