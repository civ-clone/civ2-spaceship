import { Build, IBuildCriterion } from '@civ-clone/core-city-build/Rules/Build';
import {
  CityImprovementRegistry,
  instance as cityImprovementRegistryInstance,
} from '@civ-clone/core-city-improvement/CityImprovementRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  Requirement,
  Target,
  met,
} from '@civ-clone/core-requirement/Requirement';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import {
  WonderRegistry,
  instance as wonderRegistryInstance,
} from '@civ-clone/core-wonder/WonderRegistry';
import { Year, instance as yearInstance } from '@civ-clone/core-game-year/Year';
import City from '@civ-clone/core-city/City';
import Criterion from '@civ-clone/core-rule/Criterion';
import { Deriver } from '@civ-clone/core-requirement/RequirementRegistry';
import Effect from '@civ-clone/core-rule/Effect';
import { IConstructor } from '@civ-clone/core-registry/Registry';
import Part from '@civ-clone/core-spaceship/Part';
import RuleIds from '../../RuleIds';
import Wonder from '@civ-clone/core-wonder/Wonder';
import { buildRulesFor as advanceBuildRulesFor } from '@civ-clone/base-city-improvement-rules/lib/build';
import { built } from '../../lib/ship';
import { everBuilt } from '@civ-clone/base-wonder/lib/wonderHistory';
import parts from '../../data/parts';

const isPart = (BuildItem: IConstructor): boolean =>
  Object.prototype.isPrototypeOf.call(Part, BuildItem);

const isWonder = (target: Target): target is typeof Wonder =>
  Object.prototype.isPrototypeOf.call(Wonder, target);

/**
 * The rules `entry` is played by. An entry about `Part` itself, which is never built, is about every part, and a Wonder
 *  in it is met once anyone has ever built it (`everBuilt`). Any other entry is an advance the city's player must
 *  know, as base-city-improvement-rules plays it.
 */
export const buildRulesFor = (
  entry: Requirement,
  wonderRegistry: WonderRegistry = wonderRegistryInstance,
  playerResearchRegistry: PlayerResearchRegistry = playerResearchRegistryInstance,
  cityImprovementRegistry: CityImprovementRegistry = cityImprovementRegistryInstance
): Build[] => {
  if (entry.subject !== Part) {
    return advanceBuildRulesFor(
      entry,
      cityImprovementRegistry,
      playerResearchRegistry
    );
  }

  if (entry.relation !== 'requires') {
    return [];
  }

  return [
    new Build(
      entry.id,
      Part,
      new Criterion((city: City, BuildItem: IConstructor): boolean =>
        isPart(BuildItem)
      ),
      new Effect(
        (): IBuildCriterion =>
          new Criterion((): boolean =>
            met(
              entry,
              (target: Target): boolean =>
                isWonder(target) &&
                everBuilt(target, wonderRegistry, cityImprovementRegistry)
            )
          )
      )
    ),
  ];
};

/** What `registerRules` gives the game's `requirements` to make each entry's rules with. */
export const deriveBuildRules =
  (
    wonderRegistry: WonderRegistry,
    playerResearchRegistry: PlayerResearchRegistry,
    cityImprovementRegistry: CityImprovementRegistry
  ): Deriver =>
  (entry: Requirement): Build[] =>
    buildRulesFor(
      entry,
      wonderRegistry,
      playerResearchRegistry,
      cityImprovementRegistry
    );

/**
 * Parts are built only for a ship that hasn't launched, and only in the years AD (`city_can_build_improvement` ~2185:
 *  `0 < game.year` and `civ_spaceship_launched(civ) == 0`). A player with no ship yet may build them: the first part
 *  brings one (`Rules/City/building-complete`).
 */
export const notLaunchedRule = (
  spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance,
  year: Year = yearInstance
): Build =>
  new Build(
    RuleIds.notLaunched,
    Part,
    new Criterion((city: City, BuildItem: IConstructor): boolean =>
      isPart(BuildItem)
    ),
    new Effect(
      (city: City): IBuildCriterion =>
        new Criterion(
          (): boolean =>
            year.value() > 0 &&
            (spaceshipRegistry.getActiveByPlayer(city.player())?.launched() ??
              false) === false
        )
    )
  );

/**
 * No more of a kind than can be built (39 structurals, 8 of each component, 4 of each module). The original asks a
 *  person again when the kind chosen is full (`spaceship_add_part`); here each kind is its own build.
 */
export const partsLeftRule = (
  spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance
): Build =>
  new Build(
    RuleIds.partsLeft,
    Part,
    new Criterion((city: City, BuildItem: IConstructor): boolean =>
      isPart(BuildItem)
    ),
    new Effect((city: City, BuildItem: IConstructor): IBuildCriterion => {
      const kind = parts.findIndex(([PartType]) => PartType === BuildItem);

      return new Criterion((): boolean => {
        if (kind < 0) {
          return false;
        }

        const spaceship = spaceshipRegistry.getActiveByPlayer(city.player());

        return spaceship === null || built(spaceship)[kind] < parts[kind][1];
      });
    })
  );

export default deriveBuildRules;
