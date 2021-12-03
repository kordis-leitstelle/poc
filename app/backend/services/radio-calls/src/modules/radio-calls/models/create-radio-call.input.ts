import {Field, InputType} from "@nestjs/graphql";

@InputType()
export class CreateRadioCallInput {
    @Field({ nullable: false })
    sendingUnit: string;

    @Field({ nullable: false })
    receivingUnit: string;

    @Field({ nullable: false  })
    message: string;
}
