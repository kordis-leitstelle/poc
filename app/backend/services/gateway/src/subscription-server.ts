import {AuthHandler} from "./auth/auth-handler";
import {
    GraphQLSchema,

} from "graphql";

import {FastifyInstance} from "fastify";
import {WebSocketServer} from 'ws';
import {useServer} from "graphql-ws/lib/use/ws";


export class SubscriptionServer {
    constructor(private readonly port: number,
                private readonly fastify: FastifyInstance,
                private readonly subscriptionSchema: GraphQLSchema,
                private readonly authHandler: AuthHandler) {
    }

    start(): void {
        const server = new WebSocketServer({
            port: this.port,
            path: '/graphql'
        });
        useServer({
            schema: this.subscriptionSchema,
            context: (req) => {
                const authToken = req.connectionParams?.authToken;

                if (!authToken) {
                    throw new Error("No authentication token provided.");
                }

                const authContext = this.authHandler.decode(authToken as string)

                if (!authContext) {
                    throw new Error("Invalid authentication token provided.");
                }

                return {
                    authToken,
                    authContext
                }
            }
        }, server);
    }
}
