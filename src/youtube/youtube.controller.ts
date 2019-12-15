import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { YoutubeService } from "./youtube.service";
import { VideoItemUtil, VideoItem } from "./../util/Videoitem";
import { ListDto, ListResponseDto, PlaylistDto, PlaylistResponseDto, SearchDto, SearchResponseDto, EntirePlaylistDto, EntirePlaylistResponseDto } from "./youtube.dto";
import { ApiResponse } from "@nestjs/swagger";

@Controller()
export class YoutubeController {

    constructor(private readonly youtubeService: YoutubeService) {}
    
    @Post("list")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Youtube list",
        type: ListResponseDto
    })
    public async list(@Body() body: ListDto): Promise<{
        videos: VideoItem[];
    }> {
        const items = await this.youtubeService.list(body);
        return {
            videos: VideoItemUtil.schemaListToVideoItemList(items)
        };
    }

    @Post("playlist")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Youtube playlist",
        type: PlaylistResponseDto
    })
    public async playlist(@Body() playlistDto: PlaylistDto): Promise<PlaylistResponseDto> {
        const response = (await this.youtubeService.playlist(playlistDto));
        const { 
            data: { 
                nextPageToken,
                prevPageToken,
                pageInfo: {
                    totalResults,
                    resultsPerPage,
                },
                items: itemIds
            },
        } = response;
        const ids = itemIds.map((item) => item.snippet.resourceId.videoId);
        const items = (await this.youtubeService.list({ ids }));
        return {
            nextPageToken,
            prevPageToken,
            totalResults,
            resultsPerPage,
            videos: VideoItemUtil.schemaListToVideoItemList(items),
        };
    }

    @Post("search")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Search list",
        type: SearchResponseDto
    })
    public async search(@Body() searchDto: SearchDto): Promise<SearchResponseDto> {
        const response = (await this.youtubeService.search(searchDto));
        const {
            data: {
                nextPageToken,
                prevPageToken,
                pageInfo: {
                    totalResults,
                    resultsPerPage,
                },
                items: itemIds,
            }
        } = response;
        const ids = itemIds.map((item) => item.id.videoId);
        const items = await this.youtubeService.list({ ids });
        return {
            nextPageToken,
            prevPageToken,
            totalResults,
            resultsPerPage,
            videos: VideoItemUtil.schemaListToVideoItemList(items)
        };
    }

    @Post("entire-playlist")
    @HttpCode(HttpStatus.OK)
    @ApiResponse({
        status: HttpStatus.OK,
        description: "Entire playlist",
        type: EntirePlaylistResponseDto
    })
    public async entirePlaylist(@Body() {id}: EntirePlaylistDto): Promise<EntirePlaylistResponseDto> {
        const itemIds = await this.youtubeService.entirePlaylist({id});
        const ids = itemIds.map((item) => item.snippet.resourceId.videoId);
        const items = (await this.youtubeService.list({ ids }));
        return {
            videos: VideoItemUtil.schemaListToVideoItemList(items)
        };
    }

}