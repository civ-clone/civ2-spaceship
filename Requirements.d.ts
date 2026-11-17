import {
  Condition,
  Requirement,
} from '@civ-clone/core-requirement/Requirement';
/**
 * Every part needs the Apollo Program built, by anyone, and it counts once built even if it's lost with its city since
 *  (OpenCiv2 `src/auto/city.cpp` `city_can_build_improvement` ~2183: `game.wonder_city[WONDER_APOLLO] != -1`, which a
 *  lost Wonder's -2 passes).
 */
export declare const requiresApollo: Requirement[];
/** The advance a city's player needs for each kind (RULES.TXT @IMPROVE, the group's row): one rule each. */
export declare const requiresAdvance: Requirement[];
/** A player whose ship hasn't launched, in the years AD: the hand-written rule's condition. */
export declare const unlaunchedSpaceship: Condition;
/** Parts are built only for a ship that hasn't launched, and only in the years AD (`0 < game.year`). Described only. */
export declare const notLaunched: Requirement;
/** The entries the rules are made from. */
export declare const buildRequirements: Requirement[];
/** The entries that only describe. */
export declare const describedRequirements: Requirement[];
export default buildRequirements;
