const cron = require('node-cron');
const axios = require('axios')
const marketModel = require('../model/marketSchema')

const crone = ()=>{
    cron.schedule('0 0 */3 * * *', () => {
        console.log('This function runs every 3 days.')
        const fetchcalenderData=async()=>{
            const today = new Date(); 
            const year = today.getFullYear();
            const month = today.getMonth() + 1; 
            const day = today.getDate();
            const options = {
            method: 'GET',
            url: 'https://forex-factory-scraper1.p.rapidapi.com/get_real_time_calendar_details',
            params: {
              calendar: 'Forex',
              year: year,
              month: month,
              day: day
            },
            headers: {
              'X-RapidAPI-Key': '0f86848d76mshb648d21621dcc6bp1dd038jsn90030cf66930',
              'X-RapidAPI-Host': 'forex-factory-scraper1.p.rapidapi.com'
            }
          };
          
          try {
            const response = await fetch.request(options);
    
            const economicCalenderData = response.data;

            console.log(economicCalenderData);

            await marketModel.updateOne({},{$set:{forexcalender:economicCalenderData}})
            console.log('Economic calendar data saved to the database.');
        } catch (error) {
            console.error(error);
        }    
      }
      fetchcalenderData()
    })
}

module.exports = crone

