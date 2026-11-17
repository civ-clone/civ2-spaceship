"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const ship_1 = require("../../lib/ship");
const Active_1 = require("@civ-clone/core-spaceship/Rules/Active");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const isHuman_1 = require("@civ-clone/base-difficulty/lib/isHuman");
const parts_1 = require("../../data/parts");
const stats_1 = require("../../lib/stats");
const RuleIds_1 = require("../../RuleIds");
const getRules = (spaceshipRegistry = SpaceshipRegistry_1.instance, clientRegistry = ClientRegistry_1.instance) => [
    // A part counts while it is within its kind's limit, which the structurals built set (`spaceship_part_limit`): the
    //  first parts of each kind count, any after the limit are built but don't. A computer player's ship counts at most
    //  one of each module. The ship's owner is its player's, whoever built the part.
    new Active_1.default(`${RuleIds_1.prefix}:spaceship/active/part-limit`, new Criterion_1.default((slot) => slot.part() !== null), new Effect_1.default((slot, layout) => {
        const kind = (0, parts_1.kindOf)(slot.part());
        if (kind < 0) {
            return false;
        }
        const index = layout
            .slots()
            .filter((other) => other.part() !== null && (0, parts_1.kindOf)(other.part()) === kind)
            .indexOf(slot), spaceship = (0, ship_1.shipOfLayout)(layout, spaceshipRegistry), human = spaceship === null || (0, isHuman_1.default)(spaceship.player(), clientRegistry);
        return index < (0, stats_1.partLimit)(kind, (0, ship_1.builtIn)(layout)[0], human);
    })),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=active.js.map