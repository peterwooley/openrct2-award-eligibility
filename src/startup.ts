import { getAwardsWindow } from "./ui";

export function startup() {
  if (typeof ui !== "undefined") {
    ui.registerMenuItem("Award Eligibility", () => {
      getAwardsWindow().open();
    });

    ui.registerShortcut({
			id: "oae.window",
			text: "Show award eligibility",
			bindings: ["Shift+A"],
			callback: function() {
				getAwardsWindow().open();
			},
		});
  }
}
