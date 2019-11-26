import { google, youtube_v3 } from "googleapis";
import { GaxiosResponse } from "gaxios";
import { YoutubeConfig } from "../config/YoutubeConfig";
const youtube = google.youtube("v3");

export class Youtube {

    public static list({ ids, part }: IListArgs): Promise<GaxiosResponse<youtube_v3.Schema$VideoListResponse>> {
        const idChain = ids.join(",");
        return youtube.videos.list({
            key: YoutubeConfig.YOUTUBE_API_KEY,
            id: idChain,
            part: part && part.length ? part.join(",") : "snippet, contentDetails, id",
        });
    }

    public static playlist({ id, maxResults, pageToken }: IPlaylistArgs): Promise<GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse>> {
        return youtube.playlistItems.list({
            key: YoutubeConfig.YOUTUBE_API_KEY,
            playlistId: id,
            part: "snippet",
            pageToken,
            maxResults: maxResults ? maxResults : 50,
        });
    }

    public static search({ q, maxResults, pageToken}: ISearchArgs): Promise<GaxiosResponse<youtube_v3.Schema$SearchListResponse>> {
        return youtube.search.list({
            key: YoutubeConfig.YOUTUBE_API_KEY,
            part: "id",
            q,
            maxResults: maxResults ? maxResults : 50,
            pageToken,
        });
    }

}

export interface IListArgs {
    ids: string[];
    part?: string[];
}

export interface IPlaylistArgs {
    id: string;
    pageToken?: string;
    maxResults?: number;
}

export interface ISearchArgs {
    q: string;
    maxResults?: number;
    pageToken?: string;
}