import * as env from 'env-var';
import { config as envConfig } from 'dotenv';
envConfig();

export class YoutubeConfig {
    public static readonly YOUTUBE_API_KEY = env.get('YOUTUBE_API_KEY').asString();
}