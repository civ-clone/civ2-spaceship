import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import Layout from '@civ-clone/core-spaceship/Layout';
import { PartRow } from './data/parts';
import Slot from '@civ-clone/core-spaceship/Slot';
import parts from './data/parts';

// Our own plain layout for a Civilization II ship (none of the original's art or its 39-square frame): a row of slots
//  for each kind, as many as can be built, the structurals over three rows of 13. A part goes into the first empty slot
//  of its kind (`Rules/Spaceship/choose-slot`) and counts while it is within its kind's limit
//  (`Rules/Spaceship/active`).

export const WIDTH = 13;

const rowsOf = (max: number): number => Math.ceil(max / WIDTH);

export const HEIGHT = parts.reduce(
  (height: number, [, max]: PartRow): number => height + rowsOf(max),
  0
);

/** Every slot, kind by kind in the original's order (`data/parts`), each kind's in the order they fill. */
export const slots = (): Slot[] => {
  let y = 0;

  return parts.flatMap(([PartType, max]: PartRow): Slot[] => {
    const top = y;

    y += rowsOf(max);

    return new Array(max)
      .fill(null)
      .map(
        (_, index: number): Slot =>
          new Slot(index % WIDTH, top + Math.floor(index / WIDTH), 1, 1, [
            PartType,
          ])
      );
  });
};

export class SpaceshipLayout extends Layout {
  constructor(ruleRegistry: RuleRegistry = ruleRegistryInstance) {
    super(HEIGHT, WIDTH, slots(), ruleRegistry);
  }
}

export default SpaceshipLayout;
