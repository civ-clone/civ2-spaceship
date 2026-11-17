import {
  CityBuildRegistry,
  instance as cityBuildRegistryInstance,
} from '@civ-clone/core-city-build/CityBuildRegistry';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  CityRegistry,
  instance as cityRegistryInstance,
} from '@civ-clone/core-city/CityRegistry';
import {
  PlayerRegistry,
  instance as playerRegistryInstance,
} from '@civ-clone/core-player/PlayerRegistry';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import { NewSpaceshipDependencies, newSpaceship } from '../../lib/newSpaceship';
import RuleIds, { prefix } from '../../RuleIds';
import ApolloProgram from '@civ-clone/base-wonder-apolloprogram/ApolloProgram';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import Player from '@civ-clone/core-player/Player';
import Start from '@civ-clone/core-turn-based-game/Rules/Start';
import { everBuilt } from '@civ-clone/base-wonder/lib/wonderHistory';
import landFirstArrival from '@civ-clone/base-spaceship/lib/landFirstArrival';
import shipsForNewcomers from '@civ-clone/base-spaceship/lib/shipsForNewcomers';
import stopPartsInFlight from '@civ-clone/base-spaceship/lib/stopPartsInFlight';

export interface TurnStartDependencies extends NewSpaceshipDependencies {
  cityBuildRegistry?: CityBuildRegistry;
  cityImprovementRegistry?: CityImprovementRegistry;
  cityRegistry?: CityRegistry;
  playerRegistry?: PlayerRegistry;
  wonderRegistry?: WonderRegistry;
}

export const getRules = (dependencies: TurnStartDependencies = {}): Start[] => {
  const {
    cityBuildRegistry = cityBuildRegistryInstance,
    cityImprovementRegistry = cityImprovementRegistryInstance,
    cityRegistry = cityRegistryInstance,
    playerRegistry = playerRegistryInstance,
    spaceshipRegistry = spaceshipRegistryInstance,
    wonderRegistry = wonderRegistryInstance,
  } = dependencies;

  return [
    // As the turn starts, the first launched ship whose arrival year has come lands, in player order, one a turn
    //  (OpenCiv2 `src/auto/game.cpp` `game_advance_turn` ~1735: `year >= arrival_year`, civs 1 to 7). `High`, before
    //  civ2-game-end's retirement, as the original checks the arrival first.
    new Start(
      RuleIds.arrival,
      new High(),
      new Effect((): void => {
        landFirstArrival(playerRegistry, spaceshipRegistry);
      })
    ),
    // A ship can't change in flight, so its player's cities stop building parts for it.
    new Start(
      `${prefix}:turn/start/stop-parts-in-flight`,
      new Effect((): void =>
        stopPartsInFlight(spaceshipRegistry, cityRegistry, cityBuildRegistry)
      )
    ),
    // Once the Apollo Program has been built, by anyone and even if lost since, every player has a ship to build
    //  parts into: a civilization that comes back, or rebels, get one too.
    new Start(
      `${prefix}:turn/start/ships-for-newcomers`,
      new Effect((): void => {
        if (
          !everBuilt(ApolloProgram, wonderRegistry, cityImprovementRegistry)
        ) {
          return;
        }

        shipsForNewcomers(playerRegistry, spaceshipRegistry, (player: Player) =>
          newSpaceship(player, dependencies)
        );
      })
    ),
  ];
};

export default getRules;
