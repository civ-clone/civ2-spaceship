"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const PlayerRegistry_1 = require("@civ-clone/core-player/PlayerRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const newSpaceship_1 = require("../../lib/newSpaceship");
const ApolloProgram_1 = require("@civ-clone/base-wonder-apolloprogram/ApolloProgram");
const BulidingComplete_1 = require("@civ-clone/core-city-build/Rules/BulidingComplete");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Part_1 = require("@civ-clone/core-spaceship/Part");
const ship_1 = require("../../lib/ship");
const RuleIds_1 = require("../../RuleIds");
const shipsForNewcomers_1 = require("@civ-clone/base-spaceship/lib/shipsForNewcomers");
const getRules = (dependencies = {}) => {
    const { playerRegistry = PlayerRegistry_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance, } = dependencies;
    return [
        // The Apollo Program lets everyone build parts: here parts go into a ship, so every player gets one, each on a
        //  layout of its own. The original keeps no ship apart from the parts built.
        new BulidingComplete_1.default(`${RuleIds_1.prefix}:city/building-complete/apollo-program`, new Criterion_1.default((cityBuild, built) => built instanceof ApolloProgram_1.default), new Effect_1.default(() => (0, shipsForNewcomers_1.default)(playerRegistry, spaceshipRegistry, (player) => (0, newSpaceship_1.newSpaceship)(player, dependencies)))),
        // A part goes onto its player's ship, while it hasn't launched (`spaceship_add_part`, which does nothing once
        //  it has).
        new BulidingComplete_1.default(`${RuleIds_1.prefix}:city/building-complete/part`, new Criterion_1.default((cityBuild, built) => built instanceof Part_1.default), new Effect_1.default((cityBuild, built) => {
            const part = built;
            // In flight or landed: the part is left behind, and no second ship is made for it.
            if ((0, ship_1.hasLaunched)(part.city().player(), spaceshipRegistry)) {
                return;
            }
            const spaceship = (0, newSpaceship_1.shipFor)(part.city().player(), dependencies);
            spaceship.add(part);
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=building-complete.js.map