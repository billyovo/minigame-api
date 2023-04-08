import { updateEvents, eventsDateMap } from "../utils/getEventSchedule.js";
import { CronJob } from "cron";
import { makeBanner } from "../utils/image.js";
const scheduleCheckEvent = new CronJob('1 0 * * *', async function() {
    updateEvents();
    await makeBanner(eventsDateMap.nearest.title, eventsDateMap.nearest.date.toJSDate().toISOString().substring(0,10))
}, null, true, 'Asia/Taipei');
scheduleCheckEvent.start();