import * as moment from "moment";
import momentDuration from "moment-duration-format";

momentDuration(moment);

export class Time {

    public static youtubeDuration(duration: string): string {
        if (duration) {
            return moment.duration(duration).format("hh:mm:ss");
        }
        return "";
    }

}