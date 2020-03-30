import { ApiProperty } from "@nestjs/swagger";
import { VideoItem } from "./../util/Videoitem";

export class ListResponseDto {
    @ApiProperty({ type: [VideoItem] })
    videos: VideoItem[];
}

export class PlaylistResponseDto {
    @ApiProperty()
    nextPageToken: string;

    @ApiProperty()
    prevPageToken: string;

    @ApiProperty()
    totalResults: number;

    @ApiProperty()
    resultsPerPage: number;

    @ApiProperty({ type: [VideoItem]})
    videos: VideoItem[];
}

export class SearchResponseDto {
    @ApiProperty()
    nextPageToken: string;

    @ApiProperty()
    prevPageToken: string;

    @ApiProperty()
    totalResults: number;

    @ApiProperty()
    resultsPerPage: number;

    @ApiProperty({ type: [VideoItem]})
    videos: VideoItem[];
}

export class EntirePlaylistResponseDto {
    @ApiProperty({ type: [VideoItem]})
    videos: VideoItem[];
}

export class ResolveUserSearchResponseDto {
    @ApiProperty({ type: [VideoItem]})
    videos: VideoItem[];

    @ApiProperty()
    nextPageToken?: string;

    @ApiProperty()
    totalResults?: number;
}
