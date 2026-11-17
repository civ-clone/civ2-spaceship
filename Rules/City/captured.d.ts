import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { SpaceshipRegistry } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import CapitalsLost from '../../lib/capitalLost';
import Captured from '@civ-clone/core-city/Rules/Captured';
export interface CapturedDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  clientRegistry?: ClientRegistry;
  spaceshipRegistry?: SpaceshipRegistry;
}
export declare const getRules: (
  capitalsLost: CapitalsLost,
  {
    cityImprovementRegistry,
    clientRegistry,
    spaceshipRegistry,
  }?: CapturedDependencies
) => Captured[];
export default getRules;
