import { CityBuildRegistry } from '@civ-clone/core-city-build/CityBuildRegistry';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { CityRegistry } from '@civ-clone/core-city/CityRegistry';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import { NewSpaceshipDependencies } from '../../lib/newSpaceship';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
export interface TurnStartDependencies extends NewSpaceshipDependencies {
  cityBuildRegistry?: CityBuildRegistry;
  cityImprovementRegistry?: CityImprovementRegistry;
  cityRegistry?: CityRegistry;
  playerRegistry?: PlayerRegistry;
  wonderRegistry?: WonderRegistry;
}
export declare const getRules: (
  dependencies?: TurnStartDependencies
) => Start[];
export default getRules;
