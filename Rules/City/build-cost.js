"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = void 0;
const BuildCost_1 = require("@civ-clone/core-city-build/Rules/BuildCost");
const RuleIds_1 = require("../../RuleIds");
const cosmic_1 = require("@civ-clone/civ2-rules/data/cosmic");
const parts_1 = require("../../data/parts");
/** Each kind's cost in shields: its group's @IMPROVE rows (8, 16 or 32), times @COSMIC's shield box rows (10). */
const getRules = () => parts_1.default.flatMap(([PartType, , , costRows]) => (0, BuildCost_1.buildCost)(PartType, costRows * cosmic_1.default.shieldBoxRows, RuleIds_1.default.buildCost));
exports.getRules = getRules;
exports.default = exports.getRules;
//# sourceMappingURL=build-cost.js.map