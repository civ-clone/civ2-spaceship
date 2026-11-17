import { instance as availableCityBuildItemsRegistryInstance } from '@civ-clone/core-city-build/AvailableCityBuildItemsRegistry';
import { partTypes } from './data/parts';

availableCityBuildItemsRegistryInstance.register(...partTypes);
