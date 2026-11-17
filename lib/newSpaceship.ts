import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import {
  Turn,
  instance as turnInstance,
} from '@civ-clone/core-turn-based-game/Turn';
import { Year, instance as yearInstance } from '@civ-clone/core-game-year/Year';
import Player from '@civ-clone/core-player/Player';
import { PlayerRegistry } from '@civ-clone/core-player/PlayerRegistry';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import SpaceshipLayout from '../SpaceshipLayout';

export interface NewSpaceshipDependencies {
  ruleRegistry?: RuleRegistry;
  spaceshipRegistry?: SpaceshipRegistry;
  turn?: Turn;
  year?: Year;
}

/** A new, empty ship for `player`, on a layout of its own. Not registered. */
export const newSpaceship = (
  player: Player,
  {
    ruleRegistry = ruleRegistryInstance,
    turn = turnInstance,
    year = yearInstance,
  }: NewSpaceshipDependencies = {}
): Spaceship =>
  new Spaceship(
    player,
    new SpaceshipLayout(ruleRegistry),
    ruleRegistry,
    turn,
    year
  );

/** `player`'s ship being built or in flight, registering a new one if it has none. */
export const shipFor = (
  player: Player,
  dependencies: NewSpaceshipDependencies = {}
): Spaceship => {
  const { spaceshipRegistry = spaceshipRegistryInstance } = dependencies,
    spaceship = spaceshipRegistry.getActiveByPlayer(player);

  if (spaceship !== null) {
    return spaceship;
  }

  const created = newSpaceship(player, dependencies);

  spaceshipRegistry.register(created);

  return created;
};

export default newSpaceship;

/**
 * The players who may have a ship: everyone but the barbarians, who never build parts (Civ2 keeps no ship for them).
 *  For `base-spaceship`'s `shipsForNewcomers`, which asks a player registry.
 */
export const shipPlayers = (playerRegistry: PlayerRegistry): PlayerRegistry =>
  ({
    entries: (): Player[] =>
      playerRegistry
        .entries()
        .filter((player: Player): boolean => !isBarbarian(player)),
  } as unknown as PlayerRegistry);
