import { Build } from '@civ-clone/core-city-build/Rules/Build';
import { CityImprovementRegistry } from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { Requirement } from '@civ-clone/core-requirement/Requirement';
import { SpaceshipRegistry } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { WonderRegistry } from '@civ-clone/core-wonder/WonderRegistry';
import { Year } from '@civ-clone/core-game-year/Year';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
/**
 * The rules `entry` is played by. An entry about `Part` itself, which is never built, is about every part, and a Wonder
 *  in it is met once anyone has ever built it (`everBuilt`). Any other entry is an advance the city's player must
 *  know, as base-city-improvement-rules plays it.
 */
export declare const buildRulesFor: (
  entry: Requirement,
  wonderRegistry?: WonderRegistry,
  playerResearchRegistry?: PlayerResearchRegistry,
  cityImprovementRegistry?: CityImprovementRegistry
) => Build[];
/** What `registerRules` gives the game's `requirements` to make each entry's rules with. */
export declare const deriveBuildRules: (
  wonderRegistry: WonderRegistry,
  playerResearchRegistry: PlayerResearchRegistry,
  cityImprovementRegistry: CityImprovementRegistry
) => Deriver;
/**
 * Parts are built only for a ship that hasn't launched, and only in the years AD (`city_can_build_improvement` ~2185:
 *  `0 < game.year` and `civ_spaceship_launched(civ) == 0`). A player with no ship yet may build them: the first part
 *  brings one (`Rules/City/building-complete`).
 */
export declare const notLaunchedRule: (
  spaceshipRegistry?: SpaceshipRegistry,
  year?: Year
) => Build;
/**
 * No more of a kind than can be built (39 structurals, 8 of each component, 4 of each module). The original asks a
 *  person again when the kind chosen is full (`spaceship_add_part`); here each kind is its own build.
 */
export declare const partsLeftRule: (
  spaceshipRegistry?: SpaceshipRegistry
) => Build;
export default deriveBuildRules;
