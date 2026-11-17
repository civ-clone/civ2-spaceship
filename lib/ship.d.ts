import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { PendingEffectRegistry } from '@civ-clone/core-pending-effect/PendingEffectRegistry';
import { PlayerResearchRegistry } from '@civ-clone/core-science/PlayerResearchRegistry';
import { SpaceshipRegistry } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import { ShipStats } from './stats';
import Layout from '@civ-clone/core-spaceship/Layout';
import Player from '@civ-clone/core-player/Player';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
/** What reading a ship needs. Each defaults to its registry's instance. */
export interface ShipDependencies {
  clientRegistry?: ClientRegistry;
  pendingEffectRegistry?: PendingEffectRegistry;
  playerResearchRegistry?: PlayerResearchRegistry;
  spaceshipRegistry?: SpaceshipRegistry;
}
/** How many of each kind are in `layout`'s slots, counted or not, in the original's order (`data/parts`). */
export declare const builtIn: (layout: Layout) => number[];
/** How many of each kind `spaceship` has, counted or not. */
export declare const built: (spaceship: Spaceship) => number[];
/** The ship whose layout `layout` is, or `null`. */
export declare const shipOfLayout: (
  layout: Layout,
  spaceshipRegistry?: SpaceshipRegistry
) => Spaceship | null;
/**
 * Whether `player` has a ship the original would say exists (`civ_spaceship_exists`, `SHIP_EXISTS`): one in flight, or
 *  one with a part built.
 */
export declare const hasSpaceship: (
  player: Player,
  spaceshipRegistry?: SpaceshipRegistry
) => boolean;
/**
 * The record of a launch, kept in the game's pending effects so it's saved: nothing discharges it. It holds whether the
 *  ship had fusion (`SHIP_FUSION` is set only before the launch), the launch year and the arrival year.
 */
export declare const LAUNCH_RECORD = 'civ2-spaceship:launch';
export interface LaunchRecord {
  fusion: boolean;
  launchYear: number;
  arrivalYear: number;
}
/** `spaceship`'s launch, or `null` before it launches. */
export declare const launchRecord: (
  spaceship: Spaceship,
  pendingEffectRegistry?: PendingEffectRegistry
) => LaunchRecord | null;
/** Records `spaceship`'s launch (`Rules/Spaceship/launch`). */
export declare const recordLaunch: (
  spaceship: Spaceship,
  { fusion, launchYear, arrivalYear }: LaunchRecord,
  pendingEffectRegistry?: PendingEffectRegistry
) => void;
/** Whether `spaceship` has fusion: as recorded at its launch, or else whether its player knows Fusion Power now. */
export declare const hasFusion: (
  spaceship: Spaceship,
  { pendingEffectRegistry, playerResearchRegistry }?: ShipDependencies
) => boolean;
/** `spaceship`'s numbers (`lib/stats`), with life support applied, for its player as they are now. */
export declare const statsOf: (
  spaceship: Spaceship,
  dependencies?: ShipDependencies
) => ShipStats;
/** The year `spaceship` arrives: as recorded at its launch, or as it would if it launched now from `year`. */
export declare const arrivalYear: (
  spaceship: Spaceship,
  year: number,
  dependencies?: ShipDependencies
) => number;
