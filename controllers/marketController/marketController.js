const marketModel = require("../../model/marketSchema");

const fetchCalendarData = async () => {
    //API : rapidapi-forex-factory-scraper
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

  const fetchLiveCurrencyData=async()=>{
    //API : https://currencylayer.com/
    try {
    const targetCurrencies = 'EUR,GBP,CAD,JPY,AUD,CHF,CNY,SEK,NZD,MXN'
    const response = await fetch(`http://apilayer.net/api/live?access_key=fa81cecba1e88a485437a82450f85da8&currencies=${targetCurrencies}&source=USD&format=1`)
    console.log(response,'response');
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    const data = await response.json();
    const dataArray = Object.entries(data.quotes).map(([currency, price]) => ({
      currency,
      price
    }));
        const modifiedData = []
        for (let i = 0; i < dataArray.length; i += 2) {
          if (i + 1 < dataArray.length) {
            modifiedData.push([dataArray[i], dataArray[i + 1]]);
          } else {
            modifiedData.push([dataArray[i]]);
          }
        }

        await marketModel.updateOne({}, { $set: { CurrencyData: modifiedData } });
        console.log(modifiedData,'CurrencyData modifiedData saved to schema');
      }catch(error){
        console.error(error);
      }
  }

  const loadmarketData=async(req,res)=>{
    try {
        const data= await marketModel.findOne({})
        res.status(200).json({data})
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

module.exports = {
    fetchCalendarData,
    fetchLiveCurrencyData,
    loadmarketData
}