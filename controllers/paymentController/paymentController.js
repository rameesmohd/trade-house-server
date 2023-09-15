const Stripe = require('stripe')
const orderModel = require('../../model/orderSchema')
require('dotenv').config()

const stripe = Stripe(process.env.STRIPE_KEY)

const paymentModeHandle = async (req, res) => {
  try {
    const userId = req.user._id
    const { methord } = req.params
    const course = req.body

    if(methord === 'strip'){
        const date_of_purchase = new Date()
        const amount = course.price
        
        const user = await stripe.customers.create({
            metadata: {
              userId: userId,
              courseId: course._id,
              date_of_purchase: date_of_purchase,
              price : amount
            }
          })
          
        const session = await stripe.checkout.sessions.create({
            customer: user.id,
            line_items: [
              {
                price_data: {
                  currency: 'inr',
                  product_data: {
                    name: course.title,
                    metadata: {
                      id: course._id
                    }
                  },
                  unit_amount: amount * 100,
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.BACKENDURL}/payment?status=success&user_id=${userId}&course_id=${course._id}&date_of_purchase=${date_of_purchase}&amount=${course.price}`,
            cancel_url: `${process.env.BACKENDURL}/payment?status=fail`,
          })
          res.send({ url: session.url })
        }
  } catch (error) {
    res.status(500).json({ message: "Server Error" })
    console.log(error)
  }
}

const paymentStatusHandle = async(req,res)=>{
  try {
    const {status,user_id,course_id,date_of_purchase,amount} = req.query
    if(status === 'success'){
        console.log(user_id,course_id,date_of_purchase,amount);
        const order = new orderModel({
          course_id : course_id,
          user_id : user_id,
          date_of_purchase : date_of_purchase,
          amount : amount
        })
    const save = await order.save()
       save && redirect(`${process.env.FONTENDURL}/payment/success`)
    }else{
        res.redirect(`${process.env.FONTENDURL}/payment/failed`)
    }
  } catch (error) {
    res.redirect(`${process.env.FONTENDURL}/payment/failed`)
    console.log(error.message);
  }
}


module.exports = {
  paymentModeHandle,
  paymentStatusHandle,
}