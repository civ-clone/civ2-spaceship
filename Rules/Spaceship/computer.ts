import {
  ComputerShip,
  LaunchWait,
  OtherShip,
  launches,
  nextPart,
} from '../../lib/computer';
import {
  GameDifficultyRegistry,
  instance as gameDifficultyRegistryInstance,
} from '@civ-clone/core-difficulty/GameDifficultyRegistry';
import {
  PlayerRegistry,
  instance as playerRegistryInstance,
} from '@civ-clone/core-player/PlayerRegistry';
import {
  PlayerTreasuryRegistry,
  instance as playerTreasuryRegistryInstance,
} from '@civ-clone/core-treasury/PlayerTreasuryRegistry';
import {
  RuleRegistry,
  instance as ruleRegistryInstance,
} from '@civ-clone/core-rule/RuleRegistry';
import {
  ShipDependencies,
  arrivalYear,
  built,
  hasFusion,
  hasLaunched,
  hasSpaceship,
} from '../../lib/ship';
import { Year, instance as yearInstance } from '@civ-clone/core-game-year/Year';
import { parts, partTypes } from '../../data/parts';
import { instance as clientRegistryInstance } from '@civ-clone/core-client/ClientRegistry';
import { instance as playerResearchRegistryInstance } from '@civ-clone/core-science/PlayerResearchRegistry';
import { instance as spaceshipRegistryInstance } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import ComputerLaunch from '@civ-clone/base-spaceship/lib/Rules/ComputerLaunch';
import ComputerSpaceshipPart from '@civ-clone/base-spaceship/lib/Rules/ComputerSpaceshipPart';
import Criterion from '@civ-clone/core-rule/Criterion';
import Effect from '@civ-clone/core-rule/Effect';
import Gold from '@civ-clone/base-city-yield-gold/Gold';
import Part from '@civ-clone/core-spaceship/Part';
import Player from '@civ-clone/core-player/Player';
import RuleIds from '../../RuleIds';
import Spaceship from '@civ-clone/core-spaceship/Spaceship';
import isBarbarian from '@civ-clone/base-civilization-barbarian/isBarbarian';
import isHuman from '@civ-clone/base-difficulty/lib/isHuman';
import { levelOf } from '@civ-clone/civ2-difficulty/level';
import { rankings } from '@civ-clone/core-power/lib/rank';

/** What a computer player's choices read. Each defaults to its registry's instance. */
export interface ComputerDependencies extends ShipDependencies {
  gameDifficultyRegistry?: GameDifficultyRegistry;
  playerRegistry?: PlayerRegistry;
  playerTreasuryRegistry?: PlayerTreasuryRegistry;
  ruleRegistry?: RuleRegistry;
  year?: Year;
}

const goldOf = (
  player: Player,
  playerTreasuryRegistry: PlayerTreasuryRegistry
): number => {
  try {
    return playerTreasuryRegistry.getByPlayerAndType(player, Gold).value();
  } catch (e) {
    return 0;
  }
};

/**
 * `spaceship`, a computer player's, as `lib/computer` reads it: with one more of each kind for each in `building` (the
 *  parts its cities are building already, so that two cities don't add the same part the ship wants once).
 */
export const computerShip = (
  spaceship: Spaceship,
  dependencies: ComputerDependencies = {},
  building: (typeof Part)[] = []
): ComputerShip => {
  const {
      clientRegistry = clientRegistryInstance,
      gameDifficultyRegistry = gameDifficultyRegistryInstance,
      playerRegistry = playerRegistryInstance,
      playerResearchRegistry = playerResearchRegistryInstance,
      playerTreasuryRegistry = playerTreasuryRegistryInstance,
      ruleRegistry = ruleRegistryInstance,
      spaceshipRegistry = spaceshipRegistryInstance,
      year = yearInstance,
    } = dependencies,
    player = spaceship.player(),
    now = year.value(),
    counts = built(spaceship),
    research = playerResearchRegistry.getByPlayer(player),
    players = playerRegistry
      .entries()
      .filter((other: Player): boolean => !isBarbarian(other)),
    ranked = rankings(players, ruleRegistry);

  building.forEach((PartType: typeof Part): void => {
    const kind = partTypes.indexOf(PartType);

    if (kind >= 0) {
      counts[kind]++;
    }
  });

  return {
    built: counts,
    launched: hasLaunched(player, spaceshipRegistry),
    // Each group's advance, that of its first kind: Space Flight, Plastics, Superconductor.
    knows: [0, 1, 3].map((kind: number): boolean =>
      research.completed(parts[kind][4])
    ),
    fusion: hasFusion(spaceship, dependencies),
    year: now,
    level: levelOf(gameDifficultyRegistry),
    others: players
      .filter((other: Player): boolean => other !== player)
      .map((other: Player): OtherShip | null => {
        const ship = spaceshipRegistry.getActiveByPlayer(other);

        if (ship === null) {
          return null;
        }

        const exists = hasSpaceship(other, spaceshipRegistry);

        return {
          human: isHuman(other, clientRegistry),
          launched: hasLaunched(other, spaceshipRegistry),
          exists,
          arrivalYear: exists ? arrivalYear(ship, now, dependencies) : 0,
          stronger: ranked.indexOf(other) < ranked.indexOf(player),
          gold: goldOf(other, playerTreasuryRegistry),
        };
      })
      .filter((other: OtherShip | null): other is OtherShip => other !== null),
  };
};

/**
 * The rule a computer player's launch is decided by (`lib/computer` `launches`), waiting for another computer player's
 *  launch as `wait` says: `RuleIds.computerLaunch`, the original's, with `'classic'`; civ2-enhanced registers one with
 *  `'other-computers'` under its own id.
 */
export const computerLaunchRule = (
  id: string,
  wait: LaunchWait,
  dependencies: ComputerDependencies = {}
): ComputerLaunch =>
  new ComputerLaunch(
    id,
    new Criterion(
      (spaceship: Spaceship): boolean =>
        !isHuman(
          spaceship.player(),
          dependencies.clientRegistry ?? clientRegistryInstance
        )
    ),
    new Effect((spaceship: Spaceship): boolean =>
      launches(computerShip(spaceship, dependencies), wait)
    )
  );

/**
 * A computer player's spaceship, for an AI client to read (base-spaceship's `ComputerSpaceshipPart` and
 *  `ComputerLaunch`): the part it adds next, of those available, counting the parts its cities are building as added;
 *  and whether it launches, with the original's wait for another computer's launch, which never waits.
 */
export const getRules = (
  dependencies: ComputerDependencies = {}
): (ComputerSpaceshipPart | ComputerLaunch)[] => [
  new ComputerSpaceshipPart(
    RuleIds.computerPart,
    new Criterion(
      (spaceship: Spaceship): boolean =>
        !isHuman(
          spaceship.player(),
          dependencies.clientRegistry ?? clientRegistryInstance
        )
    ),
    new Effect(
      (
        spaceship: Spaceship,
        available: (typeof Part)[],
        building: (typeof Part)[]
      ): typeof Part | null => {
        const kind = nextPart(computerShip(spaceship, dependencies, building)),
          PartType = kind < 0 ? null : partTypes[kind];

        return PartType !== null && available.includes(PartType)
          ? PartType
          : null;
      }
    )
  ),
  computerLaunchRule(RuleIds.computerLaunch, 'classic', dependencies),
];

export default getRules;
