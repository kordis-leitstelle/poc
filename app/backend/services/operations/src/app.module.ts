import {Module} from '@nestjs/common';
import {AppController} from './app.controller';
import {AppService} from './app.service';
import {GraphQLFederationModule} from '@nestjs/graphql'
import {OperationsModule} from './modules/operations/operations.module';
import { CommonModule } from './modules/common/common.module';
import {ConfigModule} from "@nestjs/config";

@Module({
    imports: [
        ConfigModule.forRoot(),
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
        OperationsModule,
        CommonModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {
}

