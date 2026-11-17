import {
  Engine,
  instance as engineInstance,
} from '@civ-clone/core-engine/Engine';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  ShipDependencies,
  built,
  launchRecord,
  recordLaunch,
  hasFusion,
  statsOf,
} from '../../lib/ship';
import { Year, instance as yearInstance } from '@civ-clone/core-game-year/Year';
import ChanceOfSuccess from '@civ-clone/core-spaceship/Rules/ChanceOfSuccess';
import Effect from '@civ-clone/core-rule/Effect';
import FlightTime from '@civ-clone/core-spaceship/Rules/FlightTime';
import { HABITATION } from '../../data/parts';
import Launch from '@civ-clone/core-spaceship/Rules/Launch';
import Launchable from '@civ-clone/core-spaceship/Rules/Launchable';
import RuleIds, { prefix } from '../../RuleIds';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import { flightYears } from '../../lib/stats';
import { instance as pendingEffectRegistryInstance } from '@civ-clone/core-pending-effect/PendingEffectRegistry';

export interface StatsRulesDependencies extends ShipDependencies {
  engine?: Engine;
  ruleRegistry?: RuleRegistry;
  year?: Year;
}

export const getRules = (
  dependencies: StatsRulesDependencies = {}
): (ChanceOfSuccess | FlightTime | Launch | Launchable)[] => {
  const {
    engine = engineInstance,
    pendingEffectRegistry = pendingEffectRegistryInstance,
    year = yearInstance,
  } = dependencies;

  return [
    // The whole years the flight takes: the arrival year less the launch year (`spaceship_calc_stats`: the launch
    //  year + full-mass flight / 10). Once launched, as recorded then.
    new FlightTime(
      `${prefix}:spaceship/flight-time`,
      new Effect((spaceship: Spaceship): number => {
        const record = launchRecord(spaceship, pendingEffectRegistry);

        if (record !== null) {
          return record.arrivalYear - record.launchYear;
        }

        return flightYears(statsOf(spaceship, dependencies).arrivalFlight);
      })
    ),
    // The chance of success, with life support applied, as a fraction. It only scales the score: an arriving ship
    //  always lands.
    new ChanceOfSuccess(
      `${prefix}:spaceship/chance-of-success`,
      new Effect(
        (spaceship: Spaceship): number =>
          statsOf(spaceship, dependencies).success / 100
      )
    ),
    // A ship launches with at least one habitation module built and a chance of success above 0 (`spaceship.cpp`
    //  `spaceship_status_dialog` ~1640, the launch button).
    new Launchable(
      RuleIds.launchable,
      new Effect(
        (spaceship: Spaceship): boolean =>
          built(spaceship)[HABITATION] > 0 &&
          statsOf(spaceship, dependencies).success > 0
      )
    ),
    // The launch is recorded: whether it has fusion (set only before the launch), the year and the arrival year.
    //  Then `player:spaceship:launched` is emitted with the player and the arrival year.
    new Launch(
      `${prefix}:spaceship/launch/record`,
      new Effect((spaceship: Spaceship): void => {
        const fusion = hasFusion(spaceship, dependencies),
          launchYear = year.value(),
          arrivalYear =
            launchYear +
            flightYears(statsOf(spaceship, dependencies).arrivalFlight);

        recordLaunch(
          spaceship,
          { fusion, launchYear, arrivalYear },
          pendingEffectRegistry
        );

        engine.emit(
          'player:spaceship:launched',
          spaceship.player(),
          arrivalYear
        );
      })
    ),
  ];
};

export default getRules;
