import { Injectable } from "@nestjs/common";
import { google, youtube_v3 } from "googleapis";
import { GaxiosResponse } from "gaxios";
import { YoutubeConfig } from "./../config/YoutubeConfig";
import { ApiProperty } from "@nestjs/swagger";
const youtube = google.youtube("v3");

@Injectable()
export class YoutubeService {

    private readonly maxResults = 50;

    public async list({ids, part}: IListArgs): Promise<youtube_v3.Schema$Video[]> {
        let items50 = [...ids];
        if (ids.length > this.maxResults) {
            items50 = ids.splice(0, this.maxResults);
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
            items.push(...(await this.list({ids, part})));
        }

        return items;
    }

    public playlist({ id, maxResults, pageToken }: IPlaylistArgs): Promise<GaxiosResponse<youtube_v3.Schema$PlaylistItemListResponse>> {
        return youtube.playlistItems.list({
            key: YoutubeConfig.YOUTUBE_API_KEY,
            playlistId: id,
            part: "snippet",
            pageToken,
            maxResults: maxResults ? maxResults : this.maxResults,
        });
    }

    public async entirePlaylist({id, pageToken}: IEntirePlaylist): Promise<youtube_v3.Schema$PlaylistItem[]> {
        const {
            data: {
                nextPageToken,
                items
            }
        } = await this.playlist({id, pageToken});
        if (nextPageToken) {
            items.push(...(await this.entirePlaylist({id, pageToken: nextPageToken})));
        }

        return items;
    }

    public search({ q, maxResults, pageToken}: ISearchArgs): Promise<GaxiosResponse<youtube_v3.Schema$SearchListResponse>> {
        return youtube.search.list({
            key: YoutubeConfig.YOUTUBE_API_KEY,
            part: "id",
            q,
            maxResults: maxResults ? maxResults : this.maxResults,
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

export interface IEntirePlaylist {
    id: string;
    pageToken?: string;
}

export interface ISearchArgs {
    q: string;
    maxResults?: number;
    pageToken?: string;
}