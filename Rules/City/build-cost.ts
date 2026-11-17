import {
  BuildCost,
  buildCost,
} from '@civ-clone/core-city-build/Rules/BuildCost';
import Buildable from '@civ-clone/core-city-build/Buildable';
import { PartRow } from '../../data/parts';
import RuleIds from '../../RuleIds';
import cosmic from '@civ-clone/civ2-rules/data/cosmic';
import parts from '../../data/parts';

/** Each kind's cost in shields: its group's @IMPROVE rows (8, 16 or 32), times @COSMIC's shield box rows (10). */
export const getRules = (): BuildCost[] =>
  parts.flatMap(([PartType, , , costRows]: PartRow) =>
    buildCost(
      PartType as unknown as typeof Buildable,
      costRows * cosmic.shieldBoxRows,
      RuleIds.buildCost
    )
  );

export default getRules;
