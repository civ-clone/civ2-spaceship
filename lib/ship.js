"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrivalYear = exports.statsOf = exports.hasFusion = exports.recordLaunch = exports.launchRecord = exports.LAUNCH_RECORD = exports.hasSpaceship = exports.shipOfLayout = exports.built = exports.builtIn = void 0;
const ClientRegistry_1 = require("@civ-clone/core-client/ClientRegistry");
const PendingEffectRegistry_1 = require("@civ-clone/core-pending-effect/PendingEffectRegistry");
const PlayerResearchRegistry_1 = require("@civ-clone/core-science/PlayerResearchRegistry");
const SpaceshipRegistry_1 = require("@civ-clone/core-spaceship/SpaceshipRegistry");
const stats_1 = require("./stats");
const parts_1 = require("../data/parts");
const FusionPower_1 = require("@civ-clone/base-science-advance-fusionpower/FusionPower");
const PendingEffect_1 = require("@civ-clone/core-pending-effect/PendingEffect");
const isHuman_1 = require("@civ-clone/base-difficulty/lib/isHuman");
/** How many of each kind are in `layout`'s slots, counted or not, in the original's order (`data/parts`). */
const builtIn = (layout) => layout.slots().reduce((built, slot) => {
    const part = slot.part();
    if (part !== null) {
        const kind = (0, parts_1.kindOf)(part);
        if (kind >= 0) {
            built[kind]++;
        }
    }
    return built;
}, parts_1.parts.map(() => 0));
exports.builtIn = builtIn;
/** How many of each kind `spaceship` has, counted or not. */
const built = (spaceship) => (0, exports.builtIn)(spaceship.layout());
exports.built = built;
/** The ship whose layout `layout` is, or `null`. */
const shipOfLayout = (layout, spaceshipRegistry = SpaceshipRegistry_1.instance) => {
    var _a;
    return (_a = spaceshipRegistry
        .entries()
        .find((spaceship) => spaceship.layout() === layout)) !== null && _a !== void 0 ? _a : null;
};
exports.shipOfLayout = shipOfLayout;
/**
 * Whether `player` has a ship the original would say exists (`civ_spaceship_exists`, `SHIP_EXISTS`): one in flight, or
 *  one with a part built.
 */
const hasSpaceship = (player, spaceshipRegistry = SpaceshipRegistry_1.instance) => {
    const spaceship = spaceshipRegistry.getActiveByPlayer(player);
    return (spaceship !== null &&
        (spaceship.launched() !== false ||
            spaceship
                .layout()
                .slots()
                .some((slot) => !slot.empty())));
};
exports.hasSpaceship = hasSpaceship;
/**
 * The record of a launch, kept in the game's pending effects so it's saved: nothing discharges it. It holds whether the
 *  ship had fusion (`SHIP_FUSION` is set only before the launch), the launch year and the arrival year.
 */
exports.LAUNCH_RECORD = 'civ2-spaceship:launch';
const recordOf = (spaceship, pendingEffectRegistry) => {
    var _a;
    return (_a = pendingEffectRegistry
        .getByHandler(exports.LAUNCH_RECORD)
        .find((record) => record.target() === spaceship)) !== null && _a !== void 0 ? _a : null;
};
/** `spaceship`'s launch, or `null` before it launches. */
const launchRecord = (spaceship, pendingEffectRegistry = PendingEffectRegistry_1.instance) => {
    const record = recordOf(spaceship, pendingEffectRegistry);
    if (record === null) {
        return null;
    }
    const data = record.data();
    return {
        fusion: data.fusion === '1',
        launchYear: Number(data.launchYear),
        arrivalYear: Number(data.arrivalYear),
    };
};
exports.launchRecord = launchRecord;
/** Records `spaceship`'s launch (`Rules/Spaceship/launch`). */
const recordLaunch = (spaceship, { fusion, launchYear, arrivalYear }, pendingEffectRegistry = PendingEffectRegistry_1.instance) => {
    const data = {
        fusion: fusion ? '1' : '0',
        launchYear: String(launchYear),
        arrivalYear: String(arrivalYear),
    }, record = recordOf(spaceship, pendingEffectRegistry);
    if (record !== null) {
        record.setData(data);
        return;
    }
    pendingEffectRegistry.register(new PendingEffect_1.default(exports.LAUNCH_RECORD, spaceship, data));
};
exports.recordLaunch = recordLaunch;
/** Whether `spaceship` has fusion: as recorded at its launch, or else whether its player knows Fusion Power now. */
const hasFusion = (spaceship, { pendingEffectRegistry = PendingEffectRegistry_1.instance, playerResearchRegistry = PlayerResearchRegistry_1.instance, } = {}) => {
    const record = (0, exports.launchRecord)(spaceship, pendingEffectRegistry);
    if (record !== null) {
        return record.fusion;
    }
    try {
        return playerResearchRegistry
            .getByPlayer(spaceship.player())
            .completed(FusionPower_1.default);
    }
    catch (e) {
        return false;
    }
};
exports.hasFusion = hasFusion;
/** `spaceship`'s numbers (`lib/stats`), with life support applied, for its player as they are now. */
const statsOf = (spaceship, dependencies = {}) => {
    var _a;
    return (0, stats_1.shipStats)((0, exports.built)(spaceship), {
        human: (0, isHuman_1.default)(spaceship.player(), (_a = dependencies.clientRegistry) !== null && _a !== void 0 ? _a : ClientRegistry_1.instance),
        fusion: (0, exports.hasFusion)(spaceship, dependencies),
    });
};
exports.statsOf = statsOf;
/** The year `spaceship` arrives: as recorded at its launch, or as it would if it launched now from `year`. */
const arrivalYear = (spaceship, year, dependencies = {}) => {
    var _a;
    const record = (0, exports.launchRecord)(spaceship, (_a = dependencies.pendingEffectRegistry) !== null && _a !== void 0 ? _a : PendingEffectRegistry_1.instance);
    if (record !== null) {
        return record.arrivalYear;
    }
    return year + Math.trunc((0, exports.statsOf)(spaceship, dependencies).arrivalFlight / 10);
};
exports.arrivalYear = arrivalYear;
//# sourceMappingURL=ship.js.map