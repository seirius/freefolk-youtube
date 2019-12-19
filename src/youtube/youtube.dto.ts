import { ApiProperty } from "@nestjs/swagger";
import { VideoItem } from "./../util/Videoitem";

export class ListDto {
    @ApiProperty()
    ids: string[];

    @ApiProperty()
    part?: string[];
}

export class ListResponseDto {
    @ApiProperty({ type: [VideoItem] })
    videos: VideoItem[];
}

export class PlaylistDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    pageToken?: string;

    @ApiProperty()
    maxResults?: number;
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

export class SearchDto {
    @ApiProperty()
    q: string;

    @ApiProperty()
    maxResults?: number;

    @ApiProperty()
    pageToken?: string;
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

export class EntirePlaylistDto {
    @ApiProperty()
    id: string;
}

export class EntirePlaylistResponseDto {
    @ApiProperty({ type: [VideoItem]})
    videos: VideoItem[];
}

export class ResolveUserSearchDto {
    @ApiProperty()
    text: string;

    @ApiProperty()
    pageToken?: string;

    @ApiProperty()
    maxResults?: number;
}

export class ResolveUserSearchResponseDto {
    @ApiProperty({ type: [VideoItem]})
    videos: VideoItem[];

    @ApiProperty()
    nextPageToken?: string;

    @ApiProperty()
    totalResults?: number;
}
