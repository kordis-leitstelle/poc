import {Resolver, Mutation, Args, Query, ResolveReference} from '@nestjs/graphql'
import {Operation} from "../models/operation.model";
import {OperationsService} from "../services/operations.service";

@Resolver('Operation')
export class OperationsResolver {
    constructor(private readonly operationService: OperationsService) {
    }

    @ResolveReference()
    resolveReference(reference: { __typename: string; sign: string }) {
        return this.operationService.findBySign(reference.sign);
    }

    @Query()
    async operation(@Args('sign') id: string): Promise<Operation> {
        return this.operationService.findBySign(id);
    }

    @Query()
    async activeOperations(): Promise<Operation[]> {
        return this.operationService.findActive();
    }

    @Query()
    async archivedOperations(): Promise<Operation[]> {
        return this.operationService.findArchived();
    }

    @Mutation()
    async createOngoingOperation(@Args('location') location: string): Promise<Operation> {
        return this.operationService.createOngoing(location)
    }
}
