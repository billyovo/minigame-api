import { updateEvents } from "../utils/getEventSchedule.js";
import { CronJob } from "cron";
const scheduleCheckEvent = new CronJob('1 0 * * *', function() {
    updateEvents();	
}, null, true, 'Asia/Taipei');
scheduleCheckEvent.start();