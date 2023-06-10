import { updateEvents, eventsDateMap, executeUpdateEvents } from "../utils/getEventSchedule.js";
import { CronJob } from "cron";
import { makeBanner } from "../utils/image.js";
const scheduleCheckEvent = new CronJob('1 0 * * *',  async function() {
    executeUpdateEvents();
    await makeBanner(eventsDateMap.nearest.title, eventsDateMap.nearest.date.toFormat('yyyy-MM-dd'))
}, null, true, 'Asia/Taipei');
scheduleCheckEvent.start();
