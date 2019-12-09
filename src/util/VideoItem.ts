import { URL } from "url";
import { youtube_v3 } from "googleapis";
import { Time } from "../youtube/Time";

export interface IVideoItem {
    id: string;
    title: string;
    videoUrl: string;
    thumbnailUrl: string;
    duration: string;
    disabled: boolean;
    author: string;
}

export class VideoItemUtil {
    public static schemaListToVideoItemList(schemaVideos: youtube_v3.Schema$Video[]): IVideoItem[] {
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

    public static readonly YOUTUBE_HOST = 
        process.env.YOUTUBE_HOST ? process.env.YOUTUBE_HOST : "https://www.youtube.com/watch";

    public static convertId(id: string): string {
        const url = new URL(UrlUtil.YOUTUBE_HOST);
        url.searchParams.append("v", id);
        return url.toString();
    }

}