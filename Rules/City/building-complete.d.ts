import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { NewSpaceshipDependencies } from '../../lib/newSpaceship';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
export interface BuildingCompleteDependencies extends NewSpaceshipDependencies {
  playerRegistry?: PlayerRegistry;
}
export declare const getRules: (
  dependencies?: BuildingCompleteDependencies
) => BuildingComplete[];
export default getRules;
