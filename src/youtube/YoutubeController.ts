import { Controller, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Youtube } from "./Youtube";
import { OK } from "http-status-codes";
import { VideoItemUtil } from "../util/VideoItem";
import { Catch } from "../error/ErrorDeco";

@Controller('youtube')
export class YoutubeController {

    @Post("list")
    @Catch
    public async list(req: Request, res: Response): Promise<void> {
        const response = (await Youtube.playlist(req.body));
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
        const { data: { items }} = (await Youtube.list({ ids }));
        res.status(OK).json({
            nextPageToken,
            prevPageToken,
            totalResults,
            resultsPerPage,
            videos: VideoItemUtil.schemaListToVideoItemList(items),
        });
    }

}