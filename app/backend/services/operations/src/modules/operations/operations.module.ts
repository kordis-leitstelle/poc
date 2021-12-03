import { Module } from '@nestjs/common';
import { OperationsResolver } from './resolvers/operations.resolver';
import {OperationsService} from "./services/operations.service";

@Module({
    providers: [
        OperationsService,
        OperationsResolver,
    ]
})
export class OperationsModule {

}
