import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import Action from '@civ-clone/core-player/Rules/Action';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import LaunchSpaceship from '@civ-clone/base-player-action-launch-spaceship/LaunchSpaceship';
import Player from '@civ-clone/core-player/Player';
import { prefix } from '../../RuleIds';

export const getRules = (
  spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance
): Action[] => [
  // A person may launch a ship that hasn't launched once it may (`Rules/Spaceship/launchable`): `launch()` does nothing
  //  while it may not, so the action is offered only then (`spaceship_status_dialog`'s launch button).
  new Action(
    `${prefix}:player/action/launch`,
    new Criterion((player: Player): boolean => {
      const spaceship = spaceshipRegistry.getActiveByPlayer(player);

      return (
        spaceship !== null &&
        spaceship.launched() === false &&
        spaceship.launchable()
      );
    }),
    new Effect((player: Player): LaunchSpaceship[] => [
      new LaunchSpaceship(player, spaceshipRegistry.getActiveByPlayer(player)!),
    ])
  ),
];

export default getRules;
