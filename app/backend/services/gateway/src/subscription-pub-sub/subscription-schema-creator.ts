import {GraphQLSchema} from "graphql";

export interface SubscriptionSchemaCreator {
    createSchema(): Promise<GraphQLSchema>
}
