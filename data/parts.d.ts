import Advance from '@civ-clone/core-science/Advance';
import Part from '@civ-clone/core-spaceship/Part';
export declare const STRUCTURAL = 0;
export declare const PROPULSION = 1;
export declare const FUEL = 2;
export declare const HABITATION = 3;
export declare const LIFE_SUPPORT = 4;
export declare const SOLAR_PANEL = 5;
/** A part kind: its class, the most that can be built, its mass, its cost in rows of shields and its advance. */
export type PartRow = [
  PartType: typeof Part,
  max: number,
  mass: number,
  costRows: number,
  advance: typeof Advance
];
export declare const parts: PartRow[];
/** The part kinds' classes, in the original's order. */
export declare const partTypes: (typeof Part)[];
/** A computer player's ship counts at most this many of each kind of module (`spaceship_part_limit`). */
export declare const COMPUTER_MODULE_LIMIT = 1;
/** Which kind `part` is, by the original's order, or -1. */
export declare const kindOf: (part: Part) => number;
export default parts;
