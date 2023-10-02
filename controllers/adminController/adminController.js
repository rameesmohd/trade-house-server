const { generateAdminToken } = require('../../middleware/adminAuth');
const userModel = require('../../model/userSchema');
const categoryModel = require('../../model/categorySchema')
const courseModel = require('../../model/courseSchema')
const orderModel = require('../../model/orderSchema');
const usermodel = require('../../model/userSchema');
const contactModel = require('../../model/contactSchema')

const login = async(req,res)=>{
    try {
        const {email,pass} = req.body
        const adminData = await userModel.findOne({
            $and: [
              { email: email },
              { password: pass },
              { is_admin: true }
            ]
          });
          if(!adminData)
           res.status(400).json({message : 'autherisation failed!!'}) 
          else {
              let token = generateAdminToken(adminData)
              res.cookie("jwt", {token,email}, {
                  httpOnly: false,
                  maxAge: 6000 * 1000
                }).status(200).json({token,email,message : 'login success'}) 
            }
    } catch (error) {
        console.log(error);
        res.status(500).json({message : 'server side error'})
    }
}

const userDetails = async(req,res)=>{
    try {
        const users = await userModel.find({
            $or: [
              { is_admin: false },
              { is_admin: { $exists: false } }
            ]
          });
        res.status(200).json({result : users})
    } catch (error) {
        res.json(500).json({result : error.message})
        console.log(error);
    }
}

const updateProfile = async(req,res)=>{
    try {
        const {id,name,email,mobile} = req.body
        const  data = await userModel.updateOne({ _id: id }, { $set: { name: name, mobile: mobile ,email : email} });
        data ? res.status(200).json({message : 'updated successfully'}) : '';
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message : '504 error'})        
    }
}

const handleUserBlock=async(req,res)=>{
    try {
        const {action,id}  = req.params
        console.log(action,id);
        if(action==='block'){
            await userModel.updateOne({ _id: id }, { $set: { is_blocked : true } });
            res.status(200).json({message : 'user blocked!!'})
        }
        else{
            await userModel.updateOne({ _id: id }, { $set: { is_blocked : false } });
            res.status(200).json({message : 'user unblocked!!'})
        }
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}


const tutorReq = async(req,res)=>{
    try {
        const requestedUsers = await userModel.find({is_requested : true})
        res.status(200).json({result : requestedUsers})
    } catch (error) {
        console.log(error.message1);
        res.status(500)
    }
}

const approveTutor =async(req,res)=>{
    try {
        const id = req.query.id
        const status =  await userModel.updateOne({_id : id},{$set:{is_tutor : true ,is_requested :false,req_status : 'approved'}})
        if(status){
            const requestedUsers =  await userModel.find({is_requested : true})
            res.status(200).json({result : requestedUsers})
        }
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const rejectTutorReq =async(req,res)=>{
    try {
        console.log('asdfdf');
        const id = req.query.id
        const status =  await userModel.updateOne({_id : id},{$set:{is_requested :false,req_status : 'rejected'}})
        if(status){
            const requestedUsers =  await userModel.find({is_requested : true})
            res.status(200).json({result : requestedUsers})
        }
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const tutorslist =async(req,res)=>{
    try {
        const tutorData =  await userModel.find({is_tutor : true},{password:0})
        return tutorData ? res.status(200).json({result : tutorData}) : res.status(500)
    } catch (error) {
        console.log(error.message);
        return res.status(500)
    }
}

const toggleBlockTutor=async(req,res)=>{
    try {
        console.log(req.query);
        const success =  await userModel.updateOne({_id:req.query.id},{$set :{is_blocked : req.query.blockToggle}})
        if(success){
           const tutorData =  await userModel.find({is_tutor : true})
           return res.status(200).json({result : tutorData})
         }else{
            return res.status(500)
         }
    } catch (error) {
        console.log(error);
        return res.status(500)
    }
}

const addCategory=async(req,res)=>{
    try {
        console.log(req.body.newCategory);
        const catogary = new categoryModel({
            category : req.body.newCategory
        })
        catogary.save()
            .then(() => {
                res.status(200).json({message : 'saved successfully'})
            })
            .catch((error) => {
                res.status(500).json({message : error.message})
            });
    } catch (error) {
        res.status(500)
        console.log(err);
    }
}

const loadCategory=async(req,res)=>{
    try {
      console.log('category fetching......');
      const data = await categoryModel.find({})
      data ? res.status(200).json({result : data}) : res.status(500)
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const updateCategory=async(req,res)=>{
    try {
        console.log(req.body);
        const update = await categoryModel.updateOne({_id:req.body.id},{$set:{category : req.body.newCategory}})
        update ? res.status(200).json({message : 'Updated Succeessfully!'}) : res.status(500)
    } catch (error) {
        res.status(500)
        console.log(error);
    }
}

const allCourses=async(req,res)=>{
    try {
      const count = req.query.count
      const search =req.query.search
      console.log(typeof search);

      if(count){
        console.log('count',count);
        let allCourses = await courseModel.find({}).skip(count).limit(5)
        .populate({
            path:'category',
            select : 'category'
        })
        .populate({
            path:'tutor',
            select : 'firstName lastName image'
        }) 
        return res.status(200).json({result : allCourses})
      }

      if (search) {
        console.log('search');
        let allCourses = await courseModel
        .find({
          $or: [
            { title: { $regex: new RegExp(search, 'i') } },
            !isNaN(search) && { price: { $eq: Number(search) } }
          ].filter(Boolean)
        })
        .populate({
          path: 'category',
          select: 'category',
        })
        .populate({
          path: 'tutor',
          select: 'firstName lastName image',
        });

        if(!allCourses.length){
        console.log('agregation');

          allCourses = await courseModel.aggregate([
            { $lookup: {
                from: 'users',
                localField: 'tutor',
                foreignField: '_id',
                as: 'tutorInfo'}
            },{
              $lookup: {
                from: 'categories', 
                localField: 'category', 
                foreignField: '_id', 
                as: 'categoryInfo'
              }
            },
            { $match: {
                $or: [
                  { 'tutorInfo.firstName': { $regex: new RegExp(search, 'i') } },
                  { 'tutorInfo.lastName': { $regex: new RegExp(search, 'i') } },
                ]
              }
            },
            {
              $unwind: '$tutorInfo',
            },
            { $project: {
                title: 1,
                price: 1,
                category: {
                  _id: '$category', 
                  category: '$categoryInfo.category' 
                },
                skillsOffering: 1,
                banner:1,
                is_active:1,
                tutor: {
                  firstName: '$tutorInfo.firstName',
                  lastName: '$tutorInfo.lastName',
                  image: '$tutorInfo.image',
                }
              }
            }
          ])
        }
        return res.status(200).json({ result: allCourses });
      }
    } catch (error) {
        console.log(error);
        res.status(500)
    }
}

const toggleActiveCourse=async(req,res)=>{
    try {
        console.log(req.query);
        const success = await courseModel.updateOne({_id : req.query.id},{$set : {is_active : req.query.toggle}})
        success ? res.status(200) : res.status(500)
        console.log(success);
    } catch (error) {
        res.status(500)
        console.log(error.message);
    }
}

const salesLoad=async(req,res)=>{
    try {
        const filter = req.query.filter;
        let fromDate = req.query.from;
        let toDate = req.query.to;
        const dateQuery = {};
      
        if (fromDate && toDate) {
          dateQuery.date_of_purchase = { $gte: fromDate, $lte: toDate };
        } else {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date();
            tomorrow.setHours(23, 59, 59, 999);
      
          if (filter === 'Daily') {
            dateQuery.date_of_purchase = { $gte: today, $lte: tomorrow };
          } else if (filter === 'Weekly') {
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);
            dateQuery.date_of_purchase = { $gte: lastWeek };
          } else if (filter === 'Monthly') {
            const lastMonth = new Date();
            lastMonth.setMonth(lastMonth.getMonth() - 1);
            dateQuery.date_of_purchase = { $gte: lastMonth };
          }
        }
      
        const salesData = await orderModel
          .find(dateQuery)
          .sort({ date_of_purchase: -1 })
          .populate({
            path: 'course_id',
            select: 'title',
            populate: {
              path: 'tutor',
              select: 'firstName lastName',
            },
          })
          .populate({
            path: 'user_id',
            select: 'name email',
          })
          .exec();
      
        return res.status(200).json({ result: salesData });
      } catch (error) {
        console.error(error.message);
        return res.status(500).json({ error: 'Internal Server Error' });
      }      
}

const dashboardLoad=async(req,res)=>{
    try {
        const amountOnHold = (
          await orderModel
            .find({ is_refundable: true, status: 'success' }, { amount: 1 })
            .exec()
        ).reduce((total, { amount }) => total + amount, 0);
      
        const [recentSales, adminWallet] = await Promise.all([
          orderModel                    
            .find({})
            .sort({ date_of_purchase: -1 })
            .limit(5)
            .populate({ path: 'user_id', select: 'name email' })
            .populate({ path: 'course_id', select: 'title' })
            .exec(),
          userModel.findOne({ email: 'admin@gmail.com' }, { b_wallet_balance: 1 ,b_wallet_transaction:1})
        ]);

        const fetchSalesData = async (dateQuery) => {
            return await orderModel
              .find(dateQuery)
              .sort({ date_of_purchase: -1 })
              .populate({
                path: 'course_id',
                select: 'title',
                populate: {
                  path: 'tutor',
                  select: 'firstName lastName',
                },
              })
              .populate({
                path: 'user_id',
                select: 'name email',
              })
              .exec();
          };
          
          const fetchSalesDataAndCalculateStats = async (dateQuery) => {
            const salesData = await fetchSalesData(dateQuery);
            return {
              count: salesData.length,
              totalAmount: salesData.reduce((total, sale) => total + sale.amount, 0),
            };
          };
          
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          
          const lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          
          const thisYear = new Date();
          thisYear.setMonth(0); 
          thisYear.setDate(1); 
          
          const nextYear = new Date(thisYear);
          nextYear.setFullYear(thisYear.getFullYear() + 1); 
          
          const [todaySales, weekSales, monthSales, yearSales] = await Promise.all([
            fetchSalesDataAndCalculateStats({
              date_of_purchase: { $gte: today, $lt: tomorrow },
              status: { $ne: 'refunded' },
            }),
            fetchSalesDataAndCalculateStats({
              date_of_purchase: { $gte: lastWeek },
              status: { $ne: 'refunded' },
            }),
            fetchSalesDataAndCalculateStats({
              date_of_purchase: { $gte: lastMonth },
              status: { $ne: 'refunded' },
            }),
            fetchSalesDataAndCalculateStats({
              date_of_purchase: { $gte: thisYear, $lt: nextYear },
              status: { $ne: 'refunded' },
            }),
          ]);

          const userCount = await usermodel.countDocuments()
          const courseCount = await courseModel.countDocuments()
          const tutorCount = await userModel.countDocuments({ is_tutor: true })  

          const calculateTotalAmount = async (startDate, endDate) => {
              const aggregationPipeline = [
                {
                  $match: {
                    status: 'success',
                    is_refundable: false,
                    date_of_purchase: {
                      $gte: startDate,
                      $lte: endDate
                    }
                  }
                },
                {
                  $group: {
                    _id: null,
                    totalAmount: {
                      $sum: '$amount'
                    }
                  }
                }
              ];
              const totalAmount = await orderModel.aggregate(aggregationPipeline);
              if (totalAmount.length > 0) {
                return totalAmount[0].totalAmount;
              } else {
                return 0; // Return 0 if there are no orders
              }
          }
          const firstDayOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);

          const weeklyTotalRevenue = await calculateTotalAmount(lastWeek, today)*0.25
          const monthlyTotalRevenue = await calculateTotalAmount(firstDayOfThisMonth, today)*0.25
          const totalRevenue = await calculateTotalAmount(new Date(0), today)*0.25
          
        return res.status(200).json({ 
            result: recentSales, 
            wallet: adminWallet, 
            amountOnHold,
            todaySales,
            weekSales,
            monthSales,
            yearSales,
            userCount,
            courseCount,
            tutorCount,
            weeklyTotalRevenue,
            monthlyTotalRevenue,
            totalRevenue
        });
      } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
  }

  const tutorDetails=async(req,res)=>{
    try {
      const { id } = req.query;
      const courses = await courseModel.find({ tutor: id }, 'title category price banner');
      const sales = await orderModel.find({ course_id: { $in: courses.map(c => c._id) }, is_refundable: 0, status: { $ne: 'refunded' } }).populate({
        path:'course_id',
        select : 'title'
      }).populate({path:'user_id',select : 'email'})
      return res.json({ courses, sales });
    } catch (error) {
      console.log(error);
      res.status(500)
    }
  }


  const loadContactMssg=async(req,res)=>{
    try {
        const data = await contactModel.find({})
        res.status(200).json({result : data})
    } catch (error) {
      console.log(error);
      res.status(500)
    }
  }

const ContactMssgRead=async(req,res)=>{
  try {
    await contactModel.updateOne({_id:req.body.id},{$set:{is_read:true}})
    res.status(200)
  } catch (error) {
    console.log(error);
    res.status(500)
  }
}


module.exports = {
    userDetails,
    updateProfile,
    login,
    tutorReq,
    approveTutor,
    tutorslist,
    toggleBlockTutor,
    addCategory,
    loadCategory,
    updateCategory,
    allCourses,
    toggleActiveCourse,
    rejectTutorReq,
    handleUserBlock,
    salesLoad,
    dashboardLoad,
    tutorDetails,
    loadContactMssg,
    ContactMssgRead
}