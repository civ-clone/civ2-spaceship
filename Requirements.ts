import {
  Condition,
  Requirement,
  table,
} from '@civ-clone/core-requirement/Requirement';
import { PartRow, parts } from './data/parts';
import Advance from '@civ-clone/core-science/Advance';
import ApolloProgram from '@civ-clone/base-wonder-apolloprogram/ApolloProgram';
import Part from '@civ-clone/core-spaceship/Part';
import RuleIds from './RuleIds';

// What Civilization II's spaceship parts need, as the entries `Rules/City/build` makes its rules from. `registerRules`
//  adds them to the game's `requirements`, where a computer player's space race can read them.

/**
 * Every part needs the Apollo Program built, by anyone, and it counts once built even if it's lost with its city since
 *  (OpenCiv2 `src/auto/city.cpp` `city_can_build_improvement` ~2183: `game.wonder_city[WONDER_APOLLO] != -1`, which a
 *  lost Wonder's -2 passes).
 */
export const requiresApollo: Requirement[] = table(
  RuleIds.requiresApollo,
  'requires',
  [[Part, ApolloProgram]],
  { range: 'world' }
);

/** The advance a city's player needs for each kind (RULES.TXT @IMPROVE, the group's row): one rule each. */
export const requiresAdvance: Requirement[] = table(
  RuleIds.requiresAdvance,
  'requires',
  parts.map(
    ([PartType, , , , advance]: PartRow): [typeof Part, typeof Advance] => [
      PartType,
      advance,
    ]
  )
);

/** A player whose ship hasn't launched, in the years AD: the hand-written rule's condition. */
export const unlaunchedSpaceship = new Condition(
  `${RuleIds.notLaunched}/condition`
);

/** Parts are built only for a ship that hasn't launched, and only in the years AD (`0 < game.year`). Described only. */
export const notLaunched = new Requirement({
  id: RuleIds.notLaunched,
  subject: Part,
  relation: 'requires',
  targets: [unlaunchedSpaceship],
});

/** The entries the rules are made from. */
export const buildRequirements: Requirement[] = [
  ...requiresApollo,
  ...requiresAdvance,
];

/** The entries that only describe. */
export const describedRequirements: Requirement[] = [notLaunched];

export default buildRequirements;
