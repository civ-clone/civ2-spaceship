"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const Action_1 = require("@civ-clone/core-player/Rules/Action");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const LaunchSpaceship_1 = require("@civ-clone/base-player-action-launch-spaceship/LaunchSpaceship");
const RuleIds_1 = require("../../RuleIds");
const getRules = (spaceshipRegistry = SpaceshipRegistry_1.instance) => [
    // A person may launch a ship that hasn't launched once it may (`Rules/Spaceship/launchable`): `launch()` does nothing
    //  while it may not, so the action is offered only then (`spaceship_status_dialog`'s launch button).
    new Action_1.default(`${RuleIds_1.prefix}:player/action/launch`, new Criterion_1.default((player) => {
        const spaceship = spaceshipRegistry.getActiveByPlayer(player);
        return (spaceship !== null &&
            spaceship.launched() === false &&
            spaceship.launchable());
    }), new Effect_1.default((player) => [
        new LaunchSpaceship_1.default(player, spaceshipRegistry.getActiveByPlayer(player)),
    ])),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=action.js.map