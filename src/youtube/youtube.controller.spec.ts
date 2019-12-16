import { Test, TestingModule } from "@nestjs/testing";
import { YoutubeController } from "./youtube.controller";
import { SearchResponseDto } from "./youtube.dto";
import { YoutubeService } from "./youtube.service";

describe("YoutubeController", () => {
    let app: TestingModule;

    beforeAll(async () => {
        app = await Test.createTestingModule({
            providers: [YoutubeService],
            controllers: [YoutubeController]
        }).compile();
    });

    describe("list", () => {
        it("should return info about 'Japan - A short travel film'", async () => {
            const youtubeController = app.get<YoutubeController>(YoutubeController);
            const result = await youtubeController.list({
                ids: ["yMPJRe2qTlI"]
            });
            expect(result).toBeInstanceOf(Object);
            expect(result.videos).toBeInstanceOf(Array);
            expect(result.videos.length).toEqual(1);
            expect(result.videos[0]).toEqual({
                id: "yMPJRe2qTlI",
                title: "Japan - A short travel film",
                videoUrl: "https://www.youtube.com/watch?v=yMPJRe2qTlI",
                thumbnailUrl: "https://i.ytimg.com/vi/yMPJRe2qTlI/hqdefault.jpg",
                duration: "04:29",
                disabled: false,
                author: "Media Hog Productions"
            });
        });
    });

    describe("playlist", () => {
        it("should return info about a playlist", async () => {
            const youtubeController = app.get<YoutubeController>(YoutubeController);
            const result = await youtubeController.playlist({
                id: "PLpqYk0rZC57ps_Es4f8SCQjTRsrG-bzA-"
            });
            expect(result).toBeInstanceOf(Object);
            expect(result.prevPageToken).toEqual(undefined);
            expect(result.nextPageToken).toEqual(undefined);
            expect(result.totalResults).toEqual(1);
            expect(result.resultsPerPage).toEqual(50);
            expect(result.videos).toBeInstanceOf(Array);
            expect(result.videos.length).toEqual(1);
            expect(result.videos[0]).toEqual({
                id: "FptK1cyofOs",
                title: "Aaron Smith - Dancin (KRONO Remix) [9D AUDIO | NOT 8D]  🎧",
                videoUrl: "https://www.youtube.com/watch?v=FptK1cyofOs",
                thumbnailUrl: "https://i.ytimg.com/vi/FptK1cyofOs/hqdefault.jpg",
                duration: "04:17",
                disabled: false,
                author: "Shake Music"
            });
        });
    });

    describe("search", () => {
        let result: SearchResponseDto;
        const q = "league of legends";
        const maxResults = 10;
        it("should return info about a search", async () => {
            const youtubeController = app.get<YoutubeController>(YoutubeController);
            result = await youtubeController.search({ q, maxResults });
            expect(result).toBeInstanceOf(Object);
            expect(result.prevPageToken).toEqual(undefined);
            expect(typeof result.nextPageToken).toEqual("string");
            expect(result.resultsPerPage).toEqual(10);
            expect(result.videos).toBeInstanceOf(Array);
            expect(result.videos.length).toBeLessThanOrEqual(10);
        });

        it("should return info about a search in next page", async () => {
            const youtubeController = app.get<YoutubeController>(YoutubeController);
            const nextResult = await youtubeController
            .search({ q, maxResults, pageToken: result.nextPageToken });

            expect(nextResult).toBeInstanceOf(Object);
            expect(typeof nextResult.prevPageToken).toEqual("string");
            expect(typeof result.nextPageToken).toEqual("string");
            expect(nextResult.resultsPerPage).toEqual(10);
            expect(nextResult.videos).toBeInstanceOf(Array);
            expect(nextResult.videos.length).toBeLessThanOrEqual(10);
        });
    });

    describe("entire-playlist", () => {
        it("should return info about the entire playlist (more than 50 items)", async () => {
            const youtubeController = app.get<YoutubeController>(YoutubeController);
            const result = await youtubeController.entirePlaylist({id: "PLpqYk0rZC57qjsZGceeVMumARNbsi1JqK"});
            expect(result).toBeInstanceOf(Object);
            expect(result.videos).toBeInstanceOf(Array);
            expect(result.videos.length).toBeGreaterThan(50);
        });
    });
});