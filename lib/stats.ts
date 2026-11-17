import {
  COMPUTER_MODULE_LIMIT,
  FUEL,
  HABITATION,
  LIFE_SUPPORT,
  PROPULSION,
  SOLAR_PANEL,
  STRUCTURAL,
  parts,
} from '../data/parts';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';

// Civilization II's spaceship numbers (OpenCiv2 `src/auto/spaceship.cpp`, richardpenman/civ2@49f26ec), with C's
//  integer arithmetic. `built` is how many of each kind have been built, in the original's order (`data/parts`).

const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max);

/**
 * How many of `part` count, from the structurals built (`spaceship_part_limit`, `:1307`): every structural counts;
 *  propulsion up to (S + 1) / 4 and fuel (S − 1) / 4; habitation (S + 1) / 8, life support (S − 3) / 8 and solar panels
 *  (S − 7) / 8, and a computer player's at most 1 of each module. Never more than can be built, nor below 0.
 */
export const partLimit = (
  part: number,
  structurals: number,
  human: boolean
): number => {
  const [, max] = parts[part];

  if (part === STRUCTURAL) {
    return max;
  }

  if (part === PROPULSION || part === FUEL) {
    return clamp(Math.trunc((structurals + 1 - (part * 2 - 2)) / 4), 0, max);
  }

  const limit = clamp(
    Math.trunc((structurals + 1 - (part * 4 - 12)) / 8),
    0,
    max
  );

  return human ? limit : clamp(limit, 0, COMPUTER_MODULE_LIMIT);
};

/** How many of each kind count (`spaceship_part_count`): what was built, up to its limit. */
export const effectiveCounts = (built: number[], human: boolean): number[] =>
  built.map((count: number, part: number): number =>
    clamp(count, 0, partLimit(part, built[STRUCTURAL], human))
  );

/**
 * The thrust of `count` propulsion or fuel components (`spaceship_component_thrust`, `:1432`): 1 for each of the first
 *  four, 2 for the fifth and sixth, 3 for the seventh and eighth, so 14 for eight.
 */
export const thrust = (count: number): number => {
  let total = 0;

  for (let i = 0; i < count; i++) {
    total += i > 3 ? 2 : 1;

    if (i > 5) {
      total++;
    }
  }

  return total;
};

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
export const shipStats = (
  built: number[],
  {
    applySupport = true,
    fusion,
    human,
    paradigm = cosmic.massThrustParadigm,
  }: StatsOptions
): ShipStats => {
  const counted = effectiveCounts(built, human),
    mass = built.reduce(
      (total: number, count: number, part: number): number =>
        total + count * parts[part][2],
      0
    ),
    fullMass = built.reduce(
      (total: number, count: number, part: number): number =>
        total + (count === 0 ? parts[part][2] : 0),
      mass
    ),
    support = Math.trunc(
      (counted[LIFE_SUPPORT] * 100) / clamp(counted[HABITATION], 1, 99)
    ),
    energy = Math.trunc(
      (counted[SOLAR_PANEL] * 200) /
        clamp(counted[HABITATION] + counted[LIFE_SUPPORT], 1, 99)
    ),
    fuel = Math.trunc(
      (counted[FUEL] * 100) / clamp(counted[PROPULSION], 1, 99)
    );

  let success = 100;

  if (applySupport) {
    success = Math.trunc((clamp(support, 0, 100) * success) / 100);
  }

  success = Math.trunc((clamp(energy, 0, 100) * success) / 100);

  let effectiveParadigm = clamp(paradigm, 25, 200),
    scale = 1;

  if (fusion) {
    effectiveParadigm = (effectiveParadigm * 3) >> 2;
  }

  while (effectiveParadigm > 100) {
    effectiveParadigm >>= 1;
    scale <<= 1;
  }

  const countedThrust = Math.min(
      thrust(counted[PROPULSION]) * 10,
      thrust(counted[FUEL]) * 10
    ),
    builtThrust = Math.min(
      thrust(built[PROPULSION]) * 10,
      thrust(built[FUEL]) * 10
    ),
    flight =
      Math.trunc((mass * effectiveParadigm) / (countedThrust + 1)) * scale,
    arrivalFlight =
      Math.trunc((effectiveParadigm * fullMass) / (countedThrust + 1)) * scale,
    projectedFlight =
      Math.trunc((effectiveParadigm * fullMass) / (builtThrust + 1)) * scale;

  if (flight > 150) {
    success -= Math.trunc((flight - 150) / 10);
  }

  return {
    mass,
    fullMass,
    counted,
    support,
    energy,
    fuel,
    flight,
    arrivalFlight,
    projectedFlight,
    success: clamp(success, 0, 100),
    population: counted[HABITATION],
  };
};

/** The whole years a flight of `tenths` tenths of a year adds to the launch year (`spaceship_calc_stats`: `/ 10`). */
export const flightYears = (tenths: number): number => Math.trunc(tenths / 10);

export default shipStats;
