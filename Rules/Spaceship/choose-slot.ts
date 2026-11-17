import ChooseSlot from '@civ-clone/core-spaceship/Rules/ChooseSlot';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Layout from '@civ-clone/core-spaceship/Layout';
import Part from '@civ-clone/core-spaceship/Part';
import Slot from '@civ-clone/core-spaceship/Slot';
import { prefix } from '../../RuleIds';

const firstFree = (part: Part, layout: Layout): Slot | undefined =>
  layout.slots().find((slot: Slot) => slot.empty() && slot.accepts(part));

export const getRules = (): ChooseSlot[] => [
  // Each part goes into the first empty slot of its kind (`SpaceshipLayout`).
  new ChooseSlot(
    `${prefix}:spaceship/choose-slot/first-free`,
    new Criterion(
      (part: Part, layout: Layout): boolean =>
        firstFree(part, layout) !== undefined
    ),
    new Effect((part: Part, layout: Layout): Slot => firstFree(part, layout)!)
  ),
];

export default getRules;
