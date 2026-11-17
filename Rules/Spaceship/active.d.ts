import { ClientRegistry } from '@civ-clone/core-client/ClientRegistry';
import { SpaceshipRegistry } from '@civ-clone/core-spaceship/SpaceshipRegistry';
import Active from '@civ-clone/core-spaceship/Rules/Active';
export declare const getRules: (
  spaceshipRegistry?: SpaceshipRegistry,
  clientRegistry?: ClientRegistry
) => Active[];
export default getRules;
