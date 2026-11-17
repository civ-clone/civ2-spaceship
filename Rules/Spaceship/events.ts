import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { NewSpaceshipDependencies, shipFor } from '../../lib/newSpaceship';
import Built from '@civ-clone/core-spaceship/Rules/Built';
import Effect from '@civ-clone/core-rule/Effect';
import High from '@civ-clone/core-rule/Priorities/High';
import Landed from '@civ-clone/core-spaceship/Rules/Landed';
import Lost from '@civ-clone/core-spaceship/Rules/Lost';
import Part from '@civ-clone/core-spaceship/Part';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import { prefix } from '../../RuleIds';

export interface EventRulesDependencies extends NewSpaceshipDependencies {
  engine?: Engine;
}

export const getRules = (
  dependencies: EventRulesDependencies = {}
): (Built | Landed | Lost)[] => {
  const {
    engine = engineInstance,
    spaceshipRegistry = spaceshipRegistryInstance,
  } = dependencies;

  return [
    new Built(
      `${prefix}:spaceship/built/emit`,
      new Effect((part: Part, spaceship: Spaceship): void => {
        engine.emit('player:spaceship:part-built', spaceship.player());
      })
    ),
    // `High`: announced before the game ends for it (civ2-game-end's `spaceship/landed/game-over`).
    new Landed(
      `${prefix}:spaceship/landed/emit`,
      new High(),
      new Effect((spaceship: Spaceship): void => {
        engine.emit('player:spaceship:landed', spaceship.player());
      })
    ),
    // Whether it had launched: one in flight returns, one being built is destroyed (`civ_spaceship_lost_notify`).
    new Lost(
      `${prefix}:spaceship/lost/emit`,
      new Effect((spaceship: Spaceship): void => {
        engine.emit(
          'player:spaceship:lost',
          spaceship.player(),
          spaceship.launched() !== false
        );
      })
    ),
    // The original resets the ship, and its player may build another: here a new, empty one.
    new Lost(
      `${prefix}:spaceship/lost/new-ship`,
      new Effect((spaceship: Spaceship): void => {
        shipFor(spaceship.player(), { ...dependencies, spaceshipRegistry });
      })
    ),
  ];
};

export default getRules;
