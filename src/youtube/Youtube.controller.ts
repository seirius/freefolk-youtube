import { Controller, Post } from "@overnightjs/core";
import { Request, Response } from "express";
import { Youtube } from "./Youtube";
import { OK } from "http-status-codes";
import { VideoItemUtil } from "../util/VideoItem";
import { Catch } from "../error/ErrorDeco";

/**
 * @swagger
 * definitions:
 *  VideoItem:
 *      type: object
 *      properties:
 *          id:
 *              type: string
 *          title:
 *              type: string
 *          videoUrl:
 *              type: string
 *          thumbnailUrl:
 *              type: string
 *          duration:
 *              type: string
 *          disabled:
 *              type: boolean
 */
@Controller('')
export class YoutubeController {

    /**
     * @swagger
     * /list:
     *  post:
     *      tags:
     *          - youtube
     *      parameters:
     *          - in: body
     *            required: true
     *            name: args
     *            schema:
     *              type: object
     *              required:
     *                  - ids
     *              properties:
     *                  ids:
     *                      type: array
     *                      items:
     *                          type: string
     *      responses:
     *          200:
     *              description: video list
     *              schema:
     *                  type: object
     *                  properties:
     *                      videos:
     *                          type: array
     *                          items:
     *                              $ref: '#/definitions/VideoItem'
     */
    @Post("list")
    @Catch
    public async list(req: Request, res: Response): Promise<void> {
        const { data: { items } } = await Youtube.list(req.body);
        res.status(OK).json({
            videos: VideoItemUtil.schemaListToVideoItemList(items),
        });
    }

    /**
     * @swagger
     * /playlist:
     *  post:
     *      tags:
     *          - youtube
     *      parameters:
     *          - in: body
     *            name: args
     *            required: true
     *            schema:
     *              type: object
     *              required: 
     *                  - id
     *              properties:
     *                  id:
     *                      type: string
     *                  maxResults:
     *                      type: number
     *                  pageToken:
     *                      type: string
     *      responses:
     *          200:
     *              description: video list
     *              schema:
     *                  type: object
     *                  properties:
     *                      nextPageToken:
     *                          type: string
     *                      prevPageToken:
     *                          type: string
     *                      totalResults:
     *                          type: number
     *                      videos:
     *                          type: array
     *                          items:
     *                              $ref: '#/definitions/VideoItem'
     *      
     */
    @Post("playlist")
    @Catch
    public async playlist(req: Request, res: Response): Promise<void> {
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

    /**
     * @swagger
     * /search:
     *  post:
     *      tags:
     *          - youtube
     *      parameters:
     *          - in: body
     *            name: args
     *            required: true
     *            schema:
     *              type: object
     *              required: 
     *                  - id
     *              properties:
     *                  q:
     *                      type: string
     *                  maxResults:
     *                      type: number
     *                  pageToken:
     *                      type: string
     *      responses:
     *          200:
     *              description: video list
     *              schema:
     *                  type: object
     *                  properties:
     *                      nextPageToken:
     *                          type: string
     *                      prevPageToken:
     *                          type: string
     *                      totalResults:
     *                          type: number
     *                      videos:
     *                          type: array
     *                          items:
     *                              $ref: '#/definitions/VideoItem'
     *      
     */
    @Post("search")
    @Catch
    public async search(req: Request, res: Response): Promise<void> {
        const response = (await Youtube.search(req.body));
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
        const { data: { items }} = await Youtube.list({ ids });
        res.status(OK).json({
            nextPageToken,
            prevPageToken,
            totalResults,
            resultsPerPage,
            videos: VideoItemUtil.schemaListToVideoItemList(items),
        });
    }

}