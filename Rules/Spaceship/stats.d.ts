import { Engine } from '@civ-clone/core-engine/Engine';
import { RuleRegistry } from '@civ-clone/core-rule/RuleRegistry';
import { ShipDependencies } from '../../lib/ship';
import { Year } from '@civ-clone/core-game-year/Year';
import ChanceOfSuccess from '@civ-clone/core-spaceship/Rules/ChanceOfSuccess';
import FlightTime from '@civ-clone/core-spaceship/Rules/FlightTime';
import Launch from '@civ-clone/core-spaceship/Rules/Launch';
import Launchable from '@civ-clone/core-spaceship/Rules/Launchable';
export interface StatsRulesDependencies extends ShipDependencies {
  engine?: Engine;
  ruleRegistry?: RuleRegistry;
  year?: Year;
}
export declare const getRules: (
  dependencies?: StatsRulesDependencies
) => (ChanceOfSuccess | FlightTime | Launch | Launchable)[];
export default getRules;
