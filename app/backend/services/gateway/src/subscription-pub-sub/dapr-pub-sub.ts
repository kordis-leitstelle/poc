import {PubSubEngine} from "graphql-subscriptions";
import {DaprServer} from "dapr-client";

export interface DaprOptions {
    daprHost: string,
    daprPort: string,
    serverHost: string,
    serverPort: string,
    pubSubComponentName: string,
}

type CallBackFn<T=any> = (data: T) => void;

export class DaprPubSub extends PubSubEngine {
    private readonly subscriptions: {
        [triggerName: string]: {
            callback: CallBackFn,
            id: number
        }[]
    } = {};
    private idCounter = 0;

    constructor(private readonly daprServer: DaprServer, private readonly pubSubComponentName: string) {
        super();
    }

    /*
        Dapr does not let you subscribe to more topics after sidecar started the server,
        therefor we have to subscribe to all topics first,
        when new topics are published in schemas we have to roll out the sidecar instance completely to register the topics.
        The issue is on Daprs Backlog: https://github.com/dapr/dapr/issues/814
    */
    async subscribeTopics(topicNames: string[]) {
        for (const topicName of topicNames) {
            this.subscriptions[topicName] = []
            await this.daprServer.pubsub
                .subscribe(
                    this.pubSubComponentName,
                    topicName,
                    async (data) => this.onEvent(topicName, data)
                )
        }
    }

    async startServer(): Promise<void> {
        return this.daprServer.startServer()
    }

    async subscribe(triggerName: string, onMessage: CallBackFn, options: Object): Promise<number> {
        const id = this.idCounter++;

        if (!this.subscriptions[triggerName]) {
            throw new Error('This topic is not registered yet.')
        }

        this.subscriptions[triggerName].push({
            id,
            callback: onMessage
        })

        return id
    }

    unsubscribe(subId: number): void {
        for (const triggerName in this.subscriptions) {
            const subscription = this.subscriptions[triggerName].find(subscriber => subscriber.id == subId)

            if (subscription) {
                this.subscriptions[triggerName].splice(subId, 1)
                return
            }
        }

        throw new Error("Subscriber ID was not found")
    }

  async publish(triggerName: string, payload: any): Promise<void> {
       return this.onEvent(triggerName, payload)
    }

    private onEvent(triggerName: string, data: any): void {
        const subscribers = this.subscriptions[triggerName];

        for (const subscriber of subscribers) {
            subscriber.callback(data)
        }
    }
}
