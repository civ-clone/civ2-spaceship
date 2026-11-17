import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { SpaceshipRegistry } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { Turn } from '@civ-clone/core-turn-based-game/Turn';
import { Year } from '@civ-clone/core-game-year/Year';
import Player from '@civ-clone/core-player/Player';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
export interface NewSpaceshipDependencies {
  ruleRegistry?: RuleRegistry;
  spaceshipRegistry?: SpaceshipRegistry;
  turn?: Turn;
  year?: Year;
}
/** A new, empty ship for `player`, on a layout of its own. Not registered. */
export declare const newSpaceship: (
  player: Player,
  { ruleRegistry, turn, year }?: NewSpaceshipDependencies
) => Spaceship;
/** `player`'s ship being built or in flight, registering a new one if it has none. */
export declare const shipFor: (
  player: Player,
  dependencies?: NewSpaceshipDependencies
) => Spaceship;
export default newSpaceship;
