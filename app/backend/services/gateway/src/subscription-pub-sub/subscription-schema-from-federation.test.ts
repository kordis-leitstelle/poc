import {SubscriptionSchemaFromFederation} from "./subscription-schema-from-federation";
import {DaprServer} from "dapr-client";
import {DaprPubSub} from "./dapr-pub-sub";
import {MissingFieldResolverStrategy} from "./field-resolver-strategies/field-resolver-strategy";
import {buildSchema, printSchema,} from "graphql";


describe("Subscription creation from schema", () => {
    // todo: test resolvers
    // todo: test valid event creation from descriptions

    test("should create subscription schema", async () => {
        const pubSubEngine = new DaprPubSub(new DaprServer(), "")
        const pubSubSpy = jest.spyOn(pubSubEngine, "subscribeTopics")
        pubSubSpy.mockImplementationOnce(() => Promise.resolve())

        const mockFieldResolver = new class MockFieldResolver extends MissingFieldResolverStrategy {
            resolveMissingFields(payload: Record<string, any>, info: any, eventDetails: { queryHead: string; subscriptionName: string }, context: undefined): Promise<any> {
                return Promise.resolve();
            }
        }

        const mockSchemaSchema = buildSchema(`
            type Something {
                foo: String 
            }
            type _Events {
                """{"trigger":"SOME_EVENT","query":"getSomething"}"""
                somethingCreated: Something
            } 
            type Query {
                getSomething: Something
            }
        `);

        const creator = new SubscriptionSchemaFromFederation(pubSubEngine, mockSchemaSchema, mockFieldResolver)

        const expectedSchema = buildSchema(`
            type Something {
              foo: String
            }
            
            type _Events {
              """{"trigger":"SOME_EVENT","query":"getSomething"}"""
              somethingCreated: Something
            }
            
            type Query {
              getSomething: Something
            }
            
            type Subscription {
              somethingCreated: Something
            }
        `);

        const createdSchema = await creator.createSchema()

        expect(printSchema(createdSchema)).toBe(printSchema(expectedSchema))
    });
})
