import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import CapitalsLost, { isCapital } from '../../lib/capitalLost';
import Captured from '@civ-clone/core-city/Rules/Captured';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import Low from '@civ-clone/core-rule/Priorities/Low';
import Player from '@civ-clone/core-player/Player';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';
import { prefix } from '../../RuleIds';

export interface CapturedDependencies {
  cityImprovementRegistry?: CityImprovementRegistry;
  clientRegistry?: ClientRegistry;
  spaceshipRegistry?: SpaceshipRegistry;
}

export const getRules = (
  capitalsLost: CapitalsLost,
  {
    cityImprovementRegistry = cityImprovementRegistryInstance,
    clientRegistry = clientRegistryInstance,
    spaceshipRegistry = spaceshipRegistryInstance,
  }: CapturedDependencies = {}
): Captured[] => [
  // Losing the capital loses the ship, unless the Palace escapes (`city_capture_aftermath_palace_escape`). `High`, so
  //  the Palace is still there to find: civ2-city-improvement's own rules move it or destroy it.
  new Captured(
    `${prefix}:city/captured/capital`,
    new High(),
    new Criterion((city: City): boolean =>
      isCapital(city, cityImprovementRegistry)
    ),
    new Effect((city: City, capturer: Player, loser: Player): void =>
      capitalsLost.add(loser)
    )
  ),
  // A computer player's escape is decided by then: `Low`, after civ2-city-improvement's. A person's waits for the
  //  start of the next turn (`Rules/Turn/start`). Asked in the effect: every rule's criteria are checked before any
  //  effect runs, so a criterion here can't see the capital the rule above has just noted.
  new Captured(
    `${prefix}:city/captured/ship-lost`,
    new Low(),
    new Effect((city: City, capturer: Player, loser: Player): void => {
      if (capitalsLost.has(loser) && !isHuman(loser, clientRegistry)) {
        capitalsLost.settle(loser, cityImprovementRegistry, spaceshipRegistry);
      }
    })
  ),
];

export default getRules;
