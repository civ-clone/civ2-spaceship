import {
  ClientRegistry,
  instance as clientRegistryInstance,
} from '@civ-clone/core-client/ClientRegistry';
import {
  PendingEffectRegistry,
  instance as pendingEffectRegistryInstance,
} from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import {
  PlayerResearchRegistry,
  instance as playerResearchRegistryInstance,
} from '@civ-clone/core-science/PlayerResearchRegistry';
import {
  SpaceshipRegistry,
  instance as spaceshipRegistryInstance,
} from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { ShipStats, shipStats } from './stats';
import { kindOf, parts } from '../data/parts';
import FusionPower from '@civ-clone/base-science-advance-fusionpower/FusionPower';
import Layout from '@civ-clone/core-spaceship/Layout';
import PendingEffect from '@civ-clone/core-pending-effect/PendingEffect';
import Player from '@civ-clone/core-player/Player';
import Slot from '@civ-clone/core-spaceship/Slot';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';

/** What reading a ship needs. Each defaults to its registry's instance. */
export interface ShipDependencies {
  clientRegistry?: ClientRegistry;
  pendingEffectRegistry?: PendingEffectRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  spaceshipRegistry?: SpaceshipRegistry;
}

/** How many of each kind are in `layout`'s slots, counted or not, in the original's order (`data/parts`). */
export const builtIn = (layout: Layout): number[] =>
  layout.slots().reduce(
    (built: number[], slot: Slot): number[] => {
      const part = slot.part();

      if (part !== null) {
        const kind = kindOf(part);

        if (kind >= 0) {
          built[kind]++;
        }
      }

      return built;
    },
    parts.map(() => 0)
  );

/** How many of each kind `spaceship` has, counted or not. */
export const built = (spaceship: Spaceship): number[] =>
  builtIn(spaceship.layout());

/** The ship whose layout `layout` is, or `null`. */
export const shipOfLayout = (
  layout: Layout,
  spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance
): Spaceship | null =>
  spaceshipRegistry
    .entries()
    .find((spaceship: Spaceship): boolean => spaceship.layout() === layout) ??
  null;

/**
 * Whether `player` has a ship the original would say exists (`civ_spaceship_exists`, `SHIP_EXISTS`): one in flight, or
 *  one with a part built.
 */
export const hasSpaceship = (
  player: Player,
  spaceshipRegistry: SpaceshipRegistry = spaceshipRegistryInstance
): boolean => {
  const spaceship = spaceshipRegistry.getActiveByPlayer(player);

  return (
    spaceship !== null &&
    (spaceship.launched() !== false ||
      spaceship
        .layout()
        .slots()
        .some((slot: Slot) => !slot.empty()))
  );
};

/**
 * The record of a launch, kept in the game's pending effects so it's saved: nothing discharges it. It holds whether the
 *  ship had fusion (`SHIP_FUSION` is set only before the launch), the launch year and the arrival year.
 */
export const LAUNCH_RECORD = 'civ2-spaceship:launch';

export interface LaunchRecord {
  fusion: boolean;
  launchYear: number;
  arrivalYear: number;
}

const recordOf = (
  spaceship: Spaceship,
  pendingEffectRegistry: PendingEffectRegistry
): PendingEffect | null =>
  pendingEffectRegistry
    .getByHandler(LAUNCH_RECORD)
    .find((record: PendingEffect) => record.target() === spaceship) ?? null;

/** `spaceship`'s launch, or `null` before it launches. */
export const launchRecord = (
  spaceship: Spaceship,
  pendingEffectRegistry: PendingEffectRegistry = pendingEffectRegistryInstance
): LaunchRecord | null => {
  const record = recordOf(spaceship, pendingEffectRegistry);

  if (record === null) {
    return null;
  }

  const data = record.data();

  return {
    fusion: data.fusion === '1',
    launchYear: Number(data.launchYear),
    arrivalYear: Number(data.arrivalYear),
  };
};

/** Records `spaceship`'s launch (`Rules/Spaceship/launch`). */
export const recordLaunch = (
  spaceship: Spaceship,
  { fusion, launchYear, arrivalYear }: LaunchRecord,
  pendingEffectRegistry: PendingEffectRegistry = pendingEffectRegistryInstance
): void => {
  const data = {
      fusion: fusion ? '1' : '0',
      launchYear: String(launchYear),
      arrivalYear: String(arrivalYear),
    },
    record = recordOf(spaceship, pendingEffectRegistry);

  if (record !== null) {
    record.setData(data);

    return;
  }

  pendingEffectRegistry.register(
    new PendingEffect(LAUNCH_RECORD, spaceship, data)
  );
};

/** Whether `spaceship` has fusion: as recorded at its launch, or else whether its player knows Fusion Power now. */
export const hasFusion = (
  spaceship: Spaceship,
  {
    pendingEffectRegistry = pendingEffectRegistryInstance,
    playerResearchRegistry = playerResearchRegistryInstance,
  }: ShipDependencies = {}
): boolean => {
  const record = launchRecord(spaceship, pendingEffectRegistry);

  if (record !== null) {
    return record.fusion;
  }

  try {
    return playerResearchRegistry
      .getByPlayer(spaceship.player())
      .completed(FusionPower);
  } catch (e) {
    return false;
  }
};

/** `spaceship`'s numbers (`lib/stats`), with life support applied, for its player as they are now. */
export const statsOf = (
  spaceship: Spaceship,
  dependencies: ShipDependencies = {}
): ShipStats =>
  shipStats(built(spaceship), {
    human: isHuman(
      spaceship.player(),
      dependencies.clientRegistry ?? clientRegistryInstance
    ),
    fusion: hasFusion(spaceship, dependencies),
  });

/** The year `spaceship` arrives: as recorded at its launch, or as it would if it launched now from `year`. */
export const arrivalYear = (
  spaceship: Spaceship,
  year: number,
  dependencies: ShipDependencies = {}
): number => {
  const record = launchRecord(
    spaceship,
    dependencies.pendingEffectRegistry ?? pendingEffectRegistryInstance
  );

  if (record !== null) {
    return record.arrivalYear;
  }

  return year + Math.trunc(statsOf(spaceship, dependencies).arrivalFlight / 10);
};
