// cron/escalationJob.js
import cron from 'node-cron';
import { handleEscalations } from './escalationJob.js';

// Runs every minute
const cronJobs = (app) => {
    cron.schedule('* * * * *', async () => {
        console.log('Running escalation check...');
        await handleEscalations();
    });
}

export default cronJobs;