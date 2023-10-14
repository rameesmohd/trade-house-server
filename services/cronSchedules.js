const cron = require('node-cron');
const { fetchCalendarData } = require('../controllers/marketController/marketController')

function scheduleCronJobs() {
  cron.schedule('0 0 */3 * * *', () => {
    console.log('This function runs every 3 days.');
    // fetchCalendarData();
  });

  cron.schedule('*/10 * * * * *', () => {
    console.log('This cron function runs every 5 seconds.');
    // fetchCalendarData();
  });
}

module.exports = scheduleCronJobs;
