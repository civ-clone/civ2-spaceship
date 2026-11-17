import {
  Fuel,
  Habitation,
  LifeSupport,
  Power,
  Propulsion,
  Structural,
} from '../Parts';
import Advance from '@civ-clone/core-science/Advance';
import Part from '@civ-clone/core-spaceship/Part';
import Plastics from '@civ-clone/base-science-advance-plastics/Plastics';
import SpaceFlight from '@civ-clone/base-science-advance-spaceflight/SpaceFlight';
import Superconductor from '@civ-clone/base-science-advance-superconductor/Superconductor';

// Civilization II's spaceship parts, in the original's order (OpenCiv2 `src/data/gamedata.cpp`
//  `spaceship_part_table_block`, richardpenman/civ2@49f26ec): the most that can be built of each and its mass. The
//  group's improvement row in MGE's RULES.TXT @IMPROVE gives the advance and the cost in rows of shields (SS Structural:
//  Space Flight, 8; SS Component: Plastics, 16; SS Module: Superconductor, 32).

export const STRUCTURAL = 0;
export const PROPULSION = 1;
export const FUEL = 2;
export const HABITATION = 3;
export const LIFE_SUPPORT = 4;
export const SOLAR_PANEL = 5;

/** A part kind: its class, the most that can be built, its mass, its cost in rows of shields and its advance. */
export type PartRow = [
  PartType: typeof Part,
  max: number,
  mass: number,
  costRows: number,
  advance: typeof Advance
];

export const parts: PartRow[] = [
  [Structural, 39, 1, 8, SpaceFlight],
  [Propulsion, 8, 4, 16, Plastics],
  [Fuel, 8, 4, 16, Plastics],
  [Habitation, 4, 16, 32, Superconductor],
  [LifeSupport, 4, 16, 32, Superconductor],
  [Power, 4, 16, 32, Superconductor],
];

/** The part kinds' classes, in the original's order. */
export const partTypes: (typeof Part)[] = parts.map(([PartType]) => PartType);

/** A computer player's ship counts at most this many of each kind of module (`spaceship_part_limit`). */
export const COMPUTER_MODULE_LIMIT = 1;

/** Which kind `part` is, by the original's order, or -1. */
export const kindOf = (part: Part): number =>
  partTypes.findIndex(
    (PartType: typeof Part): boolean => part instanceof PartType
  );

export default parts;
