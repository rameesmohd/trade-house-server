const Stripe = require('stripe')
const orderModel = require('../../model/orderSchema')
const Razorpay = require('razorpay')
require('dotenv').config()
const crypto = require('crypto')
const courseModel = require('../../model/courseSchema')
const stripe = Stripe(process.env.STRIPE_KEY)

const paymentModeHandle = async (req, res) => {
  try {
    const userId = req.user._id
    const { methord } = req.params
    const course = req.body
    console.log(methord);
    console.log(req);
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
            success_url: `${process.env.BACKENDURL}/payments?status=success&user_id=${userId}&course_id=${course._id}&date_of_purchase=${date_of_purchase}&amount=${course.price}`,
            cancel_url: `${process.env.BACKENDURL}/payments?status=fail`,
          })
          res.send({ url: session.url })
      }
    if(methord === 'razorpay'){
        let instance = new Razorpay({
          key_id: process.env.RAZORPAY_ID,
          key_secret: process.env.RAZORPAY_PASS,
        });
        
        let datas = {
          amount: course.price * 100, 
          currency: "INR"
        };
        
       instance.orders.create(datas, function (err, order) {
          if (err) {
            console.error("Error creating Razorpay order:", err);
            return res.status(500).json({ status: false });
          } else {
            console.log("Razorpay order created:", order);
            return res.status(200).json({ status: true, data: order });
          }
        });
      }
  } catch (error) {
    res.status(500).json({ message: "Server Error" })
    console.log(error)
  }
}


const paymentStatusHandle = async(req,res)=>{
  try {
    const {status,user_id,course_id,date_of_purchase,amount} = req.query
    const parsedDate = new Date();
    parsedDate.setDate(parsedDate.getDate() + 1);
    parsedDate.setUTCHours(0, 0, 0, 0);
    const purchase_date = parsedDate.toISOString();

    if(status === 'success'){
        console.log(user_id,course_id,date_of_purchase,amount);
        const order = new orderModel({
          course_id : course_id,
          user_id : user_id,
          date_of_purchase : purchase_date,
          amount : amount,
          payment_mode:'strip'
        })
        const increment=async()=>await courseModel.updateOne(
          { _id: course_id },
          { $inc: { total_purchases: 1 } } 
        );
        const save = await order.save().then(()=>{
          increment()
          save && res.redirect(`${process.env.FONTENDURL}/payments/success`)
    })
    }else{
        res.redirect(`${process.env.FONTENDURL}/payments?status=failed`)
    }
  } catch (error) {
    res.redirect(`${process.env.FONTENDURL}/payments?status=failed`)
    console.log(error.message);
  }
}


const verifyrzpay = async (req,res) => {
  const razorpay_order_id = req.body?.response.razorpay_order_id;
  const razorpay_payment_id = req.body?.response.razorpay_payment_id;
  const razorpay_signature = req.body?.response.razorpay_signature
  const {course_id ,amount,mode_of_payment }= req.body.purchaseData

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  try{
    const generated_signature = crypto.createHmac('sha256',process.env.RAZORPAY_PASS)
    .update(body, 'utf-8')
    .digest('hex')
  
    if(generated_signature === razorpay_signature){
      const parsedDate = new Date();
      parsedDate.setDate(parsedDate.getDate());
      const purchase_date = parsedDate.toISOString();

      const order = new orderModel({
        course_id : course_id,
        user_id : req.user._id,
        payment_mode : mode_of_payment,
        date_of_purchase : purchase_date,
        amount : amount
      })

      const increment=async()=>await courseModel.updateOne(
        { _id: course_id },
        { $inc: { total_purchases: 1 } } 
      );

      

      await order.save()
      .then(() => {
        increment()

        res.status(200).json({ message: 'Payment success' });
      })
      .catch((error) => {
        console.error(error); 
        res.status(500).json({ message: 'Saving order failed' });
      });
    }else{
      console.log('invalid signature');
      res.json({status:false, message:'Invalid signature'})
    }
  }catch(error){
    console.log(error);
    res.status(500).json({message:'Server Failed'})
  }
}


module.exports = {
  paymentModeHandle,
  paymentStatusHandle,
  verifyrzpay
}