import ejs from "ejs";
import bcrypt from "bcrypt";
import twofactor from "node-2fa";
import messages from "../utils/messages.js";
import constant from "../config/constant.js";
import country from "../config/countries.js"
import { custom_validation } from "../lib/validation.lib.js";
import { errorResponse, successResponse, log1, ObjectId, generateRandomCode, dateFormatByTimezone, formatDeviceAndIp } from "../lib/general.lib.js";
import { getCartFromCookies, setCartCookie } from "../utils/cookieHelpers.js";
import { sendMail } from "../utils/sendMail.helper.js";
import { paypalPayment, stripePayment } from "./payment.controller.js";
import { syncCartToDB } from "./auth.controller.js";
import User from "../models/user.models.js";
import Celebrity from "../models/celebrity.model.js";
import Membership from "../models/membership.model.js";
import UserToken from "../models/userToken.model.js";
import Giftcard from "../models/giftcard.model.js";
import Ticket from "../models/ticket.model.js";
import TempPaymentData from "../models/tempPaymentData.model.js";
import Cart from "../models/cart.model.js";
import { UAParser } from "ua-parser-js";
import ResetPasswordToken from "../models/resetPasswordToken.model.js";
import crypto from "crypto";


export const getHomePage = async (req, res) => {
    try {
        let userDetails;
        if (req.session?.user) {
            let userId = req.session?.user._id;
            userDetails = await User.findById(userId).select("-password -updated_at -updatedAt -__v");
        };

        return res.render("home", {
            header: {
                title: "Home",
                user: userDetails || null,
            },
            body: {},
            footer: {
                js: "",
            },
        });
    } catch (error) {
        log1(["Error in getHomePage ----->", error]);
        return res.status(400).json(errorResponse(messages.unexpectedDataError));
    }
}

export const getProductDetails = async (req, res) => {
    try {
        let param = req.params;
        let productId = param["id"];
        if(!productId){
            return res.redirect("/");
        };

        let userDetails;

        if (req.session?.user) {
            let userId = req.session?.user._id;
            userDetails = await User.findById(userId).select("-password -updated_at -updatedAt -__v");
        };

        return res.render("product-details", {
            header: {
                title: "Product Details",
                user: userDetails || null,
            },
            body: {
                product: [],
            },
            footer: {
                js: "product-details.js",
            },
        });
    } catch (error) {
        log1(["Error in getProductDetails----->", error]);
        return res.status(400).json(errorResponse(messages.unexpectedDataError));
    };
};

export const getProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const userDetails = await User.findById(userId).select("-password -updated_at -updatedAt -__v");
        const countryList = country?.map(item => item.name) || []

        const response = successResponse()
        response['blade'] = await ejs.renderFile("./views/users/profile.ejs", {
            header: {
                page: "Profile",
                user: userDetails,
                title: "Profile",
                id: "profile",
            },
            body: {
                user: userDetails,
                countries: countryList,
            },
            footer: {
                js: "profile.js"
            },
        });

        return res.json(response);
    } catch (error) {
        log1(["Error in getProfile----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};

export const getReedemGiftPage = async (req, res) => {
    try {
        const userId = req.userId;
        const userDetails = await User.findById(userId).select("-password -updated_at -updatedAt -__v");
        if (!userDetails) return res.json(errorResponse(messages.userNotFound));

        // filter giftcard by userId
        const result = await Giftcard.aggregate([
            {
                $match: {
                    toEmail: userDetails.email,
                    status: constant.GIFT_CARD_STATUS.REDEEMED
                }
            },
            { $lookup: { from: "memberships", localField: "membershipId", foreignField: "_id", as: "membershipDetails" } },
            { $unwind: { path: "$membershipDetails", preserveNullAndEmptyArrays: true } },
            {
                $group: {
                    _id: null,
                    totalEntries: {
                        $sum: {
                            $add: { $ifNull: ["$membershipDetails.membershipEntries", 0] },
                        }
                    },
                    totalValue: { $sum: { $ifNull: ["$amount", 0] } },
                    celebritySet: { $addToSet: "$celebrityId" },
                    redeemCount: { $sum: 1 }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalEntries: 1,
                    totalValue: 1,
                    redeemCount: 1,
                    totalCelebrity: { $size: "$celebritySet" }
                }
            }
        ]);

        const stats = result[0] || {
            totalEntries: 0,
            totalValue: 0,
            redeemCount: 0,
            totalCelebrity: 0
        };

        return res.render("users/redeem-gift", {
            header: {
                page: "Reedem Gift",
                user: userDetails,
                title: "Reedem Gift",
                id: "reedem-gift",
            },
            body: {
                user: userDetails,
                redeemCount: stats.redeemCount,
                totalValue: stats.totalValue,
                totalEntries: stats.totalEntries,
                totalCelebrity: stats.totalCelebrity,
            },
            footer: {
                js: "redeem-giftcard.js"
            },
        });

    } catch (error) {
        log1(["Error in getReedemGiftPage----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
}


export const getCart = async (req, res) => {
    try {
        const cartData = await getCartFromCookies(req);

        const userDetails = req.session?.user ? await User.findById(req.session?.user?._id).select('-password -__v') : null;

        let cartDetails = [];
        if (cartData.length > 0) {
            const celebIds = cartData.map(c => c.celebrityId);
            const memberIds = cartData.flatMap(c => c.membershipList.map(m => m.membershipId));

            const [celebrities, memberships] = await Promise.all([
                Celebrity.find({ _id: { $in: celebIds } }).select('-__v'),
                Membership.find({ _id: { $in: memberIds } }).select('-__v'),
            ]);

            cartDetails = cartData.map(cItem => {
                const celeb = celebrities.find(c => c._id.toString() === cItem.celebrityId);
                const membershipList = cItem.membershipList.map(mItem => {
                    const membershipDetail = memberships.find(x => x._id.toString() === mItem.membershipId);
                    return {
                        ...membershipDetail.toObject(),
                        totalQuantity: parseInt(mItem.totalQuantity),
                        isSendGift: mItem.isSendGift,
                        totalPriceByQuantity: parseInt(mItem.totalQuantity) * parseFloat(membershipDetail.price),
                        totalEntries: parseInt(membershipDetail.membershipEntries * mItem.totalQuantity),
                    };
                });
                return { celebrity: celeb, membershipList };
            });
        };

        let totalCelebrities = cartDetails.length;
        let totalSubAmount = 0;
        let totalGiftCount = 0;
        let totalQtyCount = 0;

        cartDetails.forEach((cItem) => {
            cItem.membershipList.forEach((m) => {
                totalSubAmount += m.totalPriceByQuantity;
                totalQtyCount += m.totalQuantity;
                if (String(m.isSendGift) === 'true'){
                    totalGiftCount++;
                };
            });
        });

        const allMembershipGift = cartDetails.every(item => 
            item.membershipList.every((membership) => String(membership.isSendGift) === 'true')
        );

        let totalAmount = totalSubAmount;

        // ----------- Pack Limit Checking Logic Starts Here ------------
        let packLimitData = [];
        if (userDetails && userDetails?.packLimit?.length > 0) {
            cartDetails.forEach((cartItem) => {
                const userCelebrityPack = userDetails.packLimit.find(
                    u => u.celebrityId.toString() === cartItem.celebrity._id.toString()
                );

                cartItem.membershipList.forEach((mem) => {
                    const membershipId = mem._id.toString();
                    const cartQty = mem.totalQuantity;
                    const cartEntries = mem.totalEntries;
                    const maxAllowedPack = mem.userPackPurchaseLimit;
                    const maxAllowedEntries = mem.userPackEntryLimit;

                    const existingPack = userCelebrityPack?.packList?.find(
                        p => p.membershipId.toString() === membershipId
                    );

                    const userPackPurchase = existingPack?.totalPackPurchase || 0;
                    const userEntries = existingPack?.totalEntries || 0;

                    const totalPackPurchaseAfterCart = userPackPurchase + cartQty;
                    const totalEntriesAfterCart = userEntries + cartEntries;

                    const isPackOverLimit = totalPackPurchaseAfterCart > maxAllowedPack;
                    const isEntryOverLimit = totalEntriesAfterCart > maxAllowedEntries;

                    if (isPackOverLimit || isEntryOverLimit) {
                        packLimitData.push({
                            celebrityId: cartItem.celebrity._id,
                            celebrityName: cartItem.celebrity.name,
                            membershipId: membershipId,
                            membershipTitle: mem.name,
                            currentPackPurchase: userPackPurchase,
                            currentEntryCount: userEntries,
                            cartQuantity: cartQty,
                            cartEntries: cartEntries,
                            totalPackPurchaseAfterCart,
                            totalEntriesAfterCart,
                            allowedPackLimit: maxAllowedPack,
                            allowedEntryLimit: maxAllowedEntries,
                            isPackOverLimit,
                            isEntryOverLimit,
                        });
                    };
                });
            });
        };

        const isAnyLimitExceeded = packLimitData.length > 0;
        // ----------- Pack Limit Checking Logic Ends Here ------------

        return res.render("users/cart", {
            header: {
                page: "Cart",
                user: userDetails,
                title: "Cart",
                id: "cart",
            },
            body: {
                cartDetails: cartDetails,
                totalCelebrities, 
                totalSubAmount, 
                totalAmount, 
                totalGiftCount, 
                totalQtyCount,
                allMembershipGift,
                packLimitDetails: packLimitData,
                limitPackExceeded: isAnyLimitExceeded,
            },
            footer: {
                js: "cart.js"
            },
        });
    } catch (error) {
        log1(["Error in getCart----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};

// export const getHowItWorksPage = async (req, res) =>{
//     try {
//         const userDetails = req.session?.user ? await User.findById(req.session?.user?._id).select('-password -__v') : null;
//         return res.render("how-it-works", {
//             header: {
//                 page: "How it works",
//                 title: "How It Works",
//                 id: "how-it-works",
//                 user: userDetails,
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getHowItWorks----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// }

// about page
// export const getAboutPage = async (req, res) =>{
//     try {
//         const userDetails = req.session?.user ? await User.findById(req.session?.user?._id).select('-password -__v') : null;
//         return res.render("about-us", {
//             header: {
//                 page: "About-us",
//                 title: "About-us",
//                 id: "about-us",
//                 user: userDetails,
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getAboutUsPage----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// }

// export const getPrivacyPolicy = async (req, res) => {
//     try {
//         const userDetails = req.session?.user ? await User.findById(req.session?.user?._id).select('-password -__v') : null;
//         return res.render("users/privacy-policy", {
//             header: {
//                 page: "Privacy Policy",
//                 title: "Privacy Policy",
//                 id: "privacy-policy",
//                 user: userDetails,
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getPrivacyPolicy----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getTermsCondition = async (req, res) => {
//     try {
//         const userDetails = req.session?.user ? await User.findById(req.session?.user?._id).select('-password -__v') : null;
//         return res.render("users/terms-condition", {
//             header: {
//                 page: "terms-condition",
//                 title: "Terms And Condition",
//                 id: "terms-condition",
//                 user: userDetails,
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getTermsCondition----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getFAQ = async (req, res) => {
//     try {
//         const userDetails = req.session?.user ? await User.findById(req.session?.user?._id).select('-password -__v') : null;
//         return res.render("users/faq", {
//             header: {
//                 page: "FAQ",
//                 title: "FAQ",
//                 id: "faq",
//                 user: userDetails,
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getFAQ----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

// export const getContact = async (req, res) => {
//     try {
//         const userDetails = req.session?.user ? await User.findById(req.session?.user?._id).select('-password -__v') : null;
//         return res.render("users/contact", {
//             header: {
//                 page: "Contact",
//                 title: "Contact",
//                 id: "contact",
//                 user: userDetails,
//             },
//             body: {},
//             footer: {},
//         });
//     } catch (error) {
//         log1(["Error in getContact----->", error]);
//         return res.json(errorResponse(messages.unexpectedDataError));
//     }
// };

export const getmaintenanceMode = async (req, res) => {
    try {
        return res.render("users/maintenance", {
            header: {
                page: "maintenance",
                title: "maintenance",
                id: "maintenance",
            },
            body: {},
            footer: {
                js: ""
            },
        });
    } catch (error) {
        log1(["Error in getmaintenanceMode----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
};

export const postLogOut = async (req, res) => {
    try {
        const token = req.session.token

        const response = await UserToken.deleteOne({token: token})
        if(!response) return res.json(errorResponse("Failed to logout"))
        
        await syncCartToDB(req);
        
        req.session.destroy();

        res.clearCookie("celebrityCart", { path: "/" });
        res.clearCookie("user_id", { path: "/" });

        return res.json(successResponse("Logout successfully."));
    } catch (error) {
        log1(["postLogOut Error----->", error.message]);
        return res.json(errorResponse(messages.unexpectedDataError));
    };
};

export const postAddMakePayment = async (req, res) => {
    try {
        const userId = req.userId;
        const param = req.body;

        const validate = custom_validation(param, "user.makePayment");
        if (validate.flag !== 1) {
            return res.json(validate);
        };

        const userData = await User.findOne({_id: userId}).select("email")

        let totalPayAmount = parseFloat(param?.totalPaymentAmount);
        log1(["postAddMakePayment totalPayAmount---------->", totalPayAmount]);

        let paymentChargeResponse;
        let responsePayMessage = "Your payment has been successfully processed!";
        let successUrl = process.env.SERVER_URL + "/payment-success";
        let cancelUrl = process.env.SERVER_URL + "/payment-cancel";

        if (parseInt(param?.paymentMethod) === constant.PAYMENT_METHOD.STRIPE) {
            log1(["Make a payment for stripe method ----->"]);
            const stripePymentData = {
                payment_method_types: ["card"],
                amount: totalPayAmount * 100,
                currency: constant.CURRENCY_CODE,
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: {
                    userId: String(userId),
                },
            };
            log1(["postAddMakePayment stripePymentData---------->", stripePymentData]);

            paymentChargeResponse = await stripePayment(stripePymentData);
            log1(["postAddMakePayment paymentChargeResponse stripe---------->", paymentChargeResponse]);
        } else {
            log1(["Make a payment for paypal method ----->"]);
            const payPalRequestData = {
                amount: totalPayAmount,
                returnUrl: successUrl,
                cancelUrl: cancelUrl,
                userId: String(userId),
            };

            paymentChargeResponse = await paypalPayment(payPalRequestData);
            log1(["postAddMakePayment paymentChargeResponse paypal---------->", paymentChargeResponse]);
        };

        if (paymentChargeResponse.flag === 0) {
            return res.json(errorResponse(paymentChargeResponse?.msg));
        };

        const redirectUrl = paymentChargeResponse?.data?.url;
        if (!redirectUrl) {
            return res.json(errorResponse(messages.unexpectedDataError));
        };

        const cartData = await getCartFromCookies(req);

        if (cartData && Array.isArray(cartData)) {
            let ticketId = [];
            let gifcardIdGlobal = [];
            let totalCountEntries = 0;

            for (const cartItem of cartData) {
                const { celebrityId, membershipList } = cartItem;
                               
                let membershipIds = [];
                let giftCardIds = [];
                let totalEntriesForCelebrity = 0;
                let totalCostForCelebrity = 0;
                let membershipDetails = []
                

                for (const membership of membershipList) {
                    const { membershipId, totalQuantity, isSendGift } = membership;

                    const membershipDetail = await Membership.findById(membershipId).lean();
                    if (!membershipDetail || !membershipDetail.membershipEntries) continue;

                    const entriesPerItem = parseInt(membershipDetail.membershipEntries);
                    const pricePerItem = parseInt(membershipDetail.price);
                    const membershipType = String(membershipDetail.name)
                    const totalEntries = totalQuantity * entriesPerItem;
                    const totalCost = totalQuantity * pricePerItem;
                    totalEntriesForCelebrity += totalEntries;
                    totalCostForCelebrity += totalCost;
                    totalCountEntries += totalEntries;
                    membershipIds.push(ObjectId(membershipId));

                    let membershipObj = {
                        membershipId: ObjectId(membershipId),
                        membershipType: membershipType,
                        quantity: totalQuantity,
                        totalEntries: totalEntries,
                        totalCost: totalCost,
                    };
                    membershipDetails.push(membershipObj);

                    for (let i = 0; i < totalQuantity; i++) {
                        if (isSendGift === true || isSendGift === 'true') {
                            const gift_card_code = generateRandomCode(6);

                            // Create Giftcard
                            const giftCard = await Giftcard.create({
                                userId: ObjectId(userId),
                                celebrityId: celebrityId,
                                membershipId: membershipId,
                                giftCardUrl: process.env.SERVER_URL + "/giftcard/" + gift_card_code,
                                giftCardCode: gift_card_code,
                                amount: parseFloat(pricePerItem),
                                totalEntries:entriesPerItem
                            });

                            giftCardIds.push(giftCard._id);
                            gifcardIdGlobal.push(giftCard._id);
                        };
                    };
                };

                let description = membershipDetails.map(obj =>{
                    return `${obj.totalEntries} X $${parseInt(obj.totalCost)} USD ${obj.membershipType} pack ${giftCardIds.length > 0 ? "gift card" : ""} purchased`
                }).join(".");

                // Create Ticket for this celebrity
                const ticketAdd = await Ticket.create({
                    userId: ObjectId(userId),
                    celebrityId: celebrityId,
                    membershipId: membershipIds,
                    giftCardId: giftCardIds,
                    totalEntries: totalEntriesForCelebrity,
                    totalCost: parseFloat(totalCostForCelebrity),
                    type: giftCardIds.length > 0 ? constant.TICKET_TYPE.GIFT : constant.TICKET_TYPE.PAID,
                    description: description,
                    paymentMethod: parseInt(param?.paymentMethod),
                    membershipDetails: membershipDetails,
                });

                if (ticketAdd && ticketAdd._id) {
                    ticketId.push(ticketAdd._id);
                };
            };

            await TempPaymentData.create({
                userId: userId,
                ticketId: ticketId,
                gifcardId: gifcardIdGlobal,
                payment_link: redirectUrl,
                payment_date: new Date(),
                totalAmount: parseFloat(totalPayAmount),
                totalEntries: totalCountEntries,
                paymentMethod: parseInt(param?.paymentMethod),
            });
        };

        let paymentResponse = {
            paymentType: parseInt(param?.paymentMethod),
            redirectUrl: redirectUrl,
        };

        return res.json(successResponse(responsePayMessage, paymentResponse));
    } catch (error) {
        log1(["postAddMakePayment Error----->", error.message]);
        return res.json(errorResponse(messages.unexpectedDataError));
    };
};

export const postPaymentWebhook = async (req, res) => {
    try {
        const event = req.body;
        log1(["postPaymentWebhook event---------->", event]);

        log1(["postPaymentWebhook event type---------->", event.type]);
        log1(["postPaymentWebhook event type---------->", event.event_type]);

        let userId;

        if (event.type === "checkout.session.completed") {
            log1(["postPaymentWebhook Checkout Stripe Completed Event Received."]);

            const session = event.data.object;
            log1(["postPaymentWebhook session---------->", session]);

            if(session.metadata){
                userId = session.metadata.userId;
            };
        } else if (event.event_type === "CHECKOUT.ORDER.APPROVED") {
            log1(["postPaymentWebhook Checkout Paypal Completed Event Received."]);
            log1(["postPaymentWebhook purchase_units---------->", event.resource.purchase_units]);
            log1(["postPaymentWebhook custom_id---------->", event.resource.purchase_units[0].custom_id]);

            userId = event.resource.purchase_units[0].custom_id;
        };
        log1(["postPaymentWebhook userId---------->", userId]);

        if(!userId){
            log1(["postPaymentWebhook UserId Is Empty"]);
            return;
        };

        const tempPaymentDetails = await TempPaymentData.findOne({
            userId: ObjectId(userId),
            status: constant.TEMP_PAYMENT_STATUS.PENDING,
        }).sort({ _id: -1 });
        log1(["postPaymentWebhook tempPaymentDetails---------->", tempPaymentDetails]);

        if(!tempPaymentDetails){
            log1(["postPaymentWebhook tempPaymentDetails Is Empty"]);
            return;
        };

        let ticketId = tempPaymentDetails.ticketId || [];
        let gifcardId = tempPaymentDetails.gifcardId || [];

        // Giftcard Status Update
        await Giftcard.updateMany(
            { _id: { $in: gifcardId }, },
            {
                // giftShowStatus: constant.GIFT_SHOW_STATUS.SUCCESS,
                status: constant.GIFT_CARD_STATUS.ACTIVE,
            },
        );

        // Ticket Status Update
        await Ticket.updateMany(
            { _id: { $in: ticketId }, },
            {
                status: constant.TICKET_STATUS.SUCCESS,
            },
        );

        // Send Mail Form Ticket Purchase(With Gift and Without Gift)
        const ticketData = await Ticket.find({ _id: { $in: ticketId } })
            .populate("celebrityId", "name")
            .populate("membershipDetails.membershipId", "name price membershipEntries");

        const giftcardData = await Giftcard.find({_id: { $in: gifcardId }});
        const userData = await User.findById(userId);

        const ticketCount = ticketData.length;
        const giftcardCount = giftcardData.length;

        let id = 0;
        if (ticketCount >= 1) {
            const hasMultipleTickets = ticketCount > 1;
            const hasGiftcards = giftcardCount > 0;

            id = hasMultipleTickets ? (hasGiftcards ? 4 : 3) : (hasGiftcards ? 2 : 1);
        };

        const celebrities = [...new Map(ticketData.map(t => [t.celebrityId._id, t.celebrityId])).values()];
        const memberships = [...new Map(ticketData.flatMap(t => t.membershipDetails.map(md => md.membershipId)).map(m => [m._id, m])).values()];

        const mailFile = await ejs.renderFile('./views/emails/paid_ticket_purchase_mail.ejs',{
            userName: userData?.userName,
            id: id,
            celebrity: celebrities,
            membership: memberships,
            giftcard: giftcardData,
            ticket: ticketData,
        });

        let subject="";
        switch(id){
            case 1:
                subject = `You're In! 🎉 Your Entries for ${celebrities[0].name}'s Raffle Are Confirmed.`
                break;
            case 2:
                subject = `Your ${celebrities[0].name} Raffle Pack & Gift Are Confirmed! 🎟️🎁`
                break;
            case 3:
                subject = "Your Entries Are In for Multiple Raffles! 🌟"
                break;
            case 4:
                subject = "Your Raffle Entries & Gifted Packs Are Confirmed! 🎁🎟️"
                break;
            default:
                subject = "Your MDF Purchase Confirmation 🎉";
                break;
        };

        const mailOptions = {
            from: process.env.SUPPORT_MAIL,
            to: userData?.email,
            subject: subject,
            html: mailFile,
        };

        sendMail(mailOptions)

        if(tempPaymentDetails.paymentMethod === constant.PAYMENT_METHOD.PAYPAL){
            await TempPaymentData.deleteMany({
                userId: userId,
                status: constant.TEMP_PAYMENT_STATUS.PENDING,
            });
        };

        return res.json(successResponse("Payment webhook received successfully."));
    } catch (error) {
        log1(["postPaymentWebhook Error----->", error.message]);
        return res.json(errorResponse(messages.unexpectedDataError));
    };
};

export const getPaymentSuccessResponse = async (req, res) => {
    try {
        const userId = req.userId;
        log1(["getPaymentSuccessResponse userId---------->", userId]);

        const tempPaymentDetails = await TempPaymentData.findOne({
            userId: userId,
            status: constant.TEMP_PAYMENT_STATUS.PENDING,
        }).sort({ _id: -1 });
        log1(["getPaymentSuccessResponse tempPaymentDetails---------->", tempPaymentDetails]);

        if(!tempPaymentDetails){
            res.redirect("/");
            return;
        };

        let giftcardData = [];
        let packLimitMap = new Map();

        // 1. If gift cards exist → count only totalPackPurchase, not totalEntries
        if (tempPaymentDetails.gifcardId && tempPaymentDetails.gifcardId.length > 0) {
            giftcardData = await Giftcard.find({
                _id: { $in: tempPaymentDetails.gifcardId },
            }).populate("celebrityId").populate("membershipId");

            giftcardData.forEach(gift => {
                const celebrityId = gift.celebrityId._id.toString();
                const membershipId = gift.membershipId._id.toString();
                const key = `${celebrityId}_${membershipId}`;
                const current = packLimitMap.get(key) || {
                    celebrityId,
                    membershipId,
                    totalPackPurchase: 0,
                    totalEntries: 0,
                    isGiftCard: true,
                };

                current.totalPackPurchase += 1;

                packLimitMap.set(key, current);
            });
        };

        // 2. If no gift cards → use ticket(s) to update packLimit (with entries)
        if (packLimitMap.size === 0 && tempPaymentDetails.ticketId.length > 0) {
            const ticketData = await Ticket.find({
                _id: { $in: tempPaymentDetails.ticketId },
            }).lean();

            for (const ticket of ticketData) {
                const celebrityId = ticket.celebrityId.toString();
                const entryPerMembership = Math.floor(ticket.totalEntries / ticket.membershipId.length);

                ticket.membershipId.forEach(membershipId => {
                    const key = `${celebrityId}_${membershipId}`;
                    const current = packLimitMap.get(key) || {
                        celebrityId,
                        membershipId,
                        totalPackPurchase: 0,
                        totalEntries: 0,
                        isGiftCard: false,
                    };

                    current.totalPackPurchase += 1;
                    current.totalEntries += entryPerMembership;

                    packLimitMap.set(key, current);
                });
            };
        };

        // 3. Merge packLimit data into user record
        const user = await User.findById(userId);
        const updatedPackLimit = [...(user.packLimit || [])];

        packLimitMap.forEach(newPack => {
            const existingCelebrity = updatedPackLimit.find(
                c => c.celebrityId.toString() === newPack.celebrityId.toString()
            );

            if (existingCelebrity) {
                const existingPack = existingCelebrity.packList.find(
                    p => p.membershipId.toString() === newPack.membershipId.toString()
                );

                if (existingPack) {
                    existingPack.totalPackPurchase += newPack.totalPackPurchase;
                    existingPack.totalEntries += newPack.totalEntries;
                } else {
                    existingCelebrity.packList.push({
                        membershipId: ObjectId(newPack.membershipId),
                        totalPackPurchase: newPack.totalPackPurchase,
                        totalEntries: newPack.totalEntries,
                    });
                };
            } else {
                updatedPackLimit.push({
                    celebrityId: ObjectId(newPack.celebrityId),
                    packList: [{
                        membershipId: ObjectId(newPack.membershipId),
                        totalPackPurchase: newPack.totalPackPurchase,
                        totalEntries: newPack.totalEntries,
                    }],
                });
            };
        });

        // 4. Save to user document
        await User.findByIdAndUpdate(userId, {
            packLimit: updatedPackLimit,
        });

        // 5. Delete temp payment & cart
        if(tempPaymentDetails.paymentMethod === constant.PAYMENT_METHOD.STRIPE){
            await TempPaymentData.deleteMany({
                userId: userId,
                status: constant.TEMP_PAYMENT_STATUS.PENDING,
            });
        };

        await Cart.deleteMany({ userId: ObjectId(userId) });
        res.clearCookie("celebrityCart", { path: "/" });

        return res.render("users/payment_response", {
            header: {
                title: "Payment Response",
                user: user,
            },
            body: {
                id: "payment-response",
                statusCode: 200,
                giftcardData: giftcardData,
                ticketId: tempPaymentDetails.ticketId[0],
                tempPaymentDetails: tempPaymentDetails,
            },
            footer: {
                js: "payment_response.js",
            },
        });
    } catch (error) {
        log1(["getPaymentSuccessResponse Error----->", error.message]);
        return res.json(errorResponse(messages.unexpectedDataError));
    };
};

export const getPaymentCancelResponse = async (req, res) => {
    try {
        const userId = req.userId;
        log1(["getPaymentCancelResponse userId---------->", userId]);

        const tempPaymentDetails = await TempPaymentData.findOne({
            userId: userId,
            status: constant.TEMP_PAYMENT_STATUS.PENDING,
        }).sort({ _id: -1 });
        log1(["getPaymentSuccessResponse tempPaymentDetails---------->", tempPaymentDetails]);

        if(!tempPaymentDetails){
            res.redirect("/");
            return;
        };

        let gifcardId = tempPaymentDetails.gifcardId || [];

        const giftcardData = await Giftcard.find({
            _id: { $in: gifcardId },
        }).populate("celebrityId").populate("membershipId");

        const userDetails = await User.findById(userId).select("-password -updated_at -updatedAt -__v");

        return res.render("users/payment_response", {
            header: {
                title: "Payment Response",
                user: userDetails,
            },
            body: {
                id: "payment-response",
                statusCode: 400,
                giftcardData: giftcardData,
                ticketId: tempPaymentDetails.ticketId[0],
                tempPaymentDetails: tempPaymentDetails,
            },
            footer: {
                js: "payment_response.js",
            },
        });
    } catch (error) {
        log1(["getPaymentCancelResponse Error----->", error.message]);
        return res.json(errorResponse(messages.unexpectedDataError));
    };
};

export const postUpdateProfile = async (req, res) => {
    try {
        const userId = req.userId;
        const param = req.body;
        
        if(!param.userName) return res.json(errorResponse("Fullname is required"))

        let updateObject = {
            userName: param?.userName,
            email: param?.email,
            country: param?.country,
            address: param?.address,
            age: param?.age,
        };

        if (param?.profileImage) {
            updateObject.profileImage = param?.profileImage;
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateObject, { new: true });

        return res.json(successResponse(messages.profileUpdated, updatedUser));
    } catch (error) {
        log1(["Error in postUpdateProfile----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));

    }
}

export const postChangePassword = async (req, res) => {
    try {
        const userId = req.userId
        const param = req.body;

        const userData = await User.findById(userId).select("password");
        if (!userData) return res.json(errorResponse(messages.userNotFound));

        if(param.code && param.code.length !== constant.OTP_LENGTH) return res.json(errorResponse("Invalid otp, please try again"))

        let resetPasswordToken = await ResetPasswordToken.findOne({token: param.token})
        if(resetPasswordToken.expiryTime < Date.now()) return res.json(errorResponse("Expired Otp"))

        if(Number(param.code) !== Number(resetPasswordToken.otp)) return res.json(errorResponse("Invalid otp, please try again"))

        const salt = await bcrypt.genSalt(10);
        const newPassword = await bcrypt.hash(param.newPassword, salt);

        const response = await User.findByIdAndUpdate(userId, { password: newPassword }, { new: true }).select("-password -updatedAt -__v");
        if (!response) return res.json(errorResponse(messages.unexpectedDataError));

        await ResetPasswordToken.findByIdAndDelete(resetPasswordToken._id)

        let ip = req.ip.split(":").pop();
        const user_device_ip = formatDeviceAndIp(req.headers["user-agent"], ip);

        // send mail
         const mailFile = await ejs.renderFile('./views/emails/password_change_successfully.ejs', {
            TimeofReset: dateFormatByTimezone(response.updated_at),
            ip: ip,
            device: user_device_ip,
            userName: response?.userName
        });

        const mailOptions = {
            from: `${process.env.SUPPORT_MAIL}`,
            to: `${response?.email}`,
            subject: "Password Updated Successfully – Your Account Is Secure 🔐",
            html: mailFile,
        };
        sendMail(mailOptions);

        return res.json(successResponse(messages.passwordUpdated, response));
    } catch (error) {
        log1(["Error in postUpdatePassword----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));

    }
}

export const getReviewOrderPage = async (req, res) => {
    try {
        const param = req.params;

        const paymentMethod = param["paymentMethod"];
        if (!paymentMethod) {
            return res.redirect("/");
        };

        const validMethods = [constant.PAYMENT_METHOD.STRIPE, constant.PAYMENT_METHOD.PAYPAL];
        if (!paymentMethod || !validMethods.includes(parseInt(paymentMethod))) {
            return res.redirect("/cart");
        };

        const cartData = await getCartFromCookies(req);

        if (!Array.isArray(cartData) || cartData.length === 0) {
            return res.redirect("/");
        };

        const userDetails = req.session?.user ? await User.findById(req.session?.user?._id).select('-password -__v') : null;

        let cartDetails = [];
        if (cartData.length > 0) {
            const celebIds = cartData.map(c => c.celebrityId);
            const memberIds = cartData.flatMap(c => c.membershipList.map(m => m.membershipId));

            const [celebrities, memberships] = await Promise.all([
                Celebrity.find({ _id: { $in: celebIds } }).select('-__v'),
                Membership.find({ _id: { $in: memberIds } }).select('-__v'),
            ]);

            cartDetails = cartData.map(cItem => {
                const celeb = celebrities.find(c => c._id.toString() === cItem.celebrityId);
                const membershipList = cItem.membershipList.map(mItem => {
                    const membershipDetail = memberships.find(x => x._id.toString() === mItem.membershipId);
                    return {
                        ...membershipDetail.toObject(),
                        totalQuantity: parseInt(mItem.totalQuantity),
                        isSendGift: mItem.isSendGift,
                        totalPriceByQuantity: parseInt(mItem.totalQuantity) * parseFloat(membershipDetail.price),
                        totalEntries: parseInt(membershipDetail.membershipEntries * mItem.totalQuantity),
                    };
                });
                return { celebrity: celeb, membershipList, allQuantity: cItem.quantity || 1, };
            });
        };

        let totalCelebrities = cartDetails.length;
        let totalSubAmount = 0;
        let totalGiftCount = 0;
        let totalQtyCount = 0;

        cartDetails.forEach((cItem) => {
            cItem.membershipList.forEach((m) => {
                totalSubAmount += m.totalPriceByQuantity;
                totalQtyCount += m.totalQuantity;
                if (String(m.isSendGift) === 'true'){
                    totalGiftCount++;
                };
            });
        });

        const allMembershipGift = cartDetails.every(item => 
            item.membershipList.every(membership => membership.isSendGift === 'true')
        );

        let totalAmount = totalSubAmount;

        // ------------- Pack Limit Check Starts Here -----------------
        let packLimitData = [];
        if (userDetails && userDetails?.packLimit?.length > 0) {
            cartDetails.forEach((cartItem) => {
                const userCelebrityPack = userDetails.packLimit.find(
                    u => u.celebrityId.toString() === cartItem.celebrity._id.toString()
                );

                cartItem.membershipList.forEach((mem) => {
                    const membershipId = mem._id.toString();
                    const cartQty = mem.totalQuantity;
                    const cartEntries = mem.totalEntries;
                    const maxAllowedPack = mem.userPackPurchaseLimit;
                    const maxAllowedEntries = mem.userPackEntryLimit;

                    const existingPack = userCelebrityPack?.packList?.find(
                        p => p.membershipId.toString() === membershipId
                    );

                    const userPackPurchase = existingPack?.totalPackPurchase || 0;
                    const userEntries = existingPack?.totalEntries || 0;

                    const totalPackPurchaseAfterCart = userPackPurchase + cartQty;
                    const totalEntriesAfterCart = userEntries + cartEntries;

                    const isPackOverLimit = totalPackPurchaseAfterCart > maxAllowedPack;
                    const isEntryOverLimit = totalEntriesAfterCart > maxAllowedEntries;

                    if (isPackOverLimit || isEntryOverLimit) {
                        packLimitData.push({
                            celebrityId: cartItem.celebrity._id,
                            celebrityName: cartItem.celebrity.name,
                            membershipId: membershipId,
                            membershipTitle: mem.name,
                            currentPackPurchase: userPackPurchase,
                            currentEntryCount: userEntries,
                            cartQuantity: cartQty,
                            cartEntries: cartEntries,
                            totalPackPurchaseAfterCart,
                            totalEntriesAfterCart,
                            allowedPackLimit: maxAllowedPack,
                            allowedEntryLimit: maxAllowedEntries,
                            isPackOverLimit,
                            isEntryOverLimit,
                        });
                    };
                });
            });
        };

        const isAnyLimitExceeded = packLimitData.length > 0;
        // ------------- Pack Limit Check Ends Here -----------------

        return res.render("users/review-order", {
            header: {
                page: "Review Order",
                user: userDetails,
                title: "Review Order",
                id: "review-order",
            },
            body: {
                payment_method: parseInt(paymentMethod),
                cartDetails: cartDetails,
                totalCelebrities,
                totalSubAmount,
                totalAmount,
                totalGiftCount,
                totalQtyCount,
                allMembershipGift,
                packLimitDetails: packLimitData,
                limitPackExceeded: isAnyLimitExceeded,
            },
            footer: {
                js: "review-order.js"
            },
        });
    } catch (error) {
        log1(["Error in getReviewOrderPage----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
}

export const postCartUpdate = async (req, res) => {
    try {
        const param = req.body;
        const { type, celebrityId, membershipId, isGift } = req.body;
        let cart = await getCartFromCookies(req);

        if (!Array.isArray(cart) || cart.length === 0) {
            return res.json(errorResponse("Cart data required"));
        };

        const findCeleb = cart.find(c => c.celebrityId.toString() === celebrityId.toString());

        switch (type) {
            case 'plus_qty':
                if (findCeleb) {
                    const m = findCeleb.membershipList.find(m => m.membershipId.toString() === membershipId.toString());
                    if (m) {
                        m.totalQuantity++;
                    };
                };
                break;

            case 'minus_qty':
                if (findCeleb) {
                    const m = findCeleb.membershipList.find(m => m.membershipId.toString() === membershipId.toString());
                    if (m) {
                        if (m.totalQuantity > 1) {
                            m.totalQuantity--;
                        };
                    };
                };
                break;

            case 'gift_membership':
                if (findCeleb && typeof isGift !== "undefined") {
                    const m = findCeleb.membershipList.find(m => m.membershipId.toString() === membershipId.toString());
                    if (m) m.isSendGift = isGift;
                };
                break;

            case 'remove_membership':
                if (findCeleb) {
                    findCeleb.membershipList = findCeleb.membershipList.filter(x => x.membershipId.toString() !== membershipId.toString());
                    
                    if (findCeleb.membershipList.length === 0) {
                        const idx = cart.indexOf(findCeleb);
                        if (idx > -1) cart.splice(idx, 1);
                    };
                };
                break;

            case 'remove_celebrity':
                const idx = cart.findIndex(c => c.celebrityId.toString() === celebrityId.toString());
                if (idx > -1) cart.splice(idx, 1);
                break;

            case 'add_celebrity_as_gift':
                if (findCeleb && typeof isGift !== "undefined") {
                    findCeleb.membershipList.forEach((m) => {
                        m.isSendGift = isGift;
                        // m.isSendGift = !m.isSendGift;
                    });
                };
                break;

            case 'all_cart_empty':
                cart = [];
                break;

            default:
                break;
        };

        const userId = req.session?.user?._id;
        if (userId) {
            await Cart.findOneAndUpdate(
                { userId },
                { cartData: cart },
                { upsert: true, new: true }
            );

            res.clearCookie("celebrityCart");
        } else {
            setCartCookie(res, cart);
        };

        return res.status(200).json(successResponse("Cart Update Successfully"));
    } catch (error) {
        log1(["Error in postCartUpdate----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
}

export const getTotalCartItem = async (req, res) =>{
    try {
        const cartData = await getCartFromCookies(req);

        let totalQuantity = 0;

        cartData.forEach((celebrity) => {
            totalQuantity += celebrity?.membershipList.length;
        });

        return res.status(200).json(successResponse("", { totalQuantity: totalQuantity, }));
    } catch (error) {
        log1(["Error in getTotalCartItem----->", error]);
        return res.json(errorResponse(messages.unexpectedDataError));
    }
}