import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import Defeated from '@civ-clone/core-player/Rules/Defeated';
import Effect from '@civ-clone/core-rule/Effect';
import Player from '@civ-clone/core-player/Player';
import cancelSpaceship from '@civ-clone/base-spaceship/lib/cancelSpaceship';
import { prefix } from '../../RuleIds';

export const getRules = (
  spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance
): Defeated[] => [
  // A civilization destroyed loses its ship (OpenCiv2 `src/auto/civ.cpp` `civ_check_destroyed` ~4856).
  new Defeated(
    `${prefix}:player/defeated/ship-lost`,
    new Effect((player: Player): void =>
      cancelSpaceship(player, spaceshipRegistry)
    )
  ),
];

export default getRules;
