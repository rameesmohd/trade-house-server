const cron = require('node-cron');
const { fetchCalendarData } = require('./controllers/marketController/marketController')
const mongoose = require('mongoose')
require('dotenv').config()
|
mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const fetchCalendarDatas = async () => {
    try {
        console.log('===cron working===');
        // fetchCalendarData()
    } catch (error) {
        console.error('Error deleting expired subscriptions:', error);
    }
};

cron.schedule('*/10 * * * * *', () => {
    fetchCalendarDatas()
});