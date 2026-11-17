"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const ChooseSlot_1 = require("@civ-clone/core-spaceship/Rules/ChooseSlot");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const RuleIds_1 = require("../../RuleIds");
const firstFree = (part, layout) => layout.slots().find((slot) => slot.empty() && slot.accepts(part));
const getRules = () => [
    // Each part goes into the first empty slot of its kind (`SpaceshipLayout`).
    new ChooseSlot_1.default(`${RuleIds_1.prefix}:spaceship/choose-slot/first-free`, new Criterion_1.default((part, layout) => firstFree(part, layout) !== undefined), new Effect_1.default((part, layout) => firstFree(part, layout))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=choose-slot.js.map