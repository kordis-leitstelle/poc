import {ApolloServer, AuthenticationError} from "apollo-server-fastify";
import {ApolloGateway, RemoteGraphQLDataSource} from "@apollo/gateway";
import  {FastifyInstance, FastifyRequest} from 'fastify'
import {
    ApolloServerPluginCacheControl,
    ApolloServerPluginDrainHttpServer,
    ApolloServerPluginLandingPageDisabled
} from "apollo-server-core";
import {AuthHandler} from "./auth/auth-handler";
import {GraphQLSchema} from "graphql";

export class GraphqlGateway {
    private apolloGateway: ApolloGateway;
    private apolloServer: ApolloServer;

    constructor(private readonly authHandler: AuthHandler,
                private readonly fastify: FastifyInstance) {
    }

    public createWithList(serviceList: { name: string, url: string }[]): void {
        this.createApolloGateway({serviceList})
    }

    public createWithStudio(): void {
        if (!process.env.APOLLO_KEY) {
            throw new Error("No apollo key provided in environment")
        }

        this.createApolloGateway({})
    }

    public async start(): Promise<void> {
        await this.apolloServer.start();

        this.fastify.register(this.apolloServer.createHandler());
    }

    public async listen(port: number): Promise<string> {
        return this.fastify.listen(port);
    }

    public getSchema(): GraphQLSchema|undefined {
        return this.apolloGateway?.schema;
    }

    private fastifyAppClosePlugin() {
        const server = this.fastify;

        return {
            async serverWillStart() {
                return {
                    async drainServer() {
                        await server.close();
                    },
                };
            },
        };
    }

    private createApolloGateway(config: any): void {
        this.apolloGateway = new ApolloGateway({
            ...config,
            buildService({ url }) {
                return new RemoteGraphQLDataSource({
                    url,
                    willSendRequest({ request, context }) {
                        const {serializedAuthContext} = context as {serializedAuthContext: string};
                        request.http!.headers.set("krd-user", serializedAuthContext);
                    }
                });
            },
        });


        this.apolloServer = new ApolloServer({
            gateway: this.apolloGateway,
            context: ({request}) => this.authContextHandler(request),
            plugins: [
                this.fastifyAppClosePlugin(),
                ApolloServerPluginDrainHttpServer({httpServer: this.fastify.server}),
                ApolloServerPluginCacheControl({ defaultMaxAge: 5 }),
                ApolloServerPluginLandingPageDisabled()
            ],
        });
    }

    private authContextHandler(req: FastifyRequest): { serializedAuthContext: string|null } {
        if (!req) {
            // internal request
            return {serializedAuthContext: null}
        }

        const token = req?.headers?.authorization;
        if (!token) {
            throw new AuthenticationError("No token provided.")
        }
        const user = this.authHandler.decode(token)

        if (!user) {
            throw new AuthenticationError("Invalid token.")
        }

        // set context as serialized object for performance
        return {serializedAuthContext: JSON.stringify(user)}
    }
}
