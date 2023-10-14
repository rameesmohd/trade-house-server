const mongoose = require('mongoose')

const marketSchema = mongoose.Schema({
   forexcalender :{
        type : Array
   },
   CurrencyData :{
      type : Array
   }  
})

const marketModel = mongoose.model('market',marketSchema)
module.exports = marketModel

