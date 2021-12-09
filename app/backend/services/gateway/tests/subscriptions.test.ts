import {SubscriptionServer} from "../src/subscription-server";
import Fastify from "fastify";
import {buildSchema, GraphQLObjectType, GraphQLSchema, GraphQLString} from "graphql";
import {AuthMock} from "../src/auth/auth-mock";
import {gql} from "apollo-server-core";
import {DaprOptions} from "../src/subscription-pub-sub/dapr-pub-sub";

// todo: move subscription schema generation into a strategy for easier testing
describe("Subscription gateway",() => {
    const daprOptions: DaprOptions = {
        daprHost: "",
        serverHost: "",
        daprPort:"",
        serverPort: "",
        pubSubComponentName: ""
    }

    // integration of subscription
    test('should trigger subscription', () => {
        const mockSchema = buildSchema(`
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
            type Mutation {
                createSomething(): Something
            }
        `)


        const server = new SubscriptionServer(4000, Fastify(), mockSchema, new AuthMock(), daprOptions)

        const schemaCreationSpy = jest.spyOn(SubscriptionServer.prototype as any, "createSubscriptionSchema");
        expect(schemaCreationSpy).lastReturnedWith("")
        server.start();
    });

    // todo: test field resolver
})

