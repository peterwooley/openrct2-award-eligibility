const RIDE_LIFECYCLE_CRASHED = 1 << 10;
const RIDE_LIFECYCLE_NOT_CUSTOM_DESIGN = 1 << 18;

// TODO: See if API allows checking for ride category, or request it to be added to the API
const GENTLE_RIDE_IDS = [
  11, // Car Ride
  14, // Observation Tower
  20, // Maze
  21, // Spiral Slide
  25, // Dodgems
  33, // Merry-Go-Round
  37, // Ferris Wheel
  41, // Space Rings
  47, // Haunted House
  49, // Circus
  50, // Ghost Train
  67, // Mini Golf
  70, // Flying Saucers
  71, // Crooked House
  72, // Monorail Cycles
  88, // Mini Helicopters, I think...
];
const ROLLER_COASTER_IDS = [
  0, // Spiral Roller Coaster
  1, // Stand-Up Roller Coaster
  2, // Suspended Swinging Coaster
  3, // Inverted Roller Coaster
  4, // Junior Roller Coaster
  7, // Mini Suspended Coaster
  9, // Wooden Wild Mouse
  10, // Steeplechase
  13, // Mine Train Coaster
  15, // Bobsleigh Coaster
  17, // Looping Roller Coaster
  18, // Mine Train Coaster
  19, // Corkscrew Roller Coaster
  42, // Reverse Freefall Coaster
  44, // Vertical Drop Roller Coaster
  51, // Twister Roller Coaster
  52, // Wooden Roller Coaster
  53, // Side Friction Roller Coaster
  54, // Steel Wild Mouse
  55, // Multi-Dimension Roller Coaster
  56, // Multi-Dimension Roller Coaster (Alt)
  57, // Flying Roller Coaster
  58, // Flying Roller Coaster (Alt)
  59, // Virginia Reel
  62, // Lay Down Roller Coaster
  64, // Lay Down Roller Coaster (Alt)
  65, // Reverser Roller Coaster
  66, // Heartline Twister Coaster
  68, // Giga Coaster
  73, // Compact Inverted Coaster
  74, // Water Coaster
  75, // Air Powered Vertical Coaster
  76, // Inverted Hairpin Coaster
  86, // Inverted Impulse Coaster
  87, // Mini Roller Coaster
  88, // Mine Ride
  90, // LIM Launched Roller Coaster
  91, // Hypercoaster
  92, // Hyper Twister
  94, // Spinning Wild Mouse
  95, // Classic Mini Roller Coaster
  96, // Hybrid Coaster
  97, // Single Rail Roller Coaster
  98, // Alpine Coaster
  99, // Classic Wooden Roller Coaster
  100, // Classic Stand-Up Roller Coaster
  101, // LSM Launched Roller Coaster
  102, // Classic Wooden Twister Roller Coaster
];
const WATER_RIDE_IDS = [
  8, // Boat Hire
  16, // Dinghy Slide
  23, // Log Flume
  24, // River Rapids
  60, // Splash Boats
  74, // Water Coaster
  79, // River Rafts
];

const DAZZLING_COLOURS = [
  5, // Bright purple
  14, // Bright green
  20, // Light orange
  30, // Bright pink
];

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

  formatName(isEligible: boolean = false): string {
    return isEligible ? `{GREEN}${this.name}` : this.name;
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
      let guestsNeedingRestroom = AwardsManager.thoughts.toilet;
      const met = guestsNeedingRestroom <= 16;

      return {
        text: status(
          `16 or fewer guests needing bathroom (Currently: ${guestsNeedingRestroom})`,
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
      let negativeCount =
        (AwardsManager.thoughts.bad_litter || 0) +
        (AwardsManager.thoughts.path_disgusting || 0) +
        (AwardsManager.thoughts.vandalism || 0);
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
      let negativeCount =
        (AwardsManager.thoughts.bad_litter || 0) +
        (AwardsManager.thoughts.path_disgusting || 0) +
        (AwardsManager.thoughts.vandalism || 0);

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
      let positiveCount = AwardsManager.thoughts.very_clean || 0;
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

const bestRollerCoastersAward = new Award({
  name: "Award for the park with the best roller coasters",
  icon: 5471,
  requirements: [
    () => {
      let coasterCount = 0;
      for (const ride of map.rides) {
        if (
          ROLLER_COASTER_IDS.indexOf(ride.type) !== -1 &&
          ride.status === "open" &&
          !(ride.lifecycleFlags & RIDE_LIFECYCLE_CRASHED)
        ) {
          coasterCount++;
        }
      }
      const met = coasterCount >= 6;
      return {
        text: status(
          `6 or more open roller coasters that haven't crashed (Currently: ${coasterCount})`,
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

const bestCustomDesignedRidesAward = new Award({
  name: "Best custom-designed rides award",
  icon: 5482,
  requirements: [
    () => {
      let customRideCount = 0;
      for (const ride of map.rides) {
        if (
          // TODO: Missing check for RtdFlag::hasTrack, but not sure if it's available in the API or matters
          ride.lifecycleFlags & RIDE_LIFECYCLE_NOT_CUSTOM_DESIGN ||
          ride.excitement < 5.5 ||
          ride.status !== "open" ||
          ride.lifecycleFlags & RIDE_LIFECYCLE_CRASHED
        ) {
          continue;
        }

        customRideCount++;
      }
      const met = customRideCount >= 6;
      return {
        text: status(
          `At least 6 open custom-designed rides that haven't crashed (Currently: ${customRideCount})`,
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
      const negativeCount =
        (AwardsManager.thoughts.bad_litter || 0) +
        (AwardsManager.thoughts.path_disgusting || 0) +
        (AwardsManager.thoughts.vandalism || 0);

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
      const positiveCount = AwardsManager.thoughts.scenery || 0;
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
      const vandalismThoughts = AwardsManager.thoughts.vandalism || 0;
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
      const hungryCount = AwardsManager.thoughts.hungry || 0;
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
      const hungryCount = AwardsManager.thoughts.hungry || 0;
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

const mostDisappointingParkAward = new Award({
  name: "Most disappointing park award",
  icon: 5480,
  requirements: [
    () => {
      const met = park.rating <= 650;
      return {
        text: status(
          `Park rating is 650 or less (Currently: ${park.rating})`,
          met
        ),
        met,
      };
    },
    () => {
      const met = false;
      return {
        text: status(
          `TODO: More than half of rides have a satisfaction of 6 or less`,
          met
        ),
        met,
      };
    },
  ],
});

const bestWaterRidesAward = new Award({
  name: "Best water rides award",
  icon: 5481,
  requirements: [
    () => {
      let waterRideCount = 0;
      for (const ride of map.rides) {
        if (
          WATER_RIDE_IDS.indexOf(ride.type) !== -1 &&
          ride.status === "open" &&
          !(ride.lifecycleFlags & RIDE_LIFECYCLE_CRASHED)
        ) {
          waterRideCount++;
        }
      }
      const met = waterRideCount >= 6;
      return {
        text: status(
          `At least 6 water rides are open and haven't crashed (Currently: ${waterRideCount})`,
          met
        ),
        met,
      };
    },
  ],
});

const mostConfusingParkLayoutAward = new Award({
  name: "Most confusing park layout award",
  icon: 5484,
  requirements: [
    () => {
      const lostGuestsCount = (AwardsManager.thoughts.lost || 0) + (AwardsManager.thoughts.cant_find || 0);
      const met = lostGuestsCount >= 10 && lostGuestsCount > park.guests / 64;
      return {
        text: status(
          `More than 15 guests are lost (Currently: ${lostGuestsCount})`,
          met
        ),
        met,
      };
    },
  ],
});

const bestGentleRideAward = new Award({
  name: "Best gentle ride award",
  icon: 5485,
  requirements: [
    () => {
      let gentleRideCount = 0;
      for (const ride of map.rides) {
        if (
          GENTLE_RIDE_IDS.indexOf(ride.type) !== -1 &&
          ride.status === "open" &&
          !(ride.lifecycleFlags & RIDE_LIFECYCLE_CRASHED)
        ) {
          gentleRideCount++;
        }
      }
      const met = gentleRideCount >= 10;
      return {
        text: status(
          `At least 10 gentle rides are open and haven't crashed (Currently: ${gentleRideCount})`,
          met
        ),
        met,
      };
    },
  ],
});

const mostDazzlingRideColourSchemeAward = new Award({
  name: "Most dazzling ride colour scheme award",
  icon: 5483,
  requirements: [
    () => {
      let dazzlingRideCount = 0;
      for (const ride of map.rides) {
        if (
          ride.classification === "ride" &&
          ride.colourSchemes.some(
            (scheme) => DAZZLING_COLOURS.indexOf(scheme.main) !== -1
          )
        ) {
          dazzlingRideCount++;
        }
      }
      const met = dazzlingRideCount >= 5;
      return {
        text: status(
          `At least 5 rides with dazzling colour schemes (Currently: ${dazzlingRideCount})`,
          met
        ),
        met,
      };
    },
    () => {
      let dazzlingRideCount = 0;
      let rideCount = 0;
      for (const ride of map.rides) {
        if (ride.classification !== "ride") continue;

        rideCount++;

        if (
          ride.colourSchemes.some(
            (scheme) => DAZZLING_COLOURS.indexOf(scheme.main) !== -1
          )
        ) {
          dazzlingRideCount++;
        }
      }
      const met = dazzlingRideCount >= rideCount - dazzlingRideCount;
      return {
        text: status(
          `Half or more rides (${Math.ceil(
            rideCount / 2
          )}) have a dazzling colour scheme (Currently: ${dazzlingRideCount})`,
          met
        ),
        met,
      };
    },
  ],
});

export class AwardsManager {
  static thoughts: Record<string, number> = {};
  static thoughtTypes = [
    "toilet",
    "bad_litter",
    "path_disgusting",
    "vandalism",
    "very_clean",
    "scenery",
    "hungry",
    "lost",
    "cant_find",
  ];

  static updateGuests(): void {
    const start = new Date();
    const guests = map.getAllEntities("guest");

    AwardsManager.thoughts = {};

    for (const guest of guests) {
      for (const thought of guest.thoughts) {
        if (
          thought.freshness <= 5 &&
          AwardsManager.thoughtTypes.indexOf(thought.type) !== -1
        ) {
          AwardsManager.thoughts[thought.type] =
            (AwardsManager.thoughts[thought.type] || 0) + 1;
        }
      }
    }

    const end = new Date();
    console.log(
      `AwardsManager.updateGuests() took ${end.getTime() - start.getTime()}ms`
    );
  }

  static getAwards(): Award[] {
    return awards;
  }
}
AwardsManager.updateGuests(); // Initialize the guests array

// Exported awards array
const awards: Award[] = [
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
  mostDisappointingParkAward,
  bestWaterRidesAward,
  bestCustomDesignedRidesAward,
  mostDazzlingRideColourSchemeAward,
  mostConfusingParkLayoutAward,
  bestGentleRideAward,
];

const categorizedAwards = {
  park: [
    tidiestParkAward,
    bestValueParkAward,
    mostBeautifulParkAward,
    safestParkAward,
    bestStaffAward,
    bestParkFoodAward,
    bestParkToiletsAward,
  ],
  rides: [
    bestRollerCoastersAward,
    bestWaterRidesAward,
    bestCustomDesignedRidesAward,
    mostDazzlingRideColourSchemeAward,
    bestGentleRideAward,
  ],
  negative: [
    mostUntidyParkAward,
    worstValueParkAward,
    worstParkFoodAward,
    mostDisappointingParkAward,
    mostConfusingParkLayoutAward,
  ],
};
