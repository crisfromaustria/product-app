export * from './healthSimulation.service';
import { HealthSimulationService } from './healthSimulation.service';
export * from './healthSimulation.serviceInterface';
export * from './products.service';
import { ProductsService } from './products.service';
export * from './products.serviceInterface';
export const APIS = [HealthSimulationService, ProductsService];
