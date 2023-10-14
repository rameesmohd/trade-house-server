const cron = require('node-cron');
const { fetchCalendarData ,fetchLiveCurrencyData} = require('./controllers/marketController/marketController')
const mongoose = require('mongoose')
require('dotenv').config()
mongoose.connect(process.env.URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})

const fetchCalendarDatas = async () => {
    try {
        console.log('===cron working===fetchCalendarData');
        fetchCalendarData()
    } catch (error) {
        console.error('Error', error);
    }
};

cron.schedule('0 0 */3 * * *', () => {
    fetchCalendarDatas();
});

cron.schedule('0 0 */6 * * *', () => {
    fetchLiveCurrencyData();
});