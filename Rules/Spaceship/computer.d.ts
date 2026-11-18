import { ComputerShip, LaunchWait } from '../../lib/computer';
import { GameDifficultyRegistry } from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { PlayerTreasuryRegistry } from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { ShipDependencies } from '../../lib/ship';
import { Year } from '@civ-clone/core-game-year/Year';
import ComputerLaunch from '@civ-clone/base-spaceship/lib/Rules/ComputerLaunch';
import ComputerSpaceshipPart from '@civ-clone/base-spaceship/lib/Rules/ComputerSpaceshipPart';
import Part from '@civ-clone/core-spaceship/Part';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
/** What a computer player's choices read. Each defaults to its registry's instance. */
export interface ComputerDependencies extends ShipDependencies {
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerRegistry?: PlayerRegistry;
  playerTreasuryRegistry?: PlayerTreasuryRegistry;
  ruleRegistry?: RuleRegistry;
  year?: Year;
}
/**
 * `spaceship`, a computer player's, as `lib/computer` reads it: with one more of each kind for each in `building` (the
 *  parts its cities are building already, so that two cities don't add the same part the ship wants once).
 */
export declare const computerShip: (
  spaceship: Spaceship,
  dependencies?: ComputerDependencies,
  building?: (typeof Part)[]
) => ComputerShip;
/**
 * The rule a computer player's launch is decided by (`lib/computer` `launches`), waiting for another computer player's
 *  launch as `wait` says: `RuleIds.computerLaunch`, the original's, with `'classic'`; civ2-enhanced registers one with
 *  `'other-computers'` under its own id.
 */
export declare const computerLaunchRule: (
  id: string,
  wait: LaunchWait,
  dependencies?: ComputerDependencies
) => ComputerLaunch;
/**
 * A computer player's spaceship, for an AI client to read (base-spaceship's `ComputerSpaceshipPart` and
 *  `ComputerLaunch`): the part it adds next, of those available, counting the parts its cities are building as added;
 *  and whether it launches, with the original's wait for another computer's launch, which never waits.
 */
export declare const getRules: (
  dependencies?: ComputerDependencies
) => (ComputerSpaceshipPart | ComputerLaunch)[];
export default getRules;
