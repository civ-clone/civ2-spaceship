"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Engine_1 = require("@civ-clone/core-engine/Engine");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const newSpaceship_1 = require("../../lib/newSpaceship");
const Built_1 = require("@civ-clone/core-spaceship/Rules/Built");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Landed_1 = require("@civ-clone/core-spaceship/Rules/Landed");
const Lost_1 = require("@civ-clone/core-spaceship/Rules/Lost");
const RuleIds_1 = require("../../RuleIds");
const getRules = (dependencies = {}) => {
    const { engine = Engine_1.instance, spaceshipRegistry = SpaceshipRegistry_1.instance, } = dependencies;
    return [
        new Built_1.default(`${RuleIds_1.prefix}:spaceship/built/emit`, new Effect_1.default((part, spaceship) => {
            engine.emit('player:spaceship:part-built', spaceship.player());
        })),
        new Landed_1.default(`${RuleIds_1.prefix}:spaceship/landed/emit`, new Effect_1.default((spaceship) => {
            engine.emit('player:spaceship:landed', spaceship.player());
        })),
        // Whether it had launched: one in flight returns, one being built is destroyed (`civ_spaceship_lost_notify`).
        new Lost_1.default(`${RuleIds_1.prefix}:spaceship/lost/emit`, new Effect_1.default((spaceship) => {
            engine.emit('player:spaceship:lost', spaceship.player(), spaceship.launched() !== false);
        })),
        // The original resets the ship, and its player may build another: here a new, empty one.
        new Lost_1.default(`${RuleIds_1.prefix}:spaceship/lost/new-ship`, new Effect_1.default((spaceship) => {
            (0, newSpaceship_1.shipFor)(spaceship.player(), { ...dependencies, spaceshipRegistry });
        })),
    ];
};
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=events.js.map