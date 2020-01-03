import { Module, Logger } from "@nestjs/common";
import { DefaultModule } from "./default/default.module";
import { YoutubeModule } from "./youtube/youtube.module";
import { ProcessStateModule, ProcessStateService, EProcessState } from "nest-mqtt-client";

@Module({
    imports: [
        DefaultModule,
        YoutubeModule,
        ProcessStateModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {
    constructor(
        private readonly processStateService: ProcessStateService,
    ) {
        this.initProcessStateListener();
    }

    private initProcessStateListener(): void {
        this.processStateService.onReportQuestion()
        .subscribe(({ petitionId }) => {
            new Logger().log(petitionId);
            this.processStateService.sendReport({
                name: "freefolk-youtube",
                petitionId,
                state: EProcessState.OK,
                info: {
                    ok: "notOk",
                },
            });
        });
    }
}
