"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const Defeated_1 = require("@civ-clone/core-player/Rules/Defeated");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const cancelSpaceship_1 = require("@civ-clone/base-spaceship/lib/cancelSpaceship");
const RuleIds_1 = require("../../RuleIds");
const getRules = (spaceshipRegistry = SpaceshipRegistry_1.instance) => [
    // A civilization destroyed loses its ship (OpenCiv2 `src/auto/civ.cpp` `civ_check_destroyed` ~4856).
    new Defeated_1.default(`${RuleIds_1.prefix}:player/defeated/ship-lost`, new Effect_1.default((player) => (0, cancelSpaceship_1.default)(player, spaceshipRegistry))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=defeated.js.map