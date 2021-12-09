export abstract class MissingFieldResolverStrategy<ContextType = undefined> {
    // todo: set type for info
    abstract resolveMissingFields(payload: Record<string, any>,
                                  info: any,
                                  eventDetails: {queryHead: string, subscriptionName: string},
                                  context?: ContextType): Promise<any>;

    // todo: this is only working for non-nested operations, nested selections will be omitted
    protected buildNonPayloadSelections(subscriptionName: string, payload: any, info: any): string {
        const payloadFields = Object.keys(payload)
        const requestedFields = info.operation.selectionSet.selections
            .find((field: any) => field.name.value === subscriptionName)
            .selectionSet.selections
            .map((field: any) => field.name.value)
            .filter((fieldName: string) => !payloadFields.includes(fieldName));

        return requestedFields.join('\n')
    }
}
