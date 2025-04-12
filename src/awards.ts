export class Award {
  name: string;
  icon: number;
  requirements: (() => { text: string; met: boolean })[];

  constructor(params: {
    name: string;
    icon: number;
    requirements: (() => { text: string; met: boolean })[];
  }) {
    this.name = params.name;
    this.icon = params.icon;
    this.requirements = params.requirements;
  }

  isEligible(): boolean {
    return this.requirements.every((requirement) => requirement().met);
  }

  formatName(): string {
    return this.isEligible() ? `{GREEN}${this.name}` : this.name;
  }
}

function status(string: string, met: boolean): string {
  return met
    ? `{INLINE_SPRITE}{161}{15}{00}{00} ${string}`
    : `{INLINE_SPRITE}{162}{15}{00}{00}  ${string}`;
}

// Individual award instances
const bestParkToiletsAward = new Award({
  name: "Best park toilets award",
  icon: 5479,
  requirements: [
    () => {
      const restrooms = map.rides.filter((ride) => ride.type === 36); // 36 = Restroom ID
      const met = restrooms.length >= 4;
      return {
        text: status(`${restrooms.length} of 4 required restrooms`, met),
        met,
      };
    },
    () => {
      const guests = map.getAllEntities("guest");
      const restrooms = map.rides.filter((ride) => ride.type === 36); // 36 = Restroom ID
      const met = restrooms.length >= guests.length / 128;
      return {
        text: status(
          `1 restroom per 128 guests (Currently: ${(
            restrooms.length /
            (guests.length / 128)
          ).toFixed(2)})`,
          met
        ),
        met,
      };
    },
    () => {
      const guests = map.getAllEntities("guest");

      const guestsNeedingRestroom = guests.filter((guest) =>
        guest.thoughts.some(
          (thought) => thought.freshness <= 5 && thought.type === "toilet"
        )
      );

      const met = guestsNeedingRestroom.length <= 16;

      return {
        text: status(
          `16 or fewer guests needing bathroom (Currently: ${guestsNeedingRestroom.length})`,
          met
        ),
        met,
      };
    },
  ],
});

const mostUntidyParkAward = new Award({
  name: "Most untidy park award",
  icon: 5469,
  requirements: [
    () => {
      let negativeCount = 0;
      const guests = map.getAllEntities("guest");
      for (const guest of guests) {
        for (const thought of guest.thoughts) {
          if (
            thought.freshness <= 5 &&
            (thought.type == "bad_litter" ||
              thought.type == "path_disgusting" ||
              thought.type == "vandalism")
          ) {
            negativeCount++;
          }
        }
      }
      const met = negativeCount > park.guests / 16;
      return {
        text: status(
          `More than ${Math.floor(
            park.guests / 16
          )} (1/16th) of the guests think the park is untidy (Currently: ${negativeCount})`,
          met
        ),
        met,
      };
    },
  ],
});

const tidiestParkAward = new Award({
  name: "Tidiest park award",
  icon: 5470,
  requirements: [
    () => {
      const guests = map.getAllEntities("guest");
      let negativeCount = 0;
      for (const guest of guests) {
        for (const thought of guest.thoughts) {
          if (
            thought.freshness <= 5 &&
            (thought.type == "bad_litter" ||
              thought.type == "path_disgusting" ||
              thought.type == "vandalism")
          ) {
            negativeCount++;
          }
        }
      }

      const met = negativeCount <= 5;
      return {
        text: status(
          `6 or fewer guests think the park is untidy (Currently: ${negativeCount})`,
          met
        ),
        met,
      };
    },
    () => {
      const guests = map.getAllEntities("guest");
      let positiveCount = 0;
      for (const guest of guests) {
        for (const thought of guest.thoughts) {
          if (thought.freshness <= 5 && thought.type == "very_clean") {
            positiveCount++;
          }
        }
      }

      const met = positiveCount > park.guests / 64;
      return {
        text: status(
          `More than ${Math.floor(
            park.guests / 64
          )} (1/64th) of the guests think the park is tidy (Currently: ${positiveCount})`,
          met
        ),
        met,
      };
    },
  ],
});

// TODO: Filter all rides to find roller coasters that haven't crashed
// Use this to find roller coasters
// enum
// {
//   RIDE_TYPE_SPIRAL_ROLLER_COASTER = 0,
//   RIDE_TYPE_STAND_UP_ROLLER_COASTER,
//   RIDE_TYPE_SUSPENDED_SWINGING_COASTER,
//   RIDE_TYPE_INVERTED_ROLLER_COASTER,
//   RIDE_TYPE_JUNIOR_ROLLER_COASTER,
//   RIDE_TYPE_MINIATURE_RAILWAY,
//   RIDE_TYPE_MONORAIL,
//   RIDE_TYPE_MINI_SUSPENDED_COASTER,
//   RIDE_TYPE_BOAT_HIRE,
//   RIDE_TYPE_WOODEN_WILD_MOUSE,
//   RIDE_TYPE_STEEPLECHASE = 10,
//   RIDE_TYPE_CAR_RIDE,
//   RIDE_TYPE_LAUNCHED_FREEFALL,
//   RIDE_TYPE_BOBSLEIGH_COASTER,
//   RIDE_TYPE_OBSERVATION_TOWER,
//   RIDE_TYPE_LOOPING_ROLLER_COASTER,
//   RIDE_TYPE_DINGHY_SLIDE,
//   RIDE_TYPE_MINE_TRAIN_COASTER,
//   RIDE_TYPE_CHAIRLIFT,
//   RIDE_TYPE_CORKSCREW_ROLLER_COASTER,
//   RIDE_TYPE_MAZE = 20,
//   RIDE_TYPE_SPIRAL_SLIDE,
//   RIDE_TYPE_GO_KARTS,
//   RIDE_TYPE_LOG_FLUME,
//   RIDE_TYPE_RIVER_RAPIDS,
//   RIDE_TYPE_DODGEMS,
//   RIDE_TYPE_SWINGING_SHIP,
//   RIDE_TYPE_SWINGING_INVERTER_SHIP,
//   RIDE_TYPE_FOOD_STALL,
//   RIDE_TYPE_1D,
//   RIDE_TYPE_DRINK_STALL = 30,
//   RIDE_TYPE_1F,
//   RIDE_TYPE_SHOP,
//   RIDE_TYPE_MERRY_GO_ROUND,
//   RIDE_TYPE_22,
//   RIDE_TYPE_INFORMATION_KIOSK,
//   RIDE_TYPE_TOILETS,
//   RIDE_TYPE_FERRIS_WHEEL,
//   RIDE_TYPE_MOTION_SIMULATOR,
//   RIDE_TYPE_3D_CINEMA,
//   RIDE_TYPE_TOP_SPIN = 40,
//   RIDE_TYPE_SPACE_RINGS,
//   RIDE_TYPE_REVERSE_FREEFALL_COASTER,
//   RIDE_TYPE_LIFT,
//   RIDE_TYPE_VERTICAL_DROP_ROLLER_COASTER,
//   RIDE_TYPE_CASH_MACHINE,
//   RIDE_TYPE_TWIST,
//   RIDE_TYPE_HAUNTED_HOUSE,
//   RIDE_TYPE_FIRST_AID,
//   RIDE_TYPE_CIRCUS,
//   RIDE_TYPE_GHOST_TRAIN = 50,
//   RIDE_TYPE_TWISTER_ROLLER_COASTER,
//   RIDE_TYPE_WOODEN_ROLLER_COASTER,
//   RIDE_TYPE_SIDE_FRICTION_ROLLER_COASTER,
//   RIDE_TYPE_STEEL_WILD_MOUSE,
//   RIDE_TYPE_MULTI_DIMENSION_ROLLER_COASTER,
//   RIDE_TYPE_MULTI_DIMENSION_ROLLER_COASTER_ALT,
//   RIDE_TYPE_FLYING_ROLLER_COASTER,
//   RIDE_TYPE_FLYING_ROLLER_COASTER_ALT,
//   RIDE_TYPE_VIRGINIA_REEL,
//   RIDE_TYPE_SPLASH_BOATS = 60,
//   RIDE_TYPE_MINI_HELICOPTERS,
//   RIDE_TYPE_LAY_DOWN_ROLLER_COASTER,
//   RIDE_TYPE_SUSPENDED_MONORAIL,
//   RIDE_TYPE_LAY_DOWN_ROLLER_COASTER_ALT,
//   RIDE_TYPE_REVERSER_ROLLER_COASTER,
//   RIDE_TYPE_HEARTLINE_TWISTER_COASTER,
//   RIDE_TYPE_MINI_GOLF,
//   RIDE_TYPE_GIGA_COASTER,
//   RIDE_TYPE_ROTO_DROP,
//   RIDE_TYPE_FLYING_SAUCERS = 70,
//   RIDE_TYPE_CROOKED_HOUSE,
//   RIDE_TYPE_MONORAIL_CYCLES,
//   RIDE_TYPE_COMPACT_INVERTED_COASTER,
//   RIDE_TYPE_WATER_COASTER,
//   RIDE_TYPE_AIR_POWERED_VERTICAL_COASTER,
//   RIDE_TYPE_INVERTED_HAIRPIN_COASTER,
//   RIDE_TYPE_MAGIC_CARPET,
//   RIDE_TYPE_SUBMARINE_RIDE,
//   RIDE_TYPE_RIVER_RAFTS,
//   RIDE_TYPE_50 = 80,
//   RIDE_TYPE_ENTERPRISE,
//   RIDE_TYPE_52,
//   RIDE_TYPE_53,
//   RIDE_TYPE_54,
//   RIDE_TYPE_55,
//   RIDE_TYPE_INVERTED_IMPULSE_COASTER,
//   RIDE_TYPE_MINI_ROLLER_COASTER,
//   RIDE_TYPE_MINE_RIDE,
//   RIDE_TYPE_59,
//   RIDE_TYPE_LIM_LAUNCHED_ROLLER_COASTER = 90,
//   RIDE_TYPE_HYPERCOASTER,
//   RIDE_TYPE_HYPER_TWISTER,
//   RIDE_TYPE_MONSTER_TRUCKS,
//   RIDE_TYPE_SPINNING_WILD_MOUSE,
//   RIDE_TYPE_CLASSIC_MINI_ROLLER_COASTER,
//   RIDE_TYPE_HYBRID_COASTER,
//   RIDE_TYPE_SINGLE_RAIL_ROLLER_COASTER,
//   RIDE_TYPE_ALPINE_COASTER,
//   RIDE_TYPE_CLASSIC_WOODEN_ROLLER_COASTER,
//   RIDE_TYPE_CLASSIC_STAND_UP_ROLLER_COASTER,
//   RIDE_TYPE_LSM_LAUNCHED_ROLLER_COASTER,
//   RIDE_TYPE_CLASSIC_WOODEN_TWISTER_ROLLER_COASTER,

//   RIDE_TYPE_COUNT
// };
const bestRollerCoastersAward = new Award({
  name: "Award for the park with the best roller coasters",
  icon: 5471,
  requirements: [
    () => {
      const met = false; // TODO: Implement logic for roller coasters
      return {
        text: status(
          `TODO: 6 open roller coasters that haven't crashed (Currently: ?)`,
          met
        ),
        met,
      };
    },
  ],
});

const bestValueParkAward = new Award({
  name: "Best value park award",
  icon: 5472,
  requirements: [
    () => {
      const met = !park.getFlag("freeParkEntry");
      return {
        text: status(`Must have an entrance fee (Currently: free)`, met),
        met,
      };
    },
    () => {
      const met = park.totalRideValueForMoney >= 10;
      return {
        text: status(
          `Total ride value for money more than 10 (Currently: ${park.totalRideValueForMoney})`,
          met
        ),
        met,
      };
    },
    () => {
      const met = park.entranceFee + 0.1 <= park.totalRideValueForMoney / 2;
      return {
        text: status(
          `Entrance fee must be less than half the total ride value for money (Currently: ${park.entranceFee})`,
          met
        ),
        met,
      };
    },
  ],
});

const worstValueParkAward = new Award({
  name: "Worst value park award",
  icon: 5474,
  requirements: [
    () => {
      const met = !park.getFlag("freeParkEntry") || park.entranceFee > 0;
      return {
        text: status(`Must have an entrance fee (Currently: free)`, met),
        met,
      };
    },
    () => {
      const met = park.entranceFee > park.totalRideValueForMoney;
      return {
        text: status(
          `Entrance fee must be more than the total ride value for money (Currently: ${park.entranceFee})`,
          met
        ),
        met,
      };
    },
  ],
});

// TODO: Figure out how to filter only custom rides with tracks
const bestCustomDesignedRidesAward = new Award({
  name: "Best custom-designed rides award",
  icon: 5482,
  requirements: [
    () => {
      const met = false; // TODO: Implement logic for custom-designed rides
      return {
        text: status(
          `TODO: At least 6 custom-designed rides (Currently: X)`,
          met
        ),
        met,
      };
    },
  ],
});

const mostBeautifulParkAward = new Award({
  name: "Most beautiful park award",
  icon: 5473,
  requirements: [
    () => {
      const guests = map.getAllEntities("guest");
      let negativeCount = 0;
      for (const guest of guests) {
        for (const thought of guest.thoughts) {
          if (
            thought.freshness <= 5 &&
            (thought.type == "bad_litter" ||
              thought.type == "path_disgusting" ||
              thought.type == "vandalism")
          ) {
            negativeCount++;
          }
        }
      }

      const met = negativeCount <= 15;
      return {
        text: status(
          `15 or fewer guests think the park is ugly (Currently: ${negativeCount})`,
          met
        ),
        met,
      };
    },
    () => {
      const guests = map.getAllEntities("guest");
      let positiveCount = 0;
      for (const guest of guests) {
        for (const thought of guest.thoughts) {
          if (thought.freshness <= 5 && thought.type == "scenery") {
            positiveCount++;
          }
        }
      }

      const met = positiveCount > park.guests / 128;
      return {
        text: status(
          `More than ${Math.floor(
            park.guests / 128
          )} (1/64th) of the guests think the park is beautiful (Currently: ${positiveCount})`,
          met
        ),
        met,
      };
    },
  ],
});

const bestStaffAward = new Award({
  name: "Best staff award",
  icon: 5476,
  requirements: [
    () => {
      const staff = map.getAllEntities("staff");
      const met = staff.length >= 20;
      return {
        text: status(
          `At least 20 staff members (Currently: ${staff.length})`,
          met
        ),
        met,
      };
    },
    () => {
      const staff = map.getAllEntities("staff").length;
      const guests = park.guests;
      const met = staff >= guests / 32;
      return {
        text: status(
          `At least 1 staff for every 32 guests (Currently: ${(
            staff /
            (guests / 32)
          ).toFixed(2)})`,
          met
        ),
        met,
      };
    },
  ],
});

// TODO: Figure out how to check for coaster crash penalties
const safestParkAward = new Award({
  name: "Safest park award",
  icon: 5475,
  requirements: [
    () => {
      let vandalismThoughts = 0;
      const guests = map.getAllEntities("guest");
      for (const guest of guests) {
        for (const thought of guest.thoughts) {
          if (thought.freshness <= 5 && thought.type === "vandalism") {
            vandalismThoughts++;
          }
        }
      }

      const met = vandalismThoughts <= 2;

      return {
        text: status(
          `2 or fewer guests think the vandalism in the park is bad (Currently: ${vandalismThoughts})`,
          met
        ),
        met,
      };
    },
    () => {
      const met = false;
      return {
        text: status(`TODO: No recent crashes`, met),
        met,
      };
    },
  ],
});

const bestParkFoodAward = new Award({
  name: "Best park food award",
  icon: 5477,
  requirements: [
    () => {
      const stalls = map.rides.filter(
        (ride) =>
          ride.status == "open" && (ride.type === 28 || ride.type === 30)
      );
      const met = stalls.length >= 7;
      return {
        text: status(
          `At least 7 food and drink stalls (Currently: ${stalls.length})`,
          met
        ),
        met,
      };
    },
    () => {
      let shopItems = Array<Number>();
      map.rides.forEach((ride) => {
        if (ride.status != "open" || !(ride.type === 28 || ride.type === 30))
          return false;

        if (shopItems.indexOf(ride.object.shopItem) !== -1) return false;

        shopItems.push(ride.object.shopItem);
        return true;
      });
      const met = shopItems.length >= 4;
      return {
        text: status(
          `At least 4 unique stalls (Currently: ${shopItems.length})`,
          met
        ),
        met,
      };
    },
    () => {
      const stalls = map.rides.filter(
        (ride) =>
          ride.status == "open" && (ride.type === 28 || ride.type === 30)
      );
      const met = stalls.length >= park.guests / 128;
      return {
        text: status(
          `At least 1 stall per 128 guests (Currently: ${(
            stalls.length /
            (park.guests / 128)
          ).toFixed(2)})`,
          met
        ),
        met,
      };
    },
    () => {
      const guests = map.getAllEntities("guest");
      let hungryCount = 0;
      for (const guest of guests) {
        for (const thought of guest.thoughts) {
          if (thought.freshness <= 5 && thought.type == "hungry") {
            hungryCount++;
          }
        }
      }

      const met = hungryCount <= 12;
      return {
        text: status(
          `12 or fewer guests think they are hungry (Currently: ${hungryCount})`,
          met
        ),
        met,
      };
    },
  ],
});

const worstParkFoodAward = new Award({
  name: "Worst park food award",
  icon: 5478,
  requirements: [
    () => {
      let shopItems = Array<Number>();
      map.rides.forEach((ride) => {
        if (ride.status != "open" || !(ride.type === 28 || ride.type === 30))
          return false;

        if (shopItems.indexOf(ride.object.shopItem) !== -1) return false;

        shopItems.push(ride.object.shopItem);
        return true;
      });
      const met = shopItems.length <= 2;
      return {
        text: status(
          `2 or fewer unique stalls (Currently: ${shopItems.length})`,
          met
        ),
        met,
      };
    },
    () => {
      const stalls = map.rides.filter(
        (ride) =>
          ride.status == "open" && (ride.type === 28 || ride.type === 30)
      );
      const met = stalls.length <= park.guests / 256;
      return {
        text: status(
          `Less than 1 stall per 256 guests (Currently: ${(
            stalls.length /
            (park.guests / 256)
          ).toFixed(2)})`,
          met
        ),
        met,
      };
    },
    () => {
      let guests = map.getAllEntities("guest");
      let hungryCount = 0;
      for (const guest of guests) {
        for (const thought of guest.thoughts) {
          if (thought.freshness <= 5 && thought.type == "hungry") {
            hungryCount++;
          }
        }
      }
      const met = hungryCount > 15;
      return {
        text: status(
          `More than 15 guests are hungry (Currently: ${hungryCount})`,
          met
        ),
        met,
      };
    },
  ],
});

// Exported awards array
export const awards: Award[] = [
  // Hidden for dev testing
  mostUntidyParkAward,
  tidiestParkAward,
  bestRollerCoastersAward,
  bestValueParkAward,
  mostBeautifulParkAward,
  worstValueParkAward,
  safestParkAward,
  bestStaffAward,
  bestParkFoodAward,
  worstParkFoodAward,
  bestParkToiletsAward,
  // TODO: mostDisappointingParkAward,
  // TODO: bestWaterRidesAward,
  bestCustomDesignedRidesAward,
  // TODO: mostDazzlingRideColourSchemeAward,
  // TODO: bestGentleRideAward
];
