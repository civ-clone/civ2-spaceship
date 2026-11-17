import { Game, defaultGame } from '@civ-clone/core-game';
import {
  deriveBuildRules,
  notLaunchedRule,
  partsLeftRule,
} from './Rules/City/build';
import {
  describedRequirements,
  requiresAdvance,
  requiresApollo,
} from './Requirements';
import CapitalsLost from './lib/capitalLost';
import cityBuildCost from './Rules/City/build-cost';
import cityBuildingComplete from './Rules/City/building-complete';
import cityCaptured from './Rules/City/captured';
import playerAction from './Rules/Player/action';
import playerDefeated from './Rules/Player/defeated';
import spaceshipActive from './Rules/Spaceship/active';
import spaceshipChooseSlot from './Rules/Spaceship/choose-slot';
import spaceshipEvents from './Rules/Spaceship/events';
import spaceshipStats from './Rules/Spaceship/stats';
import spaceshipYield from './Rules/Spaceship/yield';
import turnStart from './Rules/Turn/start';

export const register = (game: Game): void => {
  const capitalsLost = new CapitalsLost(),
    shipDependencies = {
      clientRegistry: game.clients,
      pendingEffectRegistry: game.pendingEffects,
      playerResearchRegistry: game.playerResearch,
      ruleRegistry: game.rules,
      spaceshipRegistry: game.spaceships,
      turn: game.turn,
      year: game.year,
    },
    deriveBuildRule = deriveBuildRules(
      game.wonders,
      game.playerResearch,
      game.cityImprovements
    );

  // Which parts a city may build: the Apollo Program, the hand-written rules for an unlaunched ship and the parts left,
  //  then each kind's advance.
  game.requirements.add(deriveBuildRule, ...requiresApollo);
  game.rules.register(
    notLaunchedRule(game.spaceships, game.year),
    partsLeftRule(game.spaceships)
  );
  game.requirements.add(deriveBuildRule, ...requiresAdvance);
  game.requirements.add(null, ...describedRequirements);

  game.rules.register(
    ...cityBuildCost(),
    ...cityBuildingComplete({
      ...shipDependencies,
      playerRegistry: game.players,
    }),
    ...cityCaptured(capitalsLost, {
      cityImprovementRegistry: game.cityImprovements,
      clientRegistry: game.clients,
      spaceshipRegistry: game.spaceships,
    }),
    ...playerAction(game.spaceships),
    ...playerDefeated(game.spaceships),
    ...spaceshipActive(game.spaceships, game.clients),
    ...spaceshipChooseSlot(),
    ...spaceshipEvents({ ...shipDependencies, engine: game.engine }),
    ...spaceshipStats({ ...shipDependencies, engine: game.engine }),
    ...spaceshipYield(),
    ...turnStart(capitalsLost, {
      ...shipDependencies,
      cityBuildRegistry: game.cityBuilds,
      cityImprovementRegistry: game.cityImprovements,
      cityRegistry: game.cities,
      playerRegistry: game.players,
      wonderRegistry: game.wonders,
    })
  );
};

// The plugin loader imports each package for this side effect.
register(defaultGame);

export default register;
