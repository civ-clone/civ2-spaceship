import {
  PlayerRegistry,
  instance as playerRegistryInstance,
} from '@civ-clone/core-player/PlayerRegistry';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import {
  NewSpaceshipDependencies,
  newSpaceship,
  shipFor,
} from '../../lib/newSpaceship';
import ApolloProgram from '@civ-clone/base-wonder-apolloprogram/ApolloProgram';
import { BuildableInstance } from '@civ-clone/core-city-build/Buildable';
import BuildingComplete from '@civ-clone/core-city-build/Rules/BulidingComplete';
import CityBuild from '@civ-clone/core-city-build/CityBuild';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Part from '@civ-clone/core-spaceship/Part';
import Player from '@civ-clone/core-player/Player';
import { prefix } from '../../RuleIds';
import shipsForNewcomers from '@civ-clone/base-spaceship/lib/shipsForNewcomers';

export interface BuildingCompleteDependencies extends NewSpaceshipDependencies {
  playerRegistry?: PlayerRegistry;
}

export const getRules = (
  dependencies: BuildingCompleteDependencies = {}
): BuildingComplete[] => {
  const {
    playerRegistry = playerRegistryInstance,
    spaceshipRegistry = spaceshipRegistryInstance,
  } = dependencies;

  return [
    // The Apollo Program lets everyone build parts: here parts go into a ship, so every player gets one, each on a
    //  layout of its own. The original keeps no ship apart from the parts built.
    new BuildingComplete(
      `${prefix}:city/building-complete/apollo-program`,
      new Criterion(
        (cityBuild: CityBuild, built: BuildableInstance): boolean =>
          built instanceof ApolloProgram
      ),
      new Effect((): void =>
        shipsForNewcomers(playerRegistry, spaceshipRegistry, (player: Player) =>
          newSpaceship(player, dependencies)
        )
      )
    ),
    // A part goes onto its player's ship, while it hasn't launched (`spaceship_add_part`, which does nothing once
    //  it has).
    new BuildingComplete(
      `${prefix}:city/building-complete/part`,
      new Criterion(
        (cityBuild: CityBuild, built: BuildableInstance): built is Part =>
          built instanceof Part
      ),
      new Effect((cityBuild: CityBuild, built: BuildableInstance): void => {
        const part = built as Part,
          spaceship = shipFor(part.city().player(), dependencies);

        if (spaceship.launched() !== false) {
          return;
        }

        spaceship.add(part);
      })
    ),
  ];
};

export default getRules;
