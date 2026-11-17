import { Mass, Population } from '../../Yields';
import { PartRow, parts } from '../../data/parts';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import { Habitation } from '../../Parts';
import Part from '@civ-clone/core-spaceship/Part';
import Yield from '@civ-clone/core-spaceship/Rules/Yield';
import { prefix } from '../../RuleIds';

// What a counted part shows: its mass, in the original's units, and a habitation module's 10,000 colonists. The
//  flight and the chance of success are worked out from the parts themselves (`lib/stats`), not from these.
export const getRules = (): Yield[] => [
  ...parts.map(
    ([PartType, , mass]: PartRow): Yield =>
      new Yield(
        `${prefix}:spaceship/yield/mass/${PartType.name}`,
        new Criterion((part: Part): boolean => part instanceof PartType),
        new Effect((part: Part) => new Mass(mass, part.id()))
      )
  ),
  new Yield(
    `${prefix}:spaceship/yield/population`,
    new Criterion((part: Part): boolean => part instanceof Habitation),
    new Effect((part: Part) => new Population(10000, part.id()))
  ),
];

export default getRules;
