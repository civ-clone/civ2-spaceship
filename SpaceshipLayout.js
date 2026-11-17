"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceshipLayout = exports.slots = exports.HEIGHT = exports.WIDTH = void 0;
const RuleRegistry_1 = require("@civ-clone/core-rule/RuleRegistry");
const Layout_1 = require("@civ-clone/core-spaceship/Layout");
const Slot_1 = require("@civ-clone/core-spaceship/Slot");
const parts_1 = require("./data/parts");
// Our own plain layout for a Civilization II ship (none of the original's art or its 39-square frame): a row of slots
//  for each kind, as many as can be built, the structurals over three rows of 13. A part goes into the first empty slot
//  of its kind (`Rules/Spaceship/choose-slot`) and counts while it is within its kind's limit
//  (`Rules/Spaceship/active`).
exports.WIDTH = 13;
const rowsOf = (max) => Math.ceil(max / exports.WIDTH);
exports.HEIGHT = parts_1.default.reduce((height, [, max]) => height + rowsOf(max), 0);
/** Every slot, kind by kind in the original's order (`data/parts`), each kind's in the order they fill. */
const slots = () => {
    let y = 0;
    return parts_1.default.flatMap(([PartType, max]) => {
        const top = y;
        y += rowsOf(max);
        return new Array(max)
            .fill(null)
            .map((_, index) => new Slot_1.default(index % exports.WIDTH, top + Math.floor(index / exports.WIDTH), 1, 1, [
            PartType,
        ]));
    });
};
exports.slots = slots;
class SpaceshipLayout extends Layout_1.default {
    constructor(ruleRegistry = RuleRegistry_1.instance) {
        super(exports.HEIGHT, exports.WIDTH, (0, exports.slots)(), ruleRegistry);
    }
}
exports.SpaceshipLayout = SpaceshipLayout;
exports.default = SpaceshipLayout;
//# sourceMappingURL=SpaceshipLayout.js.map