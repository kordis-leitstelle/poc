import {SubscriptionSchemaCreator} from "./subscription-schema-creator";
import {
    DocumentNode,
    GraphQLField,
    GraphQLInputObjectType,
    GraphQLOutputType,
    GraphQLResolveInfo,
    GraphQLSchema,
    parse, printSchema
} from "graphql";
import {makeExecutableSchema} from "@graphql-tools/schema";
import {MissingFieldResolverStrategy} from "./field-resolver-strategies/field-resolver-strategy";
import {DaprPubSub} from "./dapr-pub-sub";

interface Event {
    subscriptionName: string;
    trigger: string;
    type: GraphQLOutputType;
    query: string;
}

// todo: Created schema should only return object types and subscriptions!!!!

export class SubscriptionSchemaFromFederation implements SubscriptionSchemaCreator {
    constructor(private readonly pubSubEngine: DaprPubSub,
                private readonly federatedSchema: GraphQLSchema,
                private readonly missingFieldResolver: MissingFieldResolverStrategy) {
    }

    async createSchema(): Promise<GraphQLSchema> {
        const events = this.getEventsFromSchema();
        await this.pubSubEngine.subscribeTopics(events.map(event => event.trigger))

        return this.createSubscriptionSchema(events);
    }

    private getEventsFromSchema(): Event[] {
        if (!this.federatedSchema) {
            throw new Error("Gateway schema undefined")
        }

        const events: Event[] = []

        const eventType = this.federatedSchema.getType("_Events");
        // todo: handle wrong object types here
        const eventFields = (eventType as GraphQLInputObjectType).getFields();
        for (const field in eventFields) {
            const eventField = eventFields[field];
            const event: Partial<Event> = JSON.parse(eventField.description!)

            event.subscriptionName = field;
            event.type = eventField.type as GraphQLOutputType

            events.push(event as Event)
        }

        return events
    }


    private createSubscriptionSchema(events: Event[]): GraphQLSchema {
        const queryFields = this.federatedSchema.getQueryType()!.getFields()

        const resolvers: {
            Subscription: {
                [subscriptionName: string]: any
            }
        } = {
            Subscription: {}
        };

        let typeDefBuffer = "type Subscription {\n";
        for (const event of events) {
            typeDefBuffer += `${event.subscriptionName}: ${event.type}\n`

            const queryHead = this.createQueryHeadFromField(queryFields[event.query], event.query)

            resolvers.Subscription[event.subscriptionName] = this.createSubscriptionFromEvent({
                ...event,
                queryHead
            })
        }

        typeDefBuffer += "}"
        const typeDefs = parse(typeDefBuffer);

        return this.makeSubscriptionSchema(this.federatedSchema, typeDefs, resolvers);
    }

    private createQueryHeadFromField(gqlField: GraphQLField<any, any>, operationName: string): string {
        let queryHeadBuffer = `query Subscription_Get${gqlField.type}(`
        let queryArgsBuffer = "";

        for (const [i, arg] of gqlField.args.entries()) {
            queryHeadBuffer += `$${arg.name}: ${arg.type}`
            queryArgsBuffer += `${arg.name}: $${arg.name}`

            if (i < gqlField.args.length - 1) {
                queryHeadBuffer += ", ";
                queryArgsBuffer += ", ";
            }
        }

        return`${queryHeadBuffer}) ${operationName}(${queryArgsBuffer})`;
    }

    private createSubscriptionFromEvent(event: {subscriptionName: string, trigger: string, queryHead: string }) {
        return {
            // The client may request fields that are not resolvable by the event payload
            // => call reference and merge results
            resolve: async (payload: any, args: any, context: any, info: GraphQLResolveInfo) =>
                this.missingFieldResolver.resolveMissingFields(payload, info, event, context),
            // todo: add withFilter to protect org auth contexts
            subscribe: () => this.pubSubEngine.asyncIterator(event.trigger),
        }
    }



    // todo: find type for resolver
    private makeSubscriptionSchema(gatewaySchema: GraphQLSchema, typeDefs: DocumentNode, resolvers: any): GraphQLSchema {
        const gatewayTypeDefs = gatewaySchema
            ? parse(printSchema(gatewaySchema))
            : undefined;

        if (!gatewayTypeDefs) {
            throw new Error("Could not create type defs from schema.")
        }

        return makeExecutableSchema({
            typeDefs: [...(gatewayTypeDefs && [gatewayTypeDefs]), typeDefs],
            resolvers
        });
    }
}
