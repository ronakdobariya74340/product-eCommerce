const __dirname = path.resolve();
import ejs from "ejs";
import path from "path";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";
import { count } from "console";
import { dateFormatByTimezone, errorResponse, log1, successResponse, uploadImage } from "../lib/general.lib.js";
import messages from "../utils/messages.js";
import Constant from "../config/constant.js";
import { custom_validation } from "../lib/validation.lib.js";
import { sendMail } from "../utils/sendMail.helper.js "
import Setting from "../models/setting.model.js";
import User from "../models/user.models.js";
import Product from "../models/product.model.js";
import ProductCategory from "../models/productCategory.model.js";
import ProductBanner from "../models/productBanner.model.js";
import Giftcard from "../models/giftcard.model.js";
import Ticket from "../models/ticket.model.js";
import UserToken from "../models/userToken.model.js";
import Transaction from "../models/transaction.model.js";

export const getDashboardPage = async (req, res) => {
   try {
      let userPipeline = [
         {
            $group: {
               _id: null,
               totalUser: { $sum: 1 },
               inactive: { $sum: { $cond: [{ $eq: ["$status", Constant.USER_STATUS.INACTIVE] }, 1, 0], },},
               active: { $sum: { $cond: [{ $eq: ["$status", Constant.USER_STATUS.ACTIVE] }, 1, 0], },},
               suspend: { $sum: { $cond: [{ $eq: ["$status", Constant.USER_STATUS.SUSPEND] }, 1, 0], },},
               pending: { $sum: { $cond: [{ $eq: ["$status", Constant.USER_STATUS.PENDING] }, 1, 0], },},
            },
         },
      ];
   
      let [totalProduct, active_product, inActive_product, [userResp]] = await Promise.all([
         Product.countDocuments({}).exec(),
         Product.countDocuments({status: Constant.PRODUCT_STATUS.ACTIVE}).exec(),
         Product.countDocuments({status: Constant.PRODUCT_STATUS.PENDING}).exec(),
         User.aggregate(userPipeline).exec(),
      ]);

      return res.render("dashboard", {
         header: {
            page: "Dashboard",
            admin: req.session.admin,
            title: "Dashboard",
            id: "dashboard",
         },
         body: {
            totalProduct: totalProduct,
            active_product: active_product,
            inActive_product: inActive_product,
            total_users: userResp.totalUser,
            total_active_users: userResp.active,
            total_inactive_users: userResp.inactive,
            total_suspended_users: userResp.suspend,
            total_pending_users: userResp.pending,
            total_order: 0,
            total_complete_order: 0,
            total_pending_order: 0,
            total_return_order: 0,
            total_transactions: 0,
            total_pending_transactions: 0,
         },
         footer: {},
      });
   } catch (error) {
      log1(["Error in getDashboardPage----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const getUserManagementPage = async (req, res) => {
   try {
      return res.render("user-management", {
         header: {
            page: "User Management",
            admin: req.session.admin,
            title: "User Management",
            id: "user-management",
         },
         body: {},
         footer: {
            js: ["user-list.js"],
         },
      });
   } catch (error) {
      log1(["Error in getUserManagementPage----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postUserList = async (req, res) => {
   try {
      const param = req.body;

      const limit = parseInt(param.itemPerPage);
      const skip = (param.currentPage - 1) * limit;

      const pipeline = [
         { $match: {} },
         {
            $facet: {
               result: [
                  { $sort: { created_at: -1 } },
                  { $skip: skip },
                  { $limit: limit },
               ],
               totalCount: [
                  { $count: "count" }
               ],
               stats: [
                  { $lookup: { from: "tickets", localField: "_id", foreignField: "userId", as: "ticketDetails" } },
                  { $unwind: { path: "$ticketDetails", preserveNullAndEmptyArrays: true } },
                  {
                     $group: {
                        _id: "$ticketDetails.userId",
                        totalEntries: { $sum: { $cond: [{ $in: ["$ticketDetails.type", [1, 2, 3]] }, "$ticketDetails.totalEntries", 0] } },
                        totalSpent: { $sum: { $cond: [{ $in: ["$ticketDetails.type", [2, 3]] }, "$ticketDetails.totalCost", 0] } }
                     }
                  }
               ]
            }
         }
      ]

      if (param.email) pipeline[0].$match.email = { $regex: param.email, $options: "i" };
      if (param.status) pipeline[0].$match.status = param.status;
      if (param.google2faStatus === Constant.GOOGLE_2FA_STATUS.ENABLED || param.google2faStatus === Constant.GOOGLE_2FA_STATUS.DISABLED) pipeline[0].$match.google2faStatus = param.google2faStatus;

      const [resp] = await User.aggregate(pipeline)

      resp.result?.forEach(user => {
         const obj = resp.stats?.find(obj => obj._id?.toString() === user?._id?.toString())
         user.totalSpent = obj?.totalSpent || 0
         user.totalEntries = obj?.totalEntries || 0
      })

      let response = successResponse();
      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/user-list.ejs"), {
         body: {
            param,
            userList: resp?.result || [],
            totalUser: resp?.totalCount[0]?.count || 0,
         },
      });

      response["total_record"] = resp?.totalCount[0]?.count || 0;
      response["param"] = param;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postUserList----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const getUserDetails = async (req, res) => {
   try {
      const { userId } = req.params;

      const ticketPipeline = [
         { $match: { userId: new ObjectId(userId) } },   
         { $facet: {
            totalEntries:[ { $match:{ type: Constant.TICKET_TYPE.PAID }}, { $group: { _id: null, totalEntries: { $sum: "$totalEntries" } } },],
            totalSpent:[ { $group: { _id: null, totalSpent: { $sum: "$totalCost" } } },],
            totalPaidPlan:[{ $match:{ type: Constant.TICKET_TYPE.PAID }}, { $group: { _id: null, totalPaidPlan: { $sum: 1 } } },],
            productDetails: [
               { $group: {
                  _id: "$productId",
                  totalSpent: { $sum: { $cond: [{ $in: ["$type", [Constant.TICKET_TYPE.PAID]] }, "$totalCost", 0] } },
                  totalEntries: { $sum: { $cond: [{ $in: ["$type", [Constant.TICKET_TYPE.PAID]] }, "$totalEntries", 0] } },
                  paidPlanPurchased: { $sum: { $cond: [{ $eq: ["$type", Constant.TICKET_TYPE.PAID] }, 1, 0] } },
                  freePlainCount: { $sum: { $cond: [{ $eq: ["$type", Constant.TICKET_TYPE.FREE] }, 1, 0] } }
               }},
               { $lookup: {from: "celebrities", localField: "_id", foreignField: "_id", as: "productDetails"}},
               { $unwind: "$productDetails"},
               { $project: { _id: 1, name: "$productDetails.name", totalSpent: 1, totalEntries: 1, paidPlanPurchased: 1, freePlainCount: 1}}
            ]
         }}
      ]

      const [userDetails,[ticketResp], userTokenResp] = await Promise.all([
         User.findById(userId).select("-__v -password"),
         Ticket.aggregate(ticketPipeline),
         UserToken.find({ userid: userId?.toString() }).sort({ created_at: 1 }).select("created_at")
      ]);

      return res.render("user-details", {
         header: {
            id: "user-details",
            title: "User Details",
            admin: req.session.admin,
         },
         body: {
            user: userDetails,
            userSuspensionHistory: userDetails?.suspensionHistory || [],
            totalEntries: ticketResp?.totalEntries[0]?.totalEntries || 0,
            totalSpent: ticketResp?.totalSpent[0]?.totalSpent || 0,
            totalPaidPlan: ticketResp?.totalPaidPlan[0]?.totalPaidPlan || 0,
            lastLoginDate: userTokenResp[0]?.created_at || null,

            // productDetails 
            productDetails: ticketResp?.productDetails[0]?.productDetails || []
         },
         footer: {
            js: ["user-details.js"],
         }
      });
   } catch (error) {
      log1(["Error in getUserDetails----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const getAllRecord = async (req, res) => {
   try {      
      const productDetails = await Product.find({ status: Constant.PRODUCT_STATUS.ACTIVE });

      return res.render("all-record", {
         header: {
            id: "all-record",
            title: "Cumulative Performance Report",
            admin: req.session.admin || null,
         },
         body: {
            productList: productDetails,
         },
         footer: {
            js: ["all-record.js"],
         }
      });
   } catch (error) {
      log1(["Error in getAllRecord----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const postRecordList = async (req, res) => {
   try {
      let param = req?.body;

      let filters = {
         status: Constant.TICKET_STATUS.SUCCESS,
      };

      if (param?.productId && mongoose.Types.ObjectId.isValid(param.productId)) {
         filters["productId"] = new ObjectId(param.productId);
      };

      if (param.startDate && param.endDate) {
         filters["created_at"] = {
            $gte: new Date(`${param.startDate}T00:00:00.000Z`),
            $lte: new Date(`${param.endDate}T23:59:59.999Z`),
         };
      };

      const totalFreeEntriesResult = await Ticket.aggregate([
         { $match: { ...filters, type: Constant.TICKET_TYPE.FREE } },
         { $group: { _id: null, totalFreeEntries: { $sum: "$totalEntries" } } }
      ]);
      const totalFreeEntries = totalFreeEntriesResult.length > 0 ? totalFreeEntriesResult[0].totalFreeEntries : 0;

      // const totalFreeEntries = await Ticket.countDocuments({
      //    ...filters,
      //    type: Constant.TICKET_TYPE.FREE,
      // });
      const totalPaidEntriesResult = await Ticket.aggregate([
         { $match: { ...filters, type: Constant.TICKET_TYPE.PAID } },
         { $group: { _id: null, totalPaidEntries: { $sum: "$totalEntries" } } }
      ]);
      const paidEntries = totalPaidEntriesResult.length > 0 ? totalPaidEntriesResult[0].totalPaidEntries : 0;
      // const paidEntries = await Ticket.countDocuments({
      //    ...filters,
      //    type: Constant.TICKET_TYPE.PAID,
      // });

      const totalGiftEntriesResult = await Ticket.aggregate([
         { $match: { ...filters, type: Constant.TICKET_TYPE.GIFT } },
         { $group: { _id: null, totalGiftEntries: { $sum: "$totalEntries" } } }
      ]);
      const totalGiftEntries = totalGiftEntriesResult.length > 0 ? totalGiftEntriesResult[0].totalGiftEntries : 0;
      // const totalGiftEntries = await Ticket.countDocuments({
      //    ...filters,
      //    type: Constant.TICKET_TYPE.GIFT,
      // });

      const totalEntriesResult = await Ticket.aggregate([
         { $match: filters },
         { $group: { _id: null, totalEntriesSum: { $sum: "$totalEntries" } } }
      ]);
      const totalEntries = totalEntriesResult.length > 0 ? totalEntriesResult[0].totalEntriesSum : 0;

      const revenueResult = await Ticket.aggregate([
         { $match: filters },
         { $group: { _id: null, totalRevenue: { $sum: "$totalCost" } } }
      ]);

      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

      const userResult = await Ticket.aggregate([
         { $match: filters },
         {
            $group: {
               _id: null,
               userIds: {
                  $addToSet: "$userId",
               },
            },
         },
         {
            $project: {
               _id: 0,
               totalUsers: { $size: "$userIds" },
            },
         },
      ]);
      const totalUsers = userResult[0]?.totalUsers || 0;
      // totalUsers = await User.countDocuments();

      const productAggregation = [
         {
            $match: filters,
         },
         {
            $group: {
               _id: "$productId",
               users: { $addToSet: "$userId", },
               free: {
                  $sum: {
                     $cond: [
                        { $eq: ["$type", Constant.TICKET_TYPE.FREE] }, "$totalEntries", 0
                     ],
                  },
               },
               paid: {
                  $sum: {
                     $cond: [
                        { $eq: ["$type", Constant.TICKET_TYPE.PAID] }, "$totalEntries", 0
                     ],
                  },
               },
               gift: {
                  $sum: {
                     $cond: [
                        { $eq: ["$type", Constant.TICKET_TYPE.GIFT] }, "$totalEntries", 0
                     ],
                  },
               },
               totalEntries: {
                  $sum: "$totalEntries",
               },
               revenue: {
                  $sum: "$totalCost",
               },
            },
         },
         {
            $addFields: {
               usersCount: { $size: "$users" },
               avgPerUser: {
                  $cond: [
                     { $gt: [{ $size: "$users" }, 0] },
                     { $divide: ["$revenue", { $size: "$users" }] },
                     0,
                  ],
               },
            },
         },
         {
            $lookup: {
               from: "celebrities",
               localField: "_id",
               foreignField: "_id",
               as: "product",
            },
         },
         { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
         {
            $project: {
               _id: 0,
               productId: "$_id",
               productName: "$product.name",
               users: "$usersCount",
               free: 1,
               paid: 1,
               gift: 1,
               totalEntries: 1,
               revenue: 1,
               avgPerUser: {
                  $round: ["$avgPerUser", 2],
               },
            },
         },
         { $sort: { productName: 1 } }
      ];

      let celebStats = await Ticket.aggregate(productAggregation);

      const count = celebStats?.length;
      const len = parseInt(param?.itemPerPage);
      const start = (param?.currentPage - 1) * len;
      celebStats = celebStats.slice(start, start + len);

      let response = successResponse();
      response["blade"] = await ejs.renderFile("views/record-filter.ejs", {
         body: {
            param: req.body,
            recordList: celebStats,
            totalRecord: count,
            totalUsers: totalUsers || 0,
            totalFreeEntries: totalFreeEntries || 0,
            paidEntries: paidEntries || 0,
            totalGiftEntries: totalGiftEntries || 0,
            totalEntries: totalEntries || 0,
            totalRevenue: totalRevenue || 0,
         },
      });
      response["total_record"] = count;
      response["param"] = req.body;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postRecordList----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   };
};

export const postEditUser = async (req, res) => {
   try {
      const param = req.body;
   
      const validate = custom_validation(param, "admin.edit_user");
      if (validate.flag !== 1) {
         return res.json(validate);
      }
   
      const findQuery = {
         _id: param.user_id,
      };
      const user = await User.findOne(findQuery);
      if (!user) {
         return res.json(errorResponse("The user you're trying to update was not found."));
      }
   
      const updateQuery = {
         $set: { status: param.status }
      };
   
      // If user is being suspended and a reason is provided
      if (Number(param.status) === Constant.USER_STATUS.SUSPEND && param.reason) {
         updateQuery.$push = {
            suspensionHistory: {
               reason: param.reason,
            }
         };
      }
   
      let response = await User.findOneAndUpdate(findQuery, updateQuery, { new: true });
      
      // send mail logic
      if(Number(response?.status) === Constant.USER_STATUS.SUSPEND && param.reason){

         // suspend user
         const mailFile =  await ejs.renderFile('./views/emails/user_suspend_mail.ejs',{
            suspendDate: dateFormatByTimezone(response?.updated_at),
            reason: param?.reason,
            userName: user?.userName     
        })

        const mailOptions = {
            from: `${process.env.SUPPORT_MAIL}`,
            to: `${user?.email}`,
            subject: "Your MDF Account Has Been Suspended",
            html: mailFile,
        };

        sendMail(mailOptions)
      } else if(Number(response?.status) === Constant.USER_STATUS.ACTIVE && Number(param.status) === Constant.USER_STATUS.ACTIVE){

         // account un suspend
         const mailFile =  await ejs.renderFile('./views/emails/user_unsuspend_mail.ejs',{
            UnsuspendDate: dateFormatByTimezone(response?.updated_at),
            userName: user?.userName     
        })

        const mailOptions = {
            from: `${process.env.SUPPORT_MAIL}`,
            to: `${user?.email}`,
            subject: "Your MDF Account Has Been Reinstated",
            html: mailFile,
        };

        sendMail(mailOptions)
      }
   
      return res.json(successResponse("User updated successfully"));
   } catch (error) {
      log1(["Error in postEditUser----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postDeleteUser = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.delete_user");
      if (validate.flag !== 1) {
         return res.json(validate);
      }

      const findQuery = {
         _id: param.user_id,
      };
      const user = await User.findOne(findQuery);
      if (!user) {
         return res.json(errorResponse("The user you're trying to delete was not found."));
      }

      await User.findOneAndDelete(findQuery);

      return res.json(successResponse("User deleted successfully"));
   } catch (error) {
      log1(["Error in postDeleteUser----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postUserTransactionHistoryFilter = async (req, res) => {
   try {
      const param = req?.body;

      let transactionPipeline = [
         { $match: { userId: new ObjectId(param?.userId) } },
         {
            $facet: {
               result: [
                  { $sort: { created_at: -1 } },
                  { $skip: (param?.currentPage - 1) * param?.itemPerPage },
                  { $limit: param?.itemPerPage },
                  {
                     $lookup: {
                        from: "celebrities",
                        let: { productId: "$productId" },
                        pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$productId"] } } }, { $project: { _id: 1, name: 1 } }],
                        as: "celebrities",
                     },
                  },
                  {
                     $lookup: {
                        from: "giftcards",
                        let: { giftcardIds: "$giftCardId" },
                        pipeline: [
                           {
                              $match: {
                                 $expr: { $in: ["$_id", "$$giftcardIds"] },
                              },
                           },
                           { $project: { _id: 1, totalEntries: 1, fromEmail: 1, toEmail: 1, giftSendStatus: 1, status: 1 } },
                        ],
                        as: "giftcards",
                     },
                  },
                  {
                     $addFields: {
                        ticketStatus: {
                           $cond: {
                              if: { $eq: ["$type", 3] },
                              then: {
                                 $cond: {
                                    if: { $gt: [{ $size: "$giftcards" }, 0] },
                                    then: { $arrayElemAt: ["$giftcards.status", 0] }, // or use custom logic
                                    else: null,
                                 },
                              },
                              else: "$status",
                           },
                        },
                        giftEntries: { $sum: { $map: { input: "$giftcards", as: "g", in: { $ifNull: ["$$g.totalEntries", 0] } } } },
                        userEntries: { $subtract: ["$totalEntries", { $sum: { $map: { input: "$giftcards", as: "g", in: { $ifNull: ["$$g.totalEntries", 0] } } } }] },
                     },
                  },
                  ...(param?.type === Constant.FILTER_TRX_TYPE.GIFT
                     ? [{ $match: { type: Constant.FILTER_TRX_TYPE.GIFT, userEntries: { $eq: 0 } } }]
                     : param?.type === Constant.FILTER_TRX_TYPE.MIXED
                     ? [{ $match: { userEntries: { $gt: 0 }, giftEntries: { $gt: 0 } } }]
                     : []),
                  ...(param?.giftcardStatus
                     ? [{ $match: { ticketStatus: param.giftcardStatus } }]
                     : []),
               ],
               count: [{ $count: "count" }],
            },
         },
      ];

      // filter
      if(param?.type === Constant.FILTER_TRX_TYPE.FREE) transactionPipeline[0].$match.type = Constant.FILTER_TRX_TYPE.FREE;
      if(param?.type === Constant.FILTER_TRX_TYPE.PAID) transactionPipeline[0].$match.type = Constant.FILTER_TRX_TYPE.PAID;
      if(param?.type === Constant.FILTER_TRX_TYPE.GIFT) transactionPipeline[0].$match.type = Constant.FILTER_TRX_TYPE.GIFT;
      if(param?.status) transactionPipeline[0].$match.status = param?.status;
      if(param?.paymentMethod) transactionPipeline[0].$match.paymentMethod = param?.paymentMethod;

      let [transactionResp] = await Ticket.aggregate(transactionPipeline);

      let response = successResponse();

      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/user-transaction-filter.ejs"), {
         body: {
            param: param,
            transactionList: transactionResp.result,
            totalTransaction: transactionResp.count[0]?.count,
         },
      });
      response["total_record"] = transactionResp.count[0]?.count;
      response["param"] = param;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postUserTransactionHistoryFilter----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postUserGiftRedeemHistoryFilter = async (req, res) => {
   try {
      const param = req?.body;

      const userData = await User.findById(param?.userId)

      let filters = {
         toEmail: userData?.email
      };

      const count = await Giftcard.countDocuments(filters);
      const limit = parseInt(param?.itemPerPage);
      const skip = (param?.currentPage - 1) * limit;

      let response = successResponse();
      let result = await Giftcard.find(filters).populate("userId", "userName").skip(skip).limit(limit).sort({ _id: -1 })
      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/user-gift-redeem-filter.ejs"), {
         body: {
            param: param,
            giftRedeemList: result,
            totalTransaction: count,
         },
      });
      response["total_record"] = count;
      response["param"] = param;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postUserGiftRedeemHistoryFilter----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const getSettingsPage = async (req, res) => {
   try {
      const admin = req.session.admin;
      let secret = await Setting.findOne({ name: "login_secret_token" });
      let maintenance = secret ? secret.maintenanceMode : 0;
      secret = secret ? secret.value : "";

      return res.render("settings", {
         header: {
            page: "Settings",
            admin: admin,
            title: "Settings",
            id: "settings",
         },
         body: {
            secret: secret,
            maintenance: maintenance,
         },
         footer: {
            js: ["settings.js"],
         },
      });
   } catch (error) {
      log1(["Error in getSettingsPage----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const getProductManagementPage = async (req, res) => {
   try {
      const productCategory = await ProductCategory.find({ status: Constant.STATUS.ACTIVE }).select("name").sort({ created_at: -1 });

      return res.render("product-management", {
         header: {
            page: "Product",
            admin: req.session.admin,
            title: "Product",
            id: "product",
         },
         body: {
            productCategory: productCategory,
         },
         footer: {
            js: ["product-management.js"],
         },
      });
   } catch (error) {
      log1(["Error in getSettingsPage----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postAddProduct = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.add_product");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      if (!Array.isArray(req.files?.product_image)) req.files.product_image = [req.files?.product_image];
      if (!Array.isArray(req.files?.backgroung_image)) req.files.backgroung_image = [req.files?.backgroung_image];

      // image upload
      const productImageArray = await uploadImage({ file: req.files?.product_image, path: Constant.PRODUCT_UPLOAD_PATH, prefix: "product_image" });
      const backgroundImageArray = await uploadImage({ file: req.files?.backgroung_image, path: Constant.PRODUCT_UPLOAD_PATH, prefix: "backgroung_image" });

      let payload = {
         name: param.name,
         image: productImageArray,
         backgroundImage: backgroundImageArray,
         productCategoryId: new ObjectId(param.productCategoryId),
         productPrice: param.productPrice,
         description: param.description,
         status: parseInt(param.productStatus),
      };
      const createProduct = await Product.create(payload);

      if (!createProduct) return res.json(errorResponse("Failed to add product."));

      return res.json(successResponse("Product added successfully."));
   } catch (error) {
      log1(["Error in postAddProduct----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postProductList = async (req, res) => {
   try {
      const { name } = req.body;
      const query = {};

      if (name) {
         query.name = { $regex: name, $options: "i" };
      }

      const count = await Product.countDocuments(query);
      const limit = parseInt(req.body.itemPerPage);
      const skip = (req.body.currentPage - 1) * limit;

      let productList = await Product.aggregate([
         { $match: query },
         {
            $lookup: {
               from: "productcategories",
               localField: "productCategoryId",
               foreignField: "_id",
               as: "categoryInfo",
            },
         },
         { $unwind: { path: "$categoryInfo", preserveNullAndEmptyArrays: true } },
         { $sort: { _id: -1 } },
         { $skip: skip },
         { $limit: limit },
      ]);

      let response = successResponse();
      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/product-list.ejs"), {
         body: {
            param: req.body,
            product: productList,
            totalProduct: count,
         },
      });
      response["total_record"] = count;
      response["param"] = req.body;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postProductList----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postProductDetails = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.product_details");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      let productDetails = await Product.findById(param.productId).select("-__v");
      if (!productDetails) {
         return res.json(errorResponse("Product not found."));
      };

      return res.status(200).json(successResponse("Product details fetched successfully.", productDetails));
   } catch (error) {
      log1(["Error in postProductDetails----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postUpdateProduct = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.edit_product");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      let productDetails = await Product.findById(param.product_id).select("-__v");
      if (!productDetails) {
         return res.json(errorResponse("Product not found."));
      };

      if (!req.files?.product_image) return res.json(errorResponse("Please upload product image."));
      if (!req.files?.backgroung_image) return res.json(errorResponse("Please upload backgroung image."));

      if (!Array.isArray(req.files?.product_image)) req.files.product_image = [req.files?.product_image];
      if (!Array.isArray(req.files?.backgroung_image)) req.files.backgroung_image = [req.files?.backgroung_image];

      // Product Image File Validation
      let existingImage = [];
      req.files.product_image = req.files?.product_image?.filter((file) => {
         if (!file.mimetype.startsWith("image/")) return res.json(errorResponse("Invalid file type. Please upload an image."));
         if (file.size > Constant.MAX_FILE_SIZE) return res.json(errorResponse(`File size exceeds the limit of ${Constant.MAX_FILE_SIZE / 1024 / 1024} MB.`));

         const isExisting = JSON.parse(param.metadata).some(metaName => file.name.endsWith(metaName));

         if (isExisting && !existingImage.includes(file.name)) {
            existingImage.push(file.name);
            return false
         }
         return true;
      });

      // Background Image File Validation
      let existingBgImage = [];
      req.files.backgroung_image = req.files?.backgroung_image?.filter((file) => {
         if (!file.mimetype.startsWith("image/")) return res.json(errorResponse("Invalid file type. Please upload an image."));
         if (file.size > Constant.MAX_FILE_SIZE) return res.json(errorResponse(`File size exceeds the limit of ${Constant.MAX_FILE_SIZE / 1024 / 1024} MB.`));

         const isExisting = JSON.parse(param.bgImgMetadata).some((metaName) => file.name.endsWith(metaName));

         if (isExisting && !existingBgImage.includes(file.name)) {
            existingBgImage.push(file.name);
            return false
         }
         return true;
      });

      const productImageArray = await uploadImage({ file: req.files?.product_image, path: Constant.PRODUCT_UPLOAD_PATH, prefix: "product_Image" });
      const backgroundImageArray = await uploadImage({ file: req.files?.backgroung_image, path: Constant.PRODUCT_UPLOAD_PATH, prefix: "backgroung_image" });

      let newProfileImage = [...existingImage, ...productImageArray];
      let newBackgroundImage = [...existingBgImage, ...backgroundImageArray];

      let payload = {
         name: param.name,
         image: newProfileImage,
         backgroundImage: newBackgroundImage,
         productCategoryId: new ObjectId(param.productCategoryId),
         productPrice: Number(param.productPrice),
         description: param.description,
         status: parseInt(param.productStatus),
      };

      const updateProduct = await Product.updateOne({ _id: productDetails._id }, payload, { new: true });
      if (!updateProduct) {
         return res.json(errorResponse("Failed to update product."));
      };

      return res.json(successResponse("Product updated successfully."));
   } catch (error) {
      log1(["Error in postUpdateProduct----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   };
};

export const deleteProduct = async (req, res) => {
   try {
      const response = await Product.findOneAndDelete({ _id: req.body.product_id });
      if (!response) {
         return res.json(errorResponse("Product not found."));
      }
      return res.json(successResponse("Product deleted successfully."));
   } catch (error) {
      log1(["Error in deleteProduct----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const getProductCategory = async (req, res) => {
   try {
      return res.render("product-category", {
         header: {
            page: "Product Category",
            admin: req.session.admin,
            title: "Product Category",
            id: "productCategory",
         },
         body: {},
         footer: {
            js: ["productCategory.js"],
         },
      });
   } catch (error) {
      log1(["Error in getProductCategory----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const getProductBanner = async (req, res) => {
   try {
      return res.render("product-banner", {
         header: {
            page: "Product Banner",
            admin: req.session.admin,
            title: "Product Banner",
            id: "productBanner",
         },
         body: {},
         footer: {
            js: ["productBanner.js"],
         },
      });
   } catch (error) {
      log1(["Error in getProductBanner----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const postAddProductCategory = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.add_product_category");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      const existing = await ProductCategory.findOne({ name: param.name });
      if (existing) return res.json(errorResponse('Product Category already exists'));

      let payload = {
         name: param.name,
         status: parseInt(param.status),
      };

      const productCategoryCreate = await ProductCategory.create(payload);
      if (!productCategoryCreate) return res.json(errorResponse('Failed to create Product Category'));

      return res.json(successResponse("Product Category added successfully"));
   } catch (error) {
      log1(["Error in postAddProductCategory----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const postProductCategoryList = async (req, res) => {
   try {
      const { name, status } = req.body;
      const query = {};

      if (name) {
         query.name = { $regex: name, $options: "i" };
      };

      const parsedStatus = parseInt(status);
      if (!isNaN(parsedStatus) && [Constant.PRODUCT_CATEGORY_STATUS.ACTIVE, Constant.PRODUCT_CATEGORY_STATUS.INACTIVE].includes(parsedStatus)) {
         query.status = parsedStatus;
      };

      const count = await ProductCategory.countDocuments(query);
      const limit = parseInt(req.body.itemPerPage);
      const skip = (req.body.currentPage - 1) * limit;

      let productCategoryList = await ProductCategory.find(query).skip(skip).limit(limit).sort({ created_at: -1 });

      let response = successResponse();
      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/product-category-list.ejs"), {
         body: {
            param: req.body,
            productCategoryList: productCategoryList,
            totalProductCategory: count,
         },
      });
      response["total_record"] = count;
      response["param"] = req.body;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postProductCategoryList----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const postProductCategoryDetails = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.product_category_details");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      let productCategoryDetails = await ProductCategory.findById(param.productCategoryId).select("-__v");
      if (!productCategoryDetails) {
         return res.json(errorResponse("Product Category not found."));
      };

      return res.status(200).json(successResponse("Product Category details fetched successfully.", productCategoryDetails));
   } catch (error) {
      log1(["Error in postProductCategoryDetails----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postUpdateProductCategory = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.edit_product_category");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      let productCategoryDetails = await ProductCategory.findById(param.productCategoryId).select("-__v");
      if (!productCategoryDetails) {
         return res.json(errorResponse("Product Category not found."));
      };

      const memebershipNameExist = await ProductCategory.findOne({ _id: { $ne: productCategoryDetails._id }, name: param.name });
      if (memebershipNameExist) return res.json(errorResponse("Product Category name already exists."));

      let payload = {
         name: param.name,
         status: parseInt(param.status),
      };

      const updateProductCategory = await ProductCategory.updateOne({ _id: productCategoryDetails._id }, payload, { new: true });
      if (!updateProductCategory) return res.json(errorResponse("Failed to update product category."));

      return res.json(successResponse("Product Category updated successfully"));
   } catch (error) {
      log1(["Error in postUpdateProductCategory----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const deleteProductCategory = async (req, res) => {
   try {
      const { productCategoryId } = req.body;
      if (!productCategoryId) return res.json(errorResponse("Please provide Product Category Id."));

      const plan = await ProductCategory.findOneAndDelete({ _id: productCategoryId });
      if (!plan) return res.json(errorResponse(messages.unexpectedDataError));

      return res.json(successResponse("Product Category deleted successfully", { plan }));
   } catch (error) {
      log1(["Error in deleteProductCategory----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const getTransactionManagement = async (req, res) => {
   try {
      // get all the use list
      const userList = await User.find({ status: Constant.USER_STATUS["ACTIVE"] }).select("userName").sort({ created_at: -1 });
      const productCategory = await ProductCategory.find({status: Constant.STATUS.ACTIVE }).select("name").sort({created_at: -1})
      const product = await Product.find({status: Constant.USER_STATUS.ACTIVE }).select("name").sort({created_at: -1})
      
      return res.render("transaction-management", {
         header: {
            page: "Transaction",
            admin: req.session.admin,
            title: "Global History",
            id: "transaction",
         },
         body: {
            userList: userList,
            productCategory: productCategory,
            product: product
         },
         footer: {
            js: ["transaction-management.js"],
         },
      });
   } catch (error) {
      log1(["Error in getTransactionManagement----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postTransactionList = async (req, res) => {
   try {
      const { userId, amount, isgreaterthan, status, productId, productCategoryId } = req.body;

      const limit = parseInt(req.body.itemPerPage);
      const skip = (req.body.currentPage - 1) * limit;

      const pipeline = [
         { $match: {} },
         {
            $facet: {
               result: [
                  { $sort: { created_at: -1 } },
                  { $skip: skip },
                  { $limit: limit },
                  { $lookup: {
                     from: "celebrities",
                     let: { productId: "$productId" },
                     pipeline: [{ $match: {  $expr: { $eq: ["$_id", "$$productId"] }} }, {$project: {  _id: 1,  name: 1} }],
                     as: "productDetails"
                     }
                  },
                  { $lookup: {
                     from: "productCategorys",
                     let: { productCategoryIds: "$productCategoryId" },
                     pipeline: [{ $match: { $expr: { $cond: { if: { $isArray: "$$productCategoryIds" }, then: { $in: ["$_id", "$$productCategoryIds"] }, else: { $eq: ["$_id", "$$productCategoryIds"] }  }}  }},
                        { $project: { _id: 1, name: 1 }}
                     ],
                     as: "productCategoryDetails"
                     }
                  },
                  { $lookup: {
                     from: "users",
                     let: { userId: "$userId" },
                     pipeline: [{ $match: { $expr: { $eq: ["$_id", "$$userId"] } }},{ $project: { _id: 1, userName: 1 }}],
                     as: "userDetails"
                     }
                  },
                  { 
                     $project:{
                        _id:1,
                        paymentId:1,
                        type: 1,
                        totalEntries: 1,
                        totalCost: 1,
                        paymentMethod: 1  ,
                        status: 1,
                        created_at: 1,
                        userDetails: { $arrayElemAt: ["$userDetails", 0] },
                        productDetails: { $arrayElemAt: ["$productDetails", 0] },
                        productCategoryDetails:"$productCategoryDetails",   
                        description: 1
                     }
                  }
               ],
               totalCount: [
                  { $count: "count" }
               ]
            }
         }
      ];

      // filters
      if (userId && userId !== "") pipeline[0].$match.userId = new ObjectId(userId)
      if (amount && amount !== "") pipeline[0].$match.totalCost = isgreaterthan ? { $gte: parseFloat(amount) } : { $lte: parseFloat(amount) };
      if (status && status !== "") pipeline[0].$match.status = status
      if (productId && productId !== "") pipeline[0].$match.productId = new ObjectId(productId)
      if (productCategoryId && productCategoryId !== "") pipeline[0].$match.productCategoryId = new ObjectId(productCategoryId)

      const [data] = await Ticket.aggregate(pipeline);

      let response = successResponse();
      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/trasnsaction-list.ejs"), {
         body: {
            param: req.body,
            transactionList: data?.result,
            totalTransaction: data?.totalCount[0]?.count,
         },
      });
      response["total_record"] = data?.totalCount[0]?.count;
      response["param"] = req.body;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postTransactionList----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

// get product details page
export const getProductDetailsPage = async (req, res) => {
   try {
      let productId = req.params["id"];

      if(!productId){
         return res.redirect("/admin/product-management");
      };

      let productDetails = await Product.findById(productId).select("-__v");
      if (!productDetails) {
         return res.redirect("/admin/product-management");
      };

      return res.render("product-details", {
         header: {
            page: "Product Details",
            admin: req.session.admin,
            title: "Product Details",
            id: "productDetails",
         },
         body: {
            product: productDetails,
         },
         footer: {
            js: ["productDetails.js"],
         },
      });
   } catch (error) {
      log1(["Error in getTransactionManagement----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postProductWiseTransactionList = async (req, res) => {
   try {
      const { productId } = req.body;
      const query = {
         productId: new ObjectId(productId),
      };

      const count = await Product.countDocuments(query);
      const limit = parseInt(req.body.itemPerPage);
      const skip = (req.body.currentPage - 1) * limit;

      let productTrxList = await Transaction.aggregate([
         { $match: query },
         {
            $lookup: {
               from: "users",
               localField: "userId",
               foreignField: "_id",
               as: "userDetails",
            },
         },
         { $unwind: { path: "$userDetails", preserveNullAndEmptyArrays: true } },
         {
            $lookup: {
               from: "products",
               localField: "productId",
               foreignField: "_id",
               as: "productDetails",
            },
         },
         { $unwind: { path: "$productDetails", preserveNullAndEmptyArrays: true } },
         { $sort: { _id: -1 } },
         { $skip: skip },
         { $limit: limit },
      ]);

      let response = successResponse();
      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/product-transaction-list.ejs"), {
         body: {
            param: req.body,
            transaction: productTrxList,
            totalTransaction: count,
         },
      });
      response["total_record"] = count;
      response["param"] = req.body;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postProductWiseTransactionList----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postMyEntries = async (req, res) => {
   try {
      const param = req.body;
      const trxPipeline = [
         { $match: { userId: new ObjectId(param.userId) } },
         {
           $facet: {
             result: [
               { $sort: { created_at: -1 } },
               { $skip: (param?.currentPage - 1) * param?.itemPerPage },
               { $limit: param?.itemPerPage },
               {
                 $lookup: {
                   from: "giftcards",
                   let: { giftcardIds: "$giftcardId" },
                   pipeline: [
                     {
                       $match: {
                         $expr: {
                           $in: ["$_id", { $ifNull: ["$$giftcardIds", []] }]
                         }
                       }
                     },
                     { $project: { _id: 1, status: 1, totalEntries: 1 } }
                   ],
                   as: "giftcards"
                 }
               },
               {
                 $lookup: {
                   from: "celebrities",
                   let: { productId: "$productId" },
                   pipeline: [
                     { $match: { $expr: { $eq: ["$_id", "$$productId"] } } },
                     { $project: { _id: 1, name: 1 } }
                   ],
                   as: "celebrities"
                 }
               },
               { $unwind: { path: "$celebrities", preserveNullAndEmptyArrays: true } },
               {
                 $addFields: {
                   giftEntries: {
                     $sum: {
                       $map: {
                         input: "$giftcards",
                         as: "g",
                         in: { $ifNull: ["$$g.totalEntries", 0] }
                       }
                     }
                   }
                 }
               },
               {
                 $addFields: {
                   userEntries: { $subtract: ["$totalEntries", "$giftEntries"] },
                   ticketStatus: {
                     $cond: {
                       if: { $eq: ["$type", 3] },
                       then: { $arrayElemAt: ["$giftcards.status", 0] },
                       else: "$status"
                     }
                   }
                 }
               },
             ],
             count: [{ $count: "count" }]
           }
         }
       ];
       

      const [resp] = await Ticket.aggregate(trxPipeline);

      let response = successResponse();
      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/user-entries.ejs"), {
         body: {
            param: param,
            myEntries: resp.result || [],
            totalTransaction: resp.count[0]?.count
         },
      });
      response["total_record"] = count
      response["param"] = param;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postMyEntries----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const postAddProductBanner = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.add_product_banner");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      const existing = await ProductBanner.findOne({ name: param.name });
      if (existing) return res.json(errorResponse('Banner already exists'));

      if (!Array.isArray(req.files?.banner_image)) req.files.banner_image = [req.files?.banner_image];

      // image upload
      const bannerImageArray = await uploadImage({ file: req.files?.banner_image, path: Constant.BANNER_UPLOAD_PATH, prefix: "banner_image" });

      let payload = {
         name: param.name,
         image: bannerImageArray,
         status: parseInt(param.status),
      };

      const productBannerCreate = await ProductBanner.create(payload);
      if (!productBannerCreate) return res.json(errorResponse('Failed to create Product Banner'));

      return res.json(successResponse("Product Banner added successfully"));
   } catch (error) {
      log1(["Error in postAddProductBanner----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const postProductBannerList = async (req, res) => {
   try {
      const { name, status } = req.body;
      const query = {};

      if (name) {
         query.name = { $regex: name, $options: "i" };
      };

      const parsedStatus = parseInt(status);
      if (!isNaN(parsedStatus) && [Constant.PRODUCT_BANNER_STATUS.ACTIVE, Constant.PRODUCT_BANNER_STATUS.INACTIVE].includes(parsedStatus)) {
         query.status = parsedStatus;
      };

      const count = await ProductBanner.countDocuments(query);
      const limit = parseInt(req.body.itemPerPage);
      const skip = (req.body.currentPage - 1) * limit;

      let productBannerList = await ProductBanner.find(query).skip(skip).limit(limit).sort({ created_at: -1 });

      let response = successResponse();
      response["blade"] = await ejs.renderFile(path.resolve(__dirname, "views/product-banner-list.ejs"), {
         body: {
            param: req.body,
            productBannerList: productBannerList,
            totalProductBanner: count,
         },
      });
      response["total_record"] = count;
      response["param"] = req.body;

      return res.status(200).json(response);
   } catch (error) {
      log1(["Error in postProductBannerList----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const postProductBannerDetails = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.product_banner_details");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      let productBannerDetails = await ProductBanner.findById(param.productBannerId).select("-__v");
      if (!productBannerDetails) {
         return res.json(errorResponse("Product Banner not found."));
      };

      return res.status(200).json(successResponse("Product Banner details fetched successfully.", productBannerDetails));
   } catch (error) {
      log1(["Error in postProductBannerDetails----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
};

export const postUpdateProductBanner = async (req, res) => {
   try {
      const param = req.body;

      const validate = custom_validation(param, "admin.edit_product_banner");
      if (validate.flag !== 1) {
         return res.json(validate);
      };

      let productBannerDetails = await ProductBanner.findById(param.productBannerId).select("-__v");
      if (!productBannerDetails) {
         return res.json(errorResponse("Product Banner not found."));
      };

      const memebershipNameExist = await ProductBanner.findOne({ _id: { $ne: productBannerDetails._id }, name: param.name });
      if (memebershipNameExist) return res.json(errorResponse("Product Banner name already exists."));

      if (!req.files?.banner_image) return res.json(errorResponse("Please upload banner image."));

      if (!Array.isArray(req.files?.banner_image)) req.files.banner_image = [req.files?.banner_image];

      let existingImage = [];
      req.files.banner_image = req.files?.banner_image?.filter((file) => {
         if (!file.mimetype.startsWith("image/")) return res.json(errorResponse("Invalid file type. Please upload an image."));
         if (file.size > Constant.MAX_FILE_SIZE) return res.json(errorResponse(`File size exceeds the limit of ${Constant.MAX_FILE_SIZE / 1024 / 1024} MB.`));

         const isExisting = JSON.parse(param.metadata).some(metaName => file.name.endsWith(metaName));

         if (isExisting && !existingImage.includes(file.name)) {
            existingImage.push(file.name);
            return false
         };
         return true;
      });

      const bannerImageArray = await uploadImage({ file: req.files?.banner_image, path: Constant.BANNER_UPLOAD_PATH, prefix: "banner_image" });

      let newBannerImage = [...existingImage, ...bannerImageArray];

      let payload = {
         name: param.name,
         image: newBannerImage,
         status: parseInt(param.status),
      };

      const updateProductBanner = await ProductBanner.updateOne({ _id: productBannerDetails._id }, payload, { new: true });
      if (!updateProductBanner) return res.json(errorResponse("Failed to update product Banner."));

      return res.json(successResponse("Product Banner updated successfully"));
   } catch (error) {
      log1(["Error in postUpdateProductBanner----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}

export const deleteProductBanner = async (req, res) => {
   try {
      const { productBannerId } = req.body;
      if (!productBannerId) return res.json(errorResponse("Please provide Product Banner Id."));

      const plan = await ProductBanner.findOneAndDelete({ _id: productBannerId });
      if (!plan) return res.json(errorResponse(messages.unexpectedDataError));

      return res.json(successResponse("Product Banner deleted successfully", { plan }));
   } catch (error) {
      log1(["Error in deleteProductBanner----->", error]);
      return res.json(errorResponse(messages.unexpectedDataError));
   }
}