const marketModel = require("../../model/marketSchema");

const fetchCalendarData = async () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    const url = 'https://forex-factory-scraper1.p.rapidapi.com/get_real_time_calendar_details';
    const queryParams = new URLSearchParams({
      calendar: 'Forex',
      year: year,
      month: month,
      day: day
    });

    const options = {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': '0f86848d76mshb648d21621dcc6bp1dd038jsn90030cf66930',
        'X-RapidAPI-Host': 'forex-factory-scraper1.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(`${url}?${queryParams.toString()}`, options);
      console.log(response);
      if (response.ok) {
        const economicCalendarData = await response.json();
        console.log(economicCalendarData);

        await marketModel.updateOne({}, { $set: { forexcalender: economicCalendarData } });
        console.log('Economic calendar data saved to the database.');
      } else {
        console.error('Failed to fetch data. HTTP status:', response.status);
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  module.exports = {
    fetchCalendarData
  }