import {Parent, ResolveField, Resolver} from "@nestjs/graphql";
import {RadioCallsService} from "../../radio-calls/services/radio-calls/radio-calls.service";
import {RadioCall} from "../../radio-calls/models/radio-call.model";

@Resolver('Operation')
export class OperationsResolver {
    constructor(private readonly radioCallsService: RadioCallsService) {
    }

    @ResolveField()
    async radioCalls(@Parent() {begin, end}): Promise<RadioCall[]> {
        // todo: parent seems to be "native" parent and does not run through custom scalars
        return this.radioCallsService.findInTimeRange(new Date(begin), new Date(end))
    }
}
