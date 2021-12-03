import { Module } from '@nestjs/common';
import {RadioCallsModule} from "../radio-calls/radio-calls.module";
import {OperationsResolver} from "./resolvers/operations.resolver";

@Module({
    imports: [RadioCallsModule],
    providers: [OperationsResolver]
})
export class OperationsModule {}
