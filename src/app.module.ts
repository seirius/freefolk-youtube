import { Module } from '@nestjs/common';
import { DefaultModule } from './default/default.module';
import { YoutubeModule } from './youtube/youtube.module';

@Module({
    imports: [
        DefaultModule,
        YoutubeModule
    ],
    controllers: [],
    providers: [],
})
export class AppModule { }
