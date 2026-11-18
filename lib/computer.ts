import {
  FUEL,
  HABITATION,
  LIFE_SUPPORT,
  PROPULSION,
  SOLAR_PANEL,
  STRUCTURAL,
  parts,
} from '../data/parts';
import { partLimit, shipStats } from './stats';

// A computer player's spaceship (OpenCiv2 `src/auto/spaceship.cpp`, richardpenman/civ2@49f26ec): which part it adds
//  next (`spaceship_choose_part_group`, `:1769`, then `spaceship_add_part`, `:1860`) and whether it launches after
//  adding one (`spaceship_add_part`'s computer branch). Plain numbers in, so a rule set's rules and tests can ask with
//  the ship as it is.

/** The three groups the original builds as improvements: structurals, components and modules. */
export const STRUCTURALS = 0;
export const COMPONENTS = 1;
export const MODULES = 2;

/** The part kinds in each group. */
export const groupKinds: number[][] = [
  [STRUCTURAL],
  [PROPULSION, FUEL],
  [HABITATION, LIFE_SUPPORT, SOLAR_PANEL],
];

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
export const KING = 3;

/** The least chance of success, in %, a computer player launches with (`0x27 < success_pct`). */
export const LEAST_SUCCESS = 40;

/** The chance of success, in %, above which a computer player launches with no person's ship in flight. */
export const SURE_SUCCESS = 75;

/** A computer player's race is close when its ship arrives within this many years. */
export const CLOSE_YEARS = 14;

const sum = (values: number[]): number =>
  values.reduce((total: number, value: number): number => total + value, 0);

/** How many of a group are built (`spaceship_group_count`). */
export const groupCount = (built: number[], group: number): number =>
  sum(groupKinds[group].map((kind: number): number => built[kind]));

/** How many of a group a computer player's ship counts (`spaceship_group_limit`). */
export const groupLimit = (built: number[], group: number): number =>
  sum(
    groupKinds[group].map((kind: number): number =>
      partLimit(kind, built[STRUCTURAL], false)
    )
  );

/** How many of a group count of those built (`spaceship_group_count_clamped`). */
export const groupCountClamped = (built: number[], group: number): number =>
  sum(
    groupKinds[group].map((kind: number): number =>
      Math.min(
        Math.max(built[kind], 0),
        partLimit(kind, built[STRUCTURAL], false)
      )
    )
  );

/** Whether a group is built in full (`spaceship_group_full`). */
export const groupFull = (built: number[], group: number): boolean =>
  sum(groupKinds[group].map((kind: number): number => parts[kind][1])) <=
  groupCount(built, group);

/**
 * Whether a computer player can add to a group (`spaceship_group_can_build`): below the group's limit, or with none of
 *  it yet; not built in full; and knowing its advance.
 */
export const groupCanBuild = (ship: ComputerShip, group: number): boolean =>
  (groupCount(ship.built, group) < groupLimit(ship.built, group) ||
    groupCount(ship.built, group) === 0) &&
  !groupFull(ship.built, group) &&
  ship.knows[group];

/** The ship's numbers as a computer player's choices read them: life support not applied (`spaceship_calc_stats(civ, 0)`). */
export const computerStats = (ship: ComputerShip) =>
  shipStats(ship.built, {
    human: false,
    fusion: ship.fusion,
    applySupport: false,
  });

/** The year the ship would arrive if it launched now (`spaceship_arrival_year` before a launch). */
export const ownArrivalYear = (ship: ComputerShip): number =>
  ship.year + Math.trunc(computerStats(ship).arrivalFlight / 10);

/** The year the ship would arrive with every part built counted (`projected_arrival_year`). */
export const projectedArrivalYear = (ship: ComputerShip): number =>
  ship.year + Math.trunc(computerStats(ship).projectedFlight / 10);

/**
 * The group a computer player adds to, asked as it finishes a part of `group` (`spaceship_choose_part_group`): −1 once
 *  the ship has launched, −2 if it can add to none.
 *
 * A race is close when the ship would arrive within 14 years and before every person's. Modules come first, then
 *  components (not in a close race), then structurals; while a person's ship in flight arrives no later than this one's
 *  projection, components the ship isn't full of come first, when the player knows their advance.
 */
export const choosePartGroup = (ship: ComputerShip, group: number): number => {
  if (ship.launched) {
    return -1;
  }

  const humans = ship.others.filter(
      (other: OtherShip): boolean => other.human && other.arrivalYear > 0
    ),
    earliestHuman = humans.reduce(
      (earliest: number, other: OtherShip): number =>
        Math.min(earliest, other.arrivalYear),
      9999
    ),
    // Worked out afresh, as `spaceship_calc_stats` has just done: an empty ship's flight is centuries, never close.
    own = ownArrivalYear(ship),
    raceClose = own - ship.year <= CLOSE_YEARS && own < earliestHuman,
    below = (candidate: number): boolean =>
      groupCountClamped(ship.built, candidate) <
      groupLimit(ship.built, candidate);

  let chosen = false;

  if (group === STRUCTURALS) {
    if (below(MODULES)) {
      chosen = true;
    } else if (!raceClose && below(COMPONENTS)) {
      chosen = true;
    }
  }

  if (
    chosen ||
    (group === COMPONENTS && raceClose) ||
    !below(group) ||
    !groupCanBuild(ship, group)
  ) {
    for (
      let candidate = MODULES;
      candidate >= (group === STRUCTURALS ? 1 : 0);
      candidate--
    ) {
      if (
        groupCanBuild(ship, candidate) &&
        (candidate !== COMPONENTS || !raceClose) &&
        below(candidate)
      ) {
        group = candidate;

        break;
      }
    }
  }

  if (group === STRUCTURALS) {
    const projected = projectedArrivalYear(ship);

    if (
      ship.others.some(
        (other: OtherShip): boolean =>
          other.human && other.launched && other.arrivalYear <= projected
      ) &&
      !groupFull(ship.built, COMPONENTS) &&
      ship.knows[COMPONENTS] &&
      (ship.built[PROPULSION] <=
        partLimit(PROPULSION, ship.built[STRUCTURAL], false) ||
        ship.built[FUEL] <= partLimit(FUEL, ship.built[STRUCTURAL], false))
    ) {
      return COMPONENTS;
    }
  }

  return groupCanBuild(ship, group) ? group : -2;
};

/**
 * The kind a computer player adds to `group` (`spaceship_add_part`): a structural; propulsion while it has fewer than
 *  fuel, else fuel; the module it has fewest of, the first of a tie. −1 when the group is built in full.
 */
export const partOfGroup = (built: number[], group: number): number => {
  const kinds = groupKinds[group];

  if (kinds.every((kind: number): boolean => parts[kind][1] <= built[kind])) {
    return -1;
  }

  if (group === STRUCTURALS) {
    return STRUCTURAL;
  }

  if (group === COMPONENTS) {
    return built[PROPULSION] < built[FUEL] ? PROPULSION : FUEL;
  }

  return kinds.reduce(
    (fewest: number, kind: number): number =>
      built[kind] < built[fewest] ? kind : fewest,
    kinds[0]
  );
};

/**
 * The kind a computer player adds next: the group `choosePartGroup` gives as a structural is finished (the original's
 *  first choice, as a city on Auto builds structurals and they're turned into what's wanted), then the kind
 *  `partOfGroup` gives. −1 for none.
 */
export const nextPart = (ship: ComputerShip): number => {
  const group = choosePartGroup(ship, STRUCTURALS);

  return group < 0 ? -1 : partOfGroup(ship.built, group);
};

/** How a computer player waits for another computer player's launch, above King. */
export type LaunchWait =
  /**
   * The original's: it compares another computer's arrival with the barbarians' ship's (`civs[0]`), whose year is
   *  always 0, so it never waits.
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
export const launches = (
  ship: ComputerShip,
  wait: LaunchWait = 'classic'
): boolean => {
  if (ship.launched) {
    return false;
  }

  const { success } = computerStats(ship);

  if (success < LEAST_SUCCESS) {
    return false;
  }

  if (
    [STRUCTURAL, PROPULSION, FUEL].every(
      (kind: number): boolean => parts[kind][1] <= ship.built[kind]
    )
  ) {
    return true;
  }

  const humansInFlight = ship.others.filter(
    (other: OtherShip): boolean => other.human && other.launched
  );

  if (humansInFlight.length > 0) {
    const earliest = humansInFlight.reduce(
      (year: number, other: OtherShip): number =>
        Math.min(year, other.arrivalYear),
      Infinity
    );

    return ownArrivalYear(ship) < earliest;
  }

  if (ship.level > KING) {
    // The year the original compares another computer's arrival with: the barbarians' ship's, 0, or this ship's own.
    const against = wait === 'classic' ? 0 : ownArrivalYear(ship);

    if (
      ship.others.some(
        (other: OtherShip): boolean =>
          !other.human && other.launched && other.arrivalYear < against
      )
    ) {
      return false;
    }
  }

  return (
    success > SURE_SUCCESS ||
    ship.others.some(
      (other: OtherShip): boolean =>
        other.human && (other.stronger || (other.exists && other.gold > 999))
    )
  );
};
