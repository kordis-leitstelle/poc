import { Module } from '@nestjs/common';
import {RadioCallsService} from "./services/radio-calls/radio-calls.service";
import {RadioCallResolver} from "./resolvers/radio-calls.resolver";

@Module({
    providers: [
        RadioCallsService,
        RadioCallResolver
    ],
    exports: [RadioCallsService]
})
export class RadioCallsModule {}
