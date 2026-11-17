import { Engine } from '@civ-clone/core-engine/Engine';
import { NewSpaceshipDependencies } from '../../lib/newSpaceship';
import Built from '@civ-clone/core-spaceship/Rules/Built';
import Landed from '@civ-clone/core-spaceship/Rules/Landed';
import Lost from '@civ-clone/core-spaceship/Rules/Lost';
export interface EventRulesDependencies extends NewSpaceshipDependencies {
  engine?: Engine;
}
export declare const getRules: (
  dependencies?: EventRulesDependencies
) => (Built | Landed | Lost)[];
export default getRules;
