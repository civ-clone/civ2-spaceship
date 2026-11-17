/**
 * How many of `part` count, from the structurals built (`spaceship_part_limit`, `:1307`): every structural counts;
 *  propulsion up to (S + 1) / 4 and fuel (S − 1) / 4; habitation (S + 1) / 8, life support (S − 3) / 8 and solar panels
 *  (S − 7) / 8, and a computer player's at most 1 of each module. Never more than can be built, nor below 0.
 */
export declare const partLimit: (
  part: number,
  structurals: number,
  human: boolean
) => number;
/** How many of each kind count (`spaceship_part_count`): what was built, up to its limit. */
export declare const effectiveCounts: (
  built: number[],
  human: boolean
) => number[];
/**
 * The thrust of `count` propulsion or fuel components (`spaceship_component_thrust`, `:1432`): 1 for each of the first
 *  four, 2 for the fifth and sixth, 3 for the seventh and eighth, so 14 for eight.
 */
export declare const thrust: (count: number) => number;
export interface ShipStats {
  /** The mass of every part built, counted or not, in the original's units. */
  mass: number;
  /** `mass`, with one more of each kind not yet built. */
  fullMass: number;
  /** How many of each kind count. */
  counted: number[];
  /** Life support for the habitation, in %. */
  support: number;
  /** Solar power for the modules, in %. */
  energy: number;
  /** Fuel for the propulsion, in %. */
  fuel: number;
  /** The flight the status shows, in tenths of a year: `mass` over the counted thrust. Over 15 years lowers success. */
  flight: number;
  /** The flight the ship launches on, in tenths of a year: `fullMass` over the counted thrust. */
  arrivalFlight: number;
  /** The flight with every part built counted, in tenths of a year: for the computer players' projections. */
  projectedFlight: number;
  /** The chance of success, 0 to 100. It only scales the score: an arriving ship always lands. */
  success: number;
  /** The colonists, in tens of thousands: the habitation counted. */
  population: number;
}
export interface StatsOptions {
  /** Whether the ship is a person's: a computer player's counts at most 1 of each module. */
  human: boolean;
  /** Whether the ship has fusion (`SHIP_FUSION`): Fusion Power known before it launched. */
  fusion: boolean;
  /** Whether life support counts toward success (`apply_support`), as it does for the status, the launch and the score. */
  applySupport?: boolean;
  /** @COSMIC's mass/thrust paradigm, clamped 25 to 200 when the rules are read. */
  paradigm?: number;
}
/**
 * A ship's numbers (`spaceship_calc_stats`, `:1454`):
 *
 * - mass: each part built × its mass; the full mass adds one of each kind still at 0;
 * - support = life support × 100 / habitation, energy = solar panels × 200 / (habitation + life support), fuel = fuel ×
 *   100 / propulsion, each divisor kept to 1 to 99, from the counted parts;
 * - the paradigm (75) is cut to three quarters with fusion, then halved while above 100, doubling the result each time;
 * - thrust is the lesser of the counted propulsion's and fuel's, × 10;
 * - the flight is mass × paradigm / (thrust + 1), in tenths of a year;
 * - success starts at 100, is scaled by support (when applied) and by energy, each kept to 0 to 100, then loses
 *   (flight − 150) / 10 for a flight over 15 years, and is kept to 0 to 100.
 */
export declare const shipStats: (
  built: number[],
  { applySupport, fusion, human, paradigm }: StatsOptions
) => ShipStats;
/** The whole years a flight of `tenths` tenths of a year adds to the launch year (`spaceship_calc_stats`: `/ 10`). */
export declare const flightYears: (tenths: number) => number;
export default shipStats;
