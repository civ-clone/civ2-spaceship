"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = exports.computerLaunchRule = exports.computerShip = void 0;
const computer_1 = require("../../lib/computer");
const GameDifficultyRegistry_1 = require("@civ-clone/core-difficulty/GameDifficultyRegistry");
const PlayerRegistry_1 = require("@civ-clone/core-player/PlayerRegistry");
const PlayerTreasuryRegistry_1 = require("@civ-clone/core-treasury/PlayerTreasuryRegistry");
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const ship_1 = require("../../lib/ship");
const Year_1 = require("@civ-clone/core-game-year/Year");
const parts_1 = require("../../data/parts");
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const ComputerLaunch_1 = require("@civ-clone/base-spaceship/lib/Rules/ComputerLaunch");
const ComputerSpaceshipPart_1 = require("@civ-clone/base-spaceship/lib/Rules/ComputerSpaceshipPart");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Gold_1 = require("@civ-clone/base-city-yield-gold/Gold");
const RuleIds_1 = require("../../RuleIds");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const isHuman_1 = require("@civ-clone/base-difficulty/lib/isHuman");
const level_1 = require("@civ-clone/civ2-difficulty/level");
const rank_1 = require("@civ-clone/core-power/lib/rank");
const goldOf = (player, playerTreasuryRegistry) => {
    try {
        return playerTreasuryRegistry.getByPlayerAndType(player, Gold_1.default).value();
    }
    catch (e) {
        return 0;
    }
};
/**
 * `spaceship`, a computer player's, as `lib/computer` reads it: with one more of each kind for each in `building` (the
 *  parts its cities are building already, so that two cities don't add the same part the ship wants once).
 */
const computerShip = (spaceship, dependencies = {}, building = []) => {
    const { clientRegistry = ClientRegistry_1.instance, gameDifficultyRegistry = GameDifficultyRegistry_1.instance, playerRegistry = PlayerRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, playerTreasuryRegistry = PlayerTreasuryRegistry_1.instance, ruleRegistry = RuleRegistry_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance, year = Year_1.instance, } = dependencies, player = spaceship.player(), now = year.value(), counts = (0, ship_1.built)(spaceship), research = playerResearchRegistry.getByPlayer(player), players = playerRegistry
        .entries()
        .filter((other) => !(0, isBarbarian_1.default)(other)), ranked = (0, rank_1.rankings)(players, ruleRegistry);
    building.forEach((PartType) => {
        const kind = parts_1.partTypes.indexOf(PartType);
        if (kind >= 0) {
            counts[kind]++;
        }
    });
    return {
        built: counts,
        launched: (0, ship_1.hasLaunched)(player, spaceshipRegistry),
        // Each group's advance, that of its first kind: Space Flight, Plastics, Superconductor.
        knows: [0, 1, 3].map((kind) => research.completed(parts_1.parts[kind][4])),
        fusion: (0, ship_1.hasFusion)(spaceship, dependencies),
        year: now,
        level: (0, level_1.levelOf)(gameDifficultyRegistry),
        others: players
            .filter((other) => other !== player)
            .map((other) => {
            const ship = spaceshipRegistry.getActiveByPlayer(other);
            if (ship === null) {
                return null;
            }
            const exists = (0, ship_1.hasSpaceship)(other, spaceshipRegistry);
            return {
                human: (0, isHuman_1.default)(other, clientRegistry),
                launched: (0, ship_1.hasLaunched)(other, spaceshipRegistry),
                exists,
                arrivalYear: exists ? (0, ship_1.arrivalYear)(ship, now, dependencies) : 0,
                stronger: ranked.indexOf(other) < ranked.indexOf(player),
                gold: goldOf(other, playerTreasuryRegistry),
            };
        })
            .filter((other) => other !== null),
    };
};
exports.computerShip = computerShip;
/**
 * The rule a computer player's launch is decided by (`lib/computer` `launches`), waiting for another computer player's
 *  launch as `wait` says: `RuleIds.computerLaunch`, the original's, with `'classic'`; civ2-enhanced registers one with
 *  `'other-computers'` under its own id.
 */
const computerLaunchRule = (id, wait, dependencies = {}) => new ComputerLaunch_1.default(id, new Criterion_1.default((spaceship) => {
    var _a;
    return !(0, isHuman_1.default)(spaceship.player(), (_a = dependencies.clientRegistry) !== null && _a !== void 0 ? _a : ClientRegistry_1.instance);
}), new Effect_1.default((spaceship) => (0, computer_1.launches)((0, exports.computerShip)(spaceship, dependencies), wait)));
exports.computerLaunchRule = computerLaunchRule;
/**
 * A computer player's spaceship, for an AI client to read (base-spaceship's `ComputerSpaceshipPart` and
 *  `ComputerLaunch`): the part it adds next, of those available, counting the parts its cities are building as added;
 *  and whether it launches, with the original's wait for another computer's launch, which never waits.
 */
const getRules = (dependencies = {}) => [
    new ComputerSpaceshipPart_1.default(RuleIds_1.default.computerPart, new Criterion_1.default((spaceship) => {
        var _a;
        return !(0, isHuman_1.default)(spaceship.player(), (_a = dependencies.clientRegistry) !== null && _a !== void 0 ? _a : ClientRegistry_1.instance);
    }), new Effect_1.default((spaceship, available, building) => {
        const kind = (0, computer_1.nextPart)((0, exports.computerShip)(spaceship, dependencies, building)), PartType = kind < 0 ? null : parts_1.partTypes[kind];
        return PartType !== null && available.includes(PartType)
            ? PartType
            : null;
    })),
    (0, exports.computerLaunchRule)(RuleIds_1.default.computerLaunch, 'classic', dependencies),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=computer.js.map