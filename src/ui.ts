import {
  WindowTemplate,
  WidgetCreator,
  FlexiblePosition,
  Parsed,
  vertical,
  horizontal,
  label,
  button,
  store,
  window,
  compute,
  WritableStore,
} from "openrct2-flexui";
import { awards } from "./awards";

type AwardWidget = WidgetCreator<FlexiblePosition, Parsed<FlexiblePosition>>;

interface AwardModel {
  name: WritableStore<string>;
  icon: WritableStore<number>;
  requirements: Array<RequirementResult>;
}

interface RequirementResult {
  text: WritableStore<string>;
  met: WritableStore<boolean>;
}

const viewmodel = {
  nextUpdate: 0,
  items: Array<AwardModel>(awards.length),
  container: Array<WidgetCreator<FlexiblePosition, Parsed<FlexiblePosition>>>(),

  check(): void {
    // Check only once per second...
    const tickCount = date.ticksElapsed;
    if (tickCount < this.nextUpdate) return;
    this.nextUpdate = tickCount + 40;

    //const start = new Date();
    this.redraw();
    //console.log(`Awards window updated in ${new Date().getTime() - start.getTime()}ms`);
  },

  redraw(): void {
    awards.forEach((award, i) => {
      award.requirements.forEach((req, j) => {
        //const start = new Date();
        const result = req();
        //const middle = new Date();
        this.items[i].requirements[j].text.set(result.text);
        this.items[i].requirements[j].met.set(result.met);
        //console.log(`req() took ${new Date().getTime() - start.getTime()}ms and set() took ${new Date().getTime() - middle.getTime()}ms`);
      });
    });
  },

  draw(): void {
    const newItems = Array<AwardModel>(awards.length);

    awards.forEach((award, i) => {
      newItems[i] = {
        name: store(award.formatName()),
        icon: store(award.icon),
        requirements: award.requirements.map((req) => {
          const result = req();
          return {
            text: store(result.text),
            met: store(result.met),
          };
        }),
      };
    });

    const horizontals = Array<AwardWidget>(awards.length);

    this.items = newItems;

    this.items.forEach((item, i) => {
      horizontals[i] = horizontal({
        padding: { top: 5 },
        content: [
          button({
            width: "30px",
            height: "30px",
            image: item.icon,
          }),
          vertical({
            content: [
              label({
                text: item.name,
              }),
              vertical({
                content: item.requirements.map((req) => {
                  return label({
                    text: compute(req.text, (val) => context.formatString(val)),
                  });
                }),
              }),
            ],
          }),
        ],
      });
    });

    this.container[0] = vertical({
      content: horizontals,
    });
  },
};

viewmodel.draw();

let template: WindowTemplate | undefined;
export function getAwardsWindow(): WindowTemplate {
  if (template) return template;

  return (template = window({
    width: 500,
    height: 400,
    title: "Award Eligibility",
    content: viewmodel.container,
    onUpdate: () => viewmodel.check(),
  }));
}
