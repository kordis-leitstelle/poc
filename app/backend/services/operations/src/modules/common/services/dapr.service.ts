import {Injectable} from "@nestjs/common";
import {DaprClient} from "dapr-client";
import {ConfigService} from "@nestjs/config";

@Injectable()
export class DaprService {
    private readonly daprClient: DaprClient;
    private readonly pubSubComponentName: string;
    constructor(readonly configService: ConfigService) {
        this.pubSubComponentName = this.configService.get<string>("DAPR_PUBSUB_COMPONENT")
        const daprHost = "localhost";
        const daprPort = this.configService.get<string>("DAPR_HTTP_PORT");
        this.daprClient = new DaprClient(daprHost, daprPort)
    }

    publish(topic: string, payload: any): Promise<void> {
        return this.daprClient.pubsub.publish(this.pubSubComponentName, topic, payload);
    }
}
