import {Resolver, Mutation, Args, Query, ResolveReference} from '@nestjs/graphql'
import {CreateRadioCallInput} from "../models/create-radio-call.input";
import {RadioCall} from "../models/radio-call.model";
import {RadioCallsService} from "../services/radio-calls/radio-calls.service";

@Resolver('RadioCall')
export class RadioCallResolver {
    constructor(private readonly radioCallsService: RadioCallsService) {
    }

    @ResolveReference()
    resolveReference(reference: { __typename: string; id: string }) {
        return this.radioCallsService.findById(reference.id);
    }

    @Query()
    async activeRadioCalls(): Promise<RadioCall[]> {
        return this.radioCallsService.findActive()
    }

    @Query()
    async archivedRadioCalls(): Promise<RadioCall[]> {
        return this.radioCallsService.findArchived()
    }

    @Mutation()
    async createRadioCall(@Args('input') input: CreateRadioCallInput): Promise<RadioCall> {
        return this.radioCallsService.create(input.sendingUnit, input.receivingUnit, input.message)
    }
}
