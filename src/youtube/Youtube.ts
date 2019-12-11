import { google, youtube_v3 } from "googleapis";
import { GaxiosResponse } from "gaxios";
import { YoutubeConfig } from "../config/YoutubeConfig";
const youtube = google.youtube("v3");

export class Youtube {

    private static readonly MAX_RESULTS = 50;

    public static async list({ ids, part }: IListArgs): Promise<youtube_v3.Schema$Video[]> {
        let items50 = [...ids];
        if (ids.length > Youtube.MAX_RESULTS) {
            items50 = ids.splice(0, Youtube.MAX_RESULTS);
        } else {
            ids.length = 0;
        }
        const idChain = items50.join(",");
        const { data: { items } } = await youtube.videos.list({
            key: YoutubeConfig.YOUTUBE_API_KEY,
            id: idChain,
            part: part && part.length ? part.join(",") : "snippet, contentDetails, id"
        });

        if (ids.length) {
            items.push(...(await Youtube.list({ids, part})));
        }

        return items;
    }

    public static playlist({ id, maxResults, pageToken }: IPlaylistArgs): Promise<GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse>> {
        return youtube.playlistItems.list({
            key: YoutubeConfig.YOUTUBE_API_KEY,
            playlistId: id,
            part: "snippet",
            pageToken,
            maxResults: maxResults ? maxResults : Youtube.MAX_RESULTS,
        });
    }

    public static async entirePlaylist({id, pageToken}): Promise<youtube_v3.Schema$PlaylistItem[]> {
        const {
            data: {
                nextPageToken,
                items
            }
        } = await Youtube.playlist({id, pageToken});
        if (nextPageToken) {
            items.push(...(await Youtube.entirePlaylist({id, pageToken: nextPageToken})));
        }

        return items;
    }

    public static search({ q, maxResults, pageToken}: ISearchArgs): Promise<GaxiosResponse<youtube_v3.Schema$SearchListResponse>> {
        return youtube.search.list({
            key: YoutubeConfig.YOUTUBE_API_KEY,
            part: "id",
            q,
            maxResults: maxResults ? maxResults : Youtube.MAX_RESULTS,
            pageToken,
        });
    }

}

export interface IListArgs {
    ids: string[];
    part?: string[];
    items?: youtube_v3.Schema$Video[];
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

export interface IEntirePlaylistArgs {
    id: string;
    pageToken?: string;
    items: youtube_v3.Schema$PlaylistItem[];
}

export interface IEntirePlaylistResponse {
    pageToken: string;
    items: youtube_v3.Schema$PlaylistItem[];
}