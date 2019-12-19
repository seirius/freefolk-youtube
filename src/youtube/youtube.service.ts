import { Injectable } from "@nestjs/common";
import { google, youtube_v3 } from "googleapis";
import { GaxiosResponse } from "gaxios";
import { YoutubeConfig } from "./../config/YoutubeConfig";
import { UrlUtil, VideoItemUtil } from "./../util/Videoitem";
import { ResolveUserSearchDto, ResolveUserSearchResponseDto } from "./youtube.dto";
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
            part: part && part.length ? part.join(",") : "snippet, contentDetails, id",
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
                items,
            },
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

    public async resolveUserSearch({text, pageToken, maxResults}: ResolveUserSearchDto): Promise<ResolveUserSearchResponseDto> {
        if (UrlUtil.isUrl(text)) {
            const {videoId, playlistId} = await UrlUtil.getVideosId(text);
            if (videoId) {
                const videos = await this.list({ids: [videoId]});
                return {videos: VideoItemUtil.schemaListToVideoItemList(videos)};
            } else {
                const {
                    data: {
                        nextPageToken,
                        pageInfo: {
                            totalResults,
                        },
                        items: itemIds,
                    },
                } = (await this.playlist({id: playlistId, pageToken, maxResults}));
                const ids = itemIds.map((item) => item.snippet.resourceId.videoId);
                const items = (await this.list({ ids }));
                return {
                    videos: VideoItemUtil.schemaListToVideoItemList(items),
                    nextPageToken, totalResults,
                };
            }
        } else {
            const {
                data: {
                    nextPageToken,
                    pageInfo: {
                        totalResults,
                    },
                    items: itemIds,
                },
            } = (await this.search({q: text, pageToken, maxResults}));
            const ids = itemIds.map((item) => item.id.videoId);
            const items = await this.list({ ids });
            return {
                videos: VideoItemUtil.schemaListToVideoItemList(items),
                nextPageToken, totalResults,
            };
        }
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
