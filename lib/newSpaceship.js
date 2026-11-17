"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shipPlayers = exports.shipFor = exports.newSpaceship = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const Turn_1 = require("@civ-clone/core-turn-based-game/Turn");
const Year_1 = require("@civ-clone/core-game-year/Year");
const isBarbarian_1 = require("@civ-clone/base-civilization-barbarian/isBarbarian");
const Spaceship_1 = require("@civ-clone/core-spaceship/Spaceship");
const SpaceshipLayout_1 = require("../SpaceshipLayout");
/** A new, empty ship for `player`, on a layout of its own. Not registered. */
const newSpaceship = (player, { ruleRegistry = RuleRegistry_1.instance, turn = Turn_1.instance, year = Year_1.instance, } = {}) => new Spaceship_1.default(player, new SpaceshipLayout_1.default(ruleRegistry), ruleRegistry, turn, year);
exports.newSpaceship = newSpaceship;
/** `player`'s ship being built or in flight, registering a new one if it has none. */
const shipFor = (player, dependencies = {}) => {
    const { spaceshipRegistry = SpaceshipRegistry_1.instance } = dependencies, spaceship = spaceshipRegistry.getActiveByPlayer(player);
    if (spaceship !== null) {
        return spaceship;
    }
    const created = (0, exports.newSpaceship)(player, dependencies);
    spaceshipRegistry.register(created);
    return created;
};
exports.shipFor = shipFor;
exports.default = exports.newSpaceship;
/**
 * The players who may have a ship: everyone but the barbarians, who never build parts (Civ2 keeps no ship for them).
 *  For `base-spaceship`'s `shipsForNewcomers`, which asks a player registry.
 */
const shipPlayers = (playerRegistry) => ({
    entries: () => playerRegistry
        .entries()
        .filter((player) => !(0, isBarbarian_1.default)(player)),
});
exports.shipPlayers = shipPlayers;
//# sourceMappingURL=newSpaceship.js.map