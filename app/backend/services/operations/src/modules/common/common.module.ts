import {Global, Module} from '@nestjs/common';
import {DateScalar} from "./scalars/date.scalar";
import {DaprService} from "./services/dapr.service";
import {ConfigModule} from "@nestjs/config";

@Global()
@Module({
    providers: [DateScalar, DaprService],
    exports: [DateScalar, DaprService],
    imports: [ConfigModule.forRoot(),]
})
export class CommonModule {}

