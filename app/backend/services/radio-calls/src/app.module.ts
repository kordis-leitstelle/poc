import {Module} from '@nestjs/common';
import {GraphQLFederationModule} from '@nestjs/graphql';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {RadioCallsModule} from "./modules/radio-calls/radio-calls.module";
import {OperationsModule} from "./modules/operations/operations.module";
import {CommonModule} from "./modules/common/common.module";

@Module({
    imports: [
        GraphQLFederationModule.forRoot({
            typePaths: ['**/*.graphql'],
            context: ({req}) => {
                let user: any;
                if ("krd-user" in req.headers) {
                    try {
                        user = JSON.parse(req.headers["krd-user"])
                    } catch {
                        user = null;
                    }
                } else {
                    user = null;
                }

                req.user = user;

                return req;
            },
        }),
        RadioCallsModule,
        OperationsModule,
        CommonModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}
