"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const Yields_1 = require("../../Yields");
const parts_1 = require("../../data/parts");
const Criterion_1 = require("@civ-clone/core-rule/Criterion");
const Effect_1 = require("@civ-clone/core-rule/Effect");
const Parts_1 = require("../../Parts");
const Yield_1 = require("@civ-clone/core-spaceship/Rules/Yield");
const RuleIds_1 = require("../../RuleIds");
// What a counted part shows: its mass, in the original's units, and a habitation module's 10,000 colonists. The
//  flight and the chance of success are worked out from the parts themselves (`lib/stats`), not from these.
const getRules = () => [
    ...parts_1.parts.map(([PartType, , mass]) => new Yield_1.default(`${RuleIds_1.prefix}:spaceship/yield/mass/${PartType.name}`, new Criterion_1.default((part) => part instanceof PartType), new Effect_1.default((part) => new Yields_1.Mass(mass, part.id())))),
    new Yield_1.default(`${RuleIds_1.prefix}:spaceship/yield/population`, new Criterion_1.default((part) => part instanceof Parts_1.Habitation), new Effect_1.default((part) => new Yields_1.Population(10000, part.id()))),
];
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=yield.js.map