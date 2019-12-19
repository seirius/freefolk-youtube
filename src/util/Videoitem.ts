import { URL } from "url";
import { youtube_v3 } from "googleapis";
import { Time } from "../youtube/Time";
import { ApiProperty } from "@nestjs/swagger";
import Axios from "axios";
import { Logger } from "@nestjs/common";

export class VideoItem {
    @ApiProperty()
    id: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    videoUrl: string;

    @ApiProperty()
    thumbnailUrl: string;

    @ApiProperty()
    duration: string;

    @ApiProperty()
    disabled: boolean;

    @ApiProperty()
    author: string;
}

export class VideoItemUtil {
    public static schemaListToVideoItemList(schemaVideos: youtube_v3.Schema$Video[]): VideoItem[] {
        return schemaVideos.map((item) => {
            const { thumbnails } = item.snippet;
            return {
                id: item.id,
                title: item.snippet.title,
                videoUrl: UrlUtil.convertId(item.id),
                thumbnailUrl: thumbnails ? thumbnails.high.url : "",
                duration: Time.youtubeDuration(item.contentDetails.duration),
                disabled: false,
                author: item.snippet.channelTitle
            };
        });
    }
}

export class UrlUtil {

    private static readonly logger = new Logger(UrlUtil.name);

    public static readonly YOUTUBE_HOST =
        process.env.YOUTUBE_HOST ? process.env.YOUTUBE_HOST : "https://www.youtube.com/watch";

    public static convertId(id: string): string {
        const url = new URL(UrlUtil.YOUTUBE_HOST);
        url.searchParams.append("v", id);
        return url.toString();
    }

    public static async getVideosId(url: string): Promise<IVideosIdResponse> {
        let videoId: string;
        let playlistId: string;
        try {
            const unshortenedUrl = await UrlUtil.getUnshortenedUrl(url);
            if (unshortenedUrl) {
                playlistId = UrlUtil.getUrlParams(unshortenedUrl, "list");
                if (!playlistId) {
                    videoId = UrlUtil.getUrlParams(unshortenedUrl, "v");
                }
            }
        } catch (error) {
            UrlUtil.logger.log(error);
        }

        return {videoId, playlistId};
    }

    public static isUrl(value: string): boolean {
        try {
            // tslint:disable-next-line: no-unused-expression
            new URL(value);
            return true;
        } catch (error) {
            return false;
        }
    }

    public static getUrlParams(value: string, paramName: string): string | null {
        if (UrlUtil.isUrl(value)) {
            return new URL(value).searchParams.get(paramName);
        }
        return null;
    }

    public static async getUnshortenedUrl(url: string): Promise<string | undefined> {
        const response = await Axios.get(url);
        if (response && response.request && response.request.res && response.request.res.responseUrl) {
            return response.request.res.responseUrl;
        }
    }

}

export interface IVideosIdResponse {
    videoId?: string | null;
    playlistId?: string | null;
}

export interface IResolveUserSearchArgs {
    text: string;
    pageToken: string;
    maxResults: number;
}

export interface IResolveUserSearchResponse {
    videos: VideoItem[];
    pageToken?: string;
    totalResults?: number;
}
