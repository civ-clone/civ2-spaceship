import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import Layout from '@civ-clone/core-spaceship/Layout';
import Slot from '@civ-clone/core-spaceship/Slot';
export declare const WIDTH = 13;
export declare const HEIGHT: number;
/** Every slot, kind by kind in the original's order (`data/parts`), each kind's in the order they fill. */
export declare const slots: () => Slot[];
export declare class SpaceshipLayout extends Layout {
  constructor(ruleRegistry?: RuleRegistry);
}
export default SpaceshipLayout;
