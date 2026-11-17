// The ids of civ2-spaceship's rules that other packages (civ2-enhanced, a renderer) may need to find.
export const prefix = 'civ2-spaceship';

export const RuleIds = {
  requiresApollo: `${prefix}:city/build/requires-apollo`,
  requiresAdvance: `${prefix}:city/build/requires-advance`,
  notLaunched: `${prefix}:city/build/not-launched`,
  partsLeft: `${prefix}:city/build/parts-left`,
  buildCost: `${prefix}:city/build-cost`,
  arrival: `${prefix}:turn/start/arrival`,
  launchable: `${prefix}:spaceship/launchable`,
};

export default RuleIds;
