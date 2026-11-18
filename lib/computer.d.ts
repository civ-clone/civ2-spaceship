/** The three groups the original builds as improvements: structurals, components and modules. */
export declare const STRUCTURALS = 0;
export declare const COMPONENTS = 1;
export declare const MODULES = 2;
/** The part kinds in each group. */
export declare const groupKinds: number[][];
/** Another player's ship, as a computer player sees it. */
export interface OtherShip {
  /** Whether a person plays it. */
  human: boolean;
  /** Whether it has launched (and not been lost). */
  launched: boolean;
  /** Whether it has any part, or has launched (`civ_spaceship_exists`). */
  exists: boolean;
  /** The year it arrives: as launched, or as it would if it launched now. 0 for a ship with no part. */
  arrivalYear: number;
  /** Whether its player ranks above the computer player by power (the original's higher `power_rank`). */
  stronger: boolean;
  /** Its player's gold. */
  gold: number;
}
/** A computer player's ship and what its choices read. */
export interface ComputerShip {
  /** How many of each kind are built, counted or not (`lib/ship` `built`), in the original's order. */
  built: number[];
  /** Whether it has launched (and not been lost). */
  launched: boolean;
  /** Whether its player knows each group's advance: Space Flight, Plastics, Superconductor. */
  knows: boolean[];
  /** Whether its player knows Fusion Power. */
  fusion: boolean;
  /** The year now. */
  year: number;
  /** The game's level, 0 (Chieftain) to 5 (Deity). */
  level: number;
  /** Every other player's ship. */
  others: OtherShip[];
}
/** King's level: above it, the original's computer players wait for another computer's launch. */
export declare const KING = 3;
/** The least chance of success, in %, a computer player launches with (`0x27 < success_pct`). */
export declare const LEAST_SUCCESS = 40;
/** The chance of success, in %, above which a computer player launches with no person's ship in flight. */
export declare const SURE_SUCCESS = 75;
/** A computer player's race is close when its ship arrives within this many years. */
export declare const CLOSE_YEARS = 14;
/** How many of a group are built (`spaceship_group_count`). */
export declare const groupCount: (built: number[], group: number) => number;
/** How many of a group a computer player's ship counts (`spaceship_group_limit`). */
export declare const groupLimit: (built: number[], group: number) => number;
/** How many of a group count of those built (`spaceship_group_count_clamped`). */
export declare const groupCountClamped: (
  built: number[],
  group: number
) => number;
/** Whether a group is built in full (`spaceship_group_full`). */
export declare const groupFull: (built: number[], group: number) => boolean;
/**
 * Whether a computer player can add to a group (`spaceship_group_can_build`): below the group's limit, or with none of
 *  it yet; not built in full; and knowing its advance.
 */
export declare const groupCanBuild: (
  ship: ComputerShip,
  group: number
) => boolean;
/** The ship's numbers as a computer player's choices read them: life support not applied (`spaceship_calc_stats(civ, 0)`). */
export declare const computerStats: (
  ship: ComputerShip
) => import('./stats').ShipStats;
/** The year the ship would arrive if it launched now (`spaceship_arrival_year` before a launch). */
export declare const ownArrivalYear: (ship: ComputerShip) => number;
/** The year the ship would arrive with every part built counted (`projected_arrival_year`). */
export declare const projectedArrivalYear: (ship: ComputerShip) => number;
/**
 * The group a computer player adds to, asked as it finishes a part of `group` (`spaceship_choose_part_group`): −1 once
 *  the ship has launched, −2 if it can add to none.
 *
 * A race is close when the ship would arrive within 14 years and before every person's. Modules come first, then
 *  components (not in a close race), then structurals; while a person's ship in flight arrives no later than this one's
 *  projection, components the ship isn't full of come first, when the player knows their advance.
 */
export declare const choosePartGroup: (
  ship: ComputerShip,
  group: number
) => number;
/**
 * The kind a computer player adds to `group` (`spaceship_add_part`): a structural; propulsion while it has fewer than
 *  fuel, else fuel; the module it has fewest of, the first of a tie. −1 when the group is built in full.
 */
export declare const partOfGroup: (built: number[], group: number) => number;
/**
 * The kind a computer player adds next: the group `choosePartGroup` gives as a structural is finished (the original's
 *  first choice, as a city on Auto builds structurals and they're turned into what's wanted), then the kind
 *  `partOfGroup` gives. −1 for none.
 */
export declare const nextPart: (ship: ComputerShip) => number;
/** How a computer player waits for another computer player's launch, above King. */
export type LaunchWait =
  /**
   * The original's: it compares another computer's arrival with the barbarians' ship's (`civs[0]`), whose year is 0
   *  in practice, so it never waits.
   */
  | 'classic'
  /** Waits while another computer player's ship in flight arrives before this one would. */
  | 'other-computers';
/**
 * Whether a computer player launches its ship now, as it does after adding a part (`spaceship_add_part`):
 *
 * 1. never below 40% success (life support not applied);
 * 2. once its structurals and both components are built in full;
 * 3. else, while a person's ship is in flight, only if it would arrive before the earliest of them;
 * 4. else, above King, it waits while another computer player's ship in flight arrives first (`wait`);
 * 5. else when its success is over 75%, or a person's player is stronger, or a person has a ship and more than 999 gold.
 */
export declare const launches: (
  ship: ComputerShip,
  wait?: LaunchWait
) => boolean;
