import {MissingFieldResolverStrategy} from "./field-resolver-strategy";
import {deepmerge} from "deepmerge-ts";
import {FastifyInstance} from "fastify";

export class QueryResolveStrategy extends MissingFieldResolverStrategy<{authToken: string}> {
    constructor(private readonly fastify: FastifyInstance) {
        super();
    }

    async resolveMissingFields(payload: Record<string, any>,
                         info: any,
                         eventDetails: { queryHead: string; subscriptionName: string },
                         context: { authToken: string } | undefined): Promise<any> {
        const selections = this.buildNonPayloadSelections(eventDetails.subscriptionName, payload, info)

        if (!selections) {
            return payload;
        }

        const query = `${eventDetails.queryHead}{\n${selections}\n}`;

        // find a better way since this results in running token decoding twice
        const res = await this.fastify.inject({
            url: "/graphql",
            method: "POST",
            payload: {
                query: query,
                variables: payload
            },
            headers: {
                "Authorization": context?.authToken
            },
        })

        const responseData = JSON.parse(res.body)
        const dataValues = Object.values(responseData.data ?? {})

        if (dataValues.length < 1) {
            return payload
        }

        // is deep merge really necessary? we have key from the payload and the selection => union of them should be full result
        return deepmerge(dataValues[0], payload)
    }

}
