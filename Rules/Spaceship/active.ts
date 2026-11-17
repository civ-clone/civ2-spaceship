import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { builtIn, shipOfLayout } from '../../lib/ship';
import Active from '@civ-clone/core-spaceship/Rules/Active';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Layout from '@civ-clone/core-spaceship/Layout';
import Slot from '@civ-clone/core-spaceship/Slot';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';
import { kindOf } from '../../data/parts';
import { partLimit } from '../../lib/stats';
import { prefix } from '../../RuleIds';

export const getRules = (
  spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance,
  clientRegistry: ClientRegistry = clientRegistryInstance
): Active[] => [
  // A part counts while it is within its kind's limit, which the structurals built set (`spaceship_part_limit`): the
  //  first parts of each kind count, any after the limit are built but don't. A computer player's ship counts at most
  //  one of each module. The ship's owner is its player's, whoever built the part.
  new Active(
    `${prefix}:spaceship/active/part-limit`,
    new Criterion((slot: Slot): boolean => slot.part() !== null),
    new Effect((slot: Slot, layout: Layout): boolean => {
      const kind = kindOf(slot.part()!);

      if (kind < 0) {
        return false;
      }

      const index = layout
          .slots()
          .filter(
            (other: Slot): boolean =>
              other.part() !== null && kindOf(other.part()!) === kind
          )
          .indexOf(slot),
        spaceship = shipOfLayout(layout, spaceshipRegistry),
        human =
          spaceship === null || isHuman(spaceship.player(), clientRegistry);

      return index < partLimit(kind, builtIn(layout)[0], human);
    })
  ),
];

export default getRules;
