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
  tabwindow,
  tab,
  compute,
  WritableStore,
  TabCreator,
  Colour,
} from "openrct2-flexui";
import { AwardsManager } from "./awards";

type AwardWidget = WidgetCreator<FlexiblePosition, Parsed<FlexiblePosition>>;

interface AwardCategoriesModel {
  [category: string]: AwardModel[];
}

interface AwardModel {
  name: WritableStore<string>;
  icon: WritableStore<number>;
  requirements: Array<RequirementResult>;
}

interface RequirementResult {
  text: WritableStore<string>;
  met: WritableStore<boolean>;
}

const awardsCategories = AwardsManager.getCategorizedAwards();

const viewModel = {
  nextUpdate: 0,
  currentTab: 0,
  items: {} as AwardCategoriesModel,
  container: Array<TabCreator>(),

  check(force: boolean = false): void {
    // Check only once per second...
    const tickCount = date.ticksElapsed;
    if (force || tickCount < this.nextUpdate) return;
    this.nextUpdate = tickCount + 40;

    //const start = new Date();
    this.redraw();
    //console.log(`Awards window updated in ${new Date().getTime() - start.getTime()}ms`);
  },

  redraw(): void {
    AwardsManager.updateState();
    for (var i = 0; i < awardsCategories.length; i++) {
      var category = awardsCategories[i];
      if (this.currentTab !== i) continue;

      for (var j = 0; j < category.awards.length; j++) {
        var award = category.awards[j];
        var isEligible = true;

        for (var k = 0; k < award.requirements.length; k++) {
          var req = award.requirements[k];
          //const start = new Date();
          const result = req();
          if (!result.met) {
            isEligible = false;
          }

          //const middle = new Date();
          this.items[category.id][j].requirements[k].text.set(result.text);
          this.items[category.id][j].requirements[k].met.set(result.met);
          // console.log(
          //   `${award.name}: req() took ${
          //     new Date().getTime() - start.getTime()
          //   }ms and set() took ${new Date().getTime() - middle.getTime()}ms`
          // );
        }

        this.items[category.id][j].name.set(award.formatName(isEligible));
      }
    }
  },

  draw(): void {
    //const start = new Date();
    AwardsManager.updateState();
    const categorizedAwardModels: AwardCategoriesModel = {};
    AwardsManager.getCategorizedAwards().forEach((category) => {
      categorizedAwardModels[category.id] = category.awards.map((award) => ({
        name: store(award.formatName(award.isEligible())),
        icon: store(award.icon),
        requirements: award.requirements.map((req) => {
          const result = req();
          return {
            text: store(result.text),
            met: store(result.met),
          };
        }),
      }));
    });

    this.items = categorizedAwardModels;

    for (let category of AwardsManager.getCategorizedAwards()) {
      const awardsWidgets: AwardWidget[] = [];
      const awardModels = categorizedAwardModels[category.id];

      awardModels.forEach((awardModel) => {
        awardsWidgets.push(
          horizontal({
            padding: { top: 5 },
            content: [
              button({
                width: "30px",
                height: "30px",
                image: awardModel.icon,
              }),
              vertical({
                content: [
                  label({
                    text: awardModel.name,
                  }),
                  vertical({
                    content: awardModel.requirements.map((req) => {
                      return label({
                        text: compute(req.text, (val) => context.formatString(val)),
                      });
                    }),
                  }),
                ],
              }),
            ],
          })
        );
      });

      this.container.push(
        tab({
          image: category.image,
          content: awardsWidgets,
        })
      );
    }

    //console.log(`Awards window drawn in ${new Date().getTime() - start.getTime()}ms`);
  },
  updateTab(tabIndex: number): void {
    this.currentTab = tabIndex;
    this.check(true);
  },
};

viewModel.draw();

let template: WindowTemplate | undefined;
export function getAwardsWindow(): WindowTemplate {
  if (template) return template;

  return (template = tabwindow({
    width: 480,
    height: "auto",
    padding: {top: 5, left: 5, right: 10, bottom: 10},
    title: "Award Eligibility",
    colours: [Colour.Grey, Colour.DarkYellow, Colour.Yellow],
    tabs: viewModel.container,
    onTabChange: (tab) => viewModel.updateTab(tab),
    onUpdate: () => viewModel.check(),
  }));
}
