import { Controller, HttpCode, HttpStatus, Get, Query } from "@nestjs/common";
import { YoutubeService } from "./youtube.service";
import { VideoItemUtil } from "./../util/Videoitem";
import {
    ListResponseDto,
    PlaylistResponseDto,
    SearchResponseDto,
    EntirePlaylistResponseDto,
    ResolveUserSearchResponseDto,
} from "./youtube.dto";
import { ApiResponse, ApiQuery } from "@nestjs/swagger";

@Controller()
export class YoutubeController {

    constructor(private readonly youtubeService: YoutubeService) {}

    @Get("list")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Youtube list",
        type: ListResponseDto,
    })
    @ApiQuery({
        name: "id",
        type: [String],
        required: true,
    })
    @ApiQuery({
        name: "part",
        type: [String],
        required: false,
    })
    public async list(
        @Query("id") id: any,
        @Query("part") part?: any,
    ): Promise<ListResponseDto> {
        const items = await this.youtubeService.list({
            ids: typeof id === "string" ? [id] : id,
            part: typeof part === "string" ? [part] : part,
        });
        return {
            videos: VideoItemUtil.schemaListToVideoItemList(items),
        };
    }

    @Get("playlist")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Youtube playlist",
        type: PlaylistResponseDto,
    })
    @ApiQuery({
        name: "id",
        type: String,
        required: true,
    })
    @ApiQuery({
        name: "pageToken",
        type: String,
        required: false,
    })
    @ApiQuery({
        name: "maxResults",
        type: Number,
        required: false,
    })
    public async playlist(
        @Query("id") id: string,
        @Query("pageToken") pageToken?: string,
        @Query("maxResults") maxResults?: number,
    ): Promise<PlaylistResponseDto> {
        const {
            data: {
                nextPageToken,
                prevPageToken,
                pageInfo: {
                    totalResults,
                    resultsPerPage,
                },
                items: itemIds,
            },
        } = await this.youtubeService.playlist({ id, pageToken, maxResults });
        const ids = itemIds.map((item) => item.snippet.resourceId.videoId);
        const items = await this.youtubeService.list({ ids });
        return {
            nextPageToken,
            prevPageToken,
            totalResults,
            resultsPerPage,
            videos: VideoItemUtil.schemaListToVideoItemList(items),
        };
    }

    @Get("search")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Search list",
        type: SearchResponseDto,
    })
    @ApiQuery({
        name: "q",
        type: String,
        required: true,
    })
    @ApiQuery({
        name: "maxResults",
        type: Number,
        required: false,
    })
    @ApiQuery({
        name: "pageToken",
        type: String,
        required: false,
    })
    public async search(
        @Query("q") q: string,
        @Query("maxResults") maxResults?: number,
        @Query("pageToken") pageToken?: string,
    ): Promise<SearchResponseDto> {
        const response = (await this.youtubeService.search({
            q, maxResults, pageToken,
        }));
        const {
            data: {
                nextPageToken,
                prevPageToken,
                pageInfo: {
                    totalResults,
                    resultsPerPage,
                },
                items: itemIds,
            },
        } = response;
        const ids = itemIds.map((item) => item.id.videoId);
        const items = await this.youtubeService.list({ ids });
        return {
            nextPageToken,
            prevPageToken,
            totalResults,
            resultsPerPage,
            videos: VideoItemUtil.schemaListToVideoItemList(items),
        };
    }

    @Get("entire-playlist")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Entire playlist",
        type: EntirePlaylistResponseDto,
    })
    @ApiQuery({
        name: "id",
        type: String,
        required: true,
    })
    public async entirePlaylist(@Query("id") id: string): Promise<EntirePlaylistResponseDto> {
        const itemIds = await this.youtubeService.entirePlaylist({id});
        const ids = itemIds.map((item) => item.snippet.resourceId.videoId);
        const items = (await this.youtubeService.list({ ids }));
        return {
            videos: VideoItemUtil.schemaListToVideoItemList(items),
        };
    }

    @Get("resolve-user-search")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "resolve user's input for a search",
        type: ResolveUserSearchResponseDto,
    })
    @ApiQuery({
        name: "text",
        type: String,
        required: true,
    })
    @ApiQuery({
        name: "pageToken",
        type: String,
        required: false,
    })
    @ApiQuery({
        name: "maxResults",
        type: Number,
        required: false,
    })
    public resolveUserSearch(
        @Query("text") text: string,
        @Query("pageToken") pageToken?: string,
        @Query("maxResults") maxResults?: number,
    ): Promise<ResolveUserSearchResponseDto> {
        return this.youtubeService.resolveUserSearch({
            text, pageToken, maxResults,
        });
    }

}
