import {GraphqlGateway} from "./graphql-gateway";
import {AuthMock} from "./auth/auth-mock";
import {DaprPubSub} from "./subscription-pub-sub/dapr-pub-sub";
import {readFileSync} from "fs";
import path from "path";
import Fastify from "fastify";
import helmet from "fastify-helmet";
import {SubscriptionServer} from "./subscription-server";
import {AuthHandler} from "./auth/auth-handler";
import * as dotenv from "dotenv";
import {DaprServer} from "dapr-client";
import {SubscriptionSchemaFromFederation} from "./subscription-pub-sub/subscription-schema-from-federation";
import {QueryResolveStrategy} from "./subscription-pub-sub/field-resolver-strategies/query-resolve-strategy";
import {SubscriptionSchemaCreator} from "./subscription-pub-sub/subscription-schema-creator";

dotenv.config();

async function startGateway() {
    const fastify = Fastify();
    fastify.register(helmet)

    fastify.get("/", async () => {
        return {healthy: true}
    })

    // if production: plug real auth handler here
    const authHandler: AuthHandler = new AuthMock();

    const gqlGateway = new GraphqlGateway(authHandler, fastify);
    const port = Number(process.env.GATEWAY_PORT || 8080);

    if (process.env.NODE_ENV !== "production") {
        const serviceList = JSON.parse(String(readFileSync(path.resolve(__dirname, "../service-list.json"))));
        gqlGateway.createWithList(serviceList);
    } else {
        gqlGateway.createWithStudio();
    }

    await gqlGateway.start();

    const daprServer = new DaprServer("localhost", process.env.DAPR_SERVER_PORT, "localhost", process.env.DAPR_HTTP_PORT);
    const pubSubEngine = new DaprPubSub(daprServer, process.env.DAPR_PUBSUB_COMPONENT!);
    const missingFieldsResolver = new QueryResolveStrategy(fastify)
    const subscriptionSchemaCreator: SubscriptionSchemaCreator = new SubscriptionSchemaFromFederation(pubSubEngine, gqlGateway.getSchema()!, missingFieldsResolver);

    new SubscriptionServer(
        Number(process.env.WS_PORT||8081),
        fastify,
        await subscriptionSchemaCreator.createSchema(),
        authHandler,
    ).start();

    await pubSubEngine.startServer();

    return gqlGateway.listen(port);
}

startGateway().then(url => console.log("Kordis Gateway listening at " + url))
