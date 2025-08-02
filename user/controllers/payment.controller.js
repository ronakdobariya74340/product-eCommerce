import paypal from "@paypal/checkout-server-sdk";
import { ObjectId } from "mongodb";
import messages from "../utils/messages.js";
import constant from "../config/constant.js";
import { errorResponse, log1, successResponse } from "../lib/general.lib.js";
import User from "../models/user.models.js";
import Stripe from 'stripe';

const clientId = process.env.PAYPAL_CLIENT_ID;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

function paypalEnvironment() {
    return process.env.NODE_ENV === "live" ? new paypal.core.LiveEnvironment(clientId, clientSecret) : new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

function paypalClient() {
  return new paypal.core.PayPalHttpClient(paypalEnvironment());
};

export const paypalPayment = async (payload) => {
    try {
        log1(["paypalPayment payload------------------>", payload]);

        let amount = payload?.amount;
        let paymentAmount = amount.toFixed(2);
        log1(["paypalPayment paymentAmount---------->", paymentAmount]);

        const bodyRequest = new paypal.orders.OrdersCreateRequest();
        bodyRequest.prefer("return=representation");
        bodyRequest.requestBody({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: constant.CURRENCY_CODE,
                        value: paymentAmount,
                    },
                    custom_id: payload?.userId,
                },
            ],
            application_context: {
                return_url: payload?.returnUrl,
                cancel_url: payload?.cancelUrl,
            },
        });
        log1(["paypalPayment bodyRequest------------------>", bodyRequest]);

        const createOrder = await paypalClient().execute(bodyRequest);
        log1(["paypalPayment createOrder------------------>", createOrder]);

        let responseData = createOrder?.result;
        log1(["paypalPayment responseData------------------>", responseData]);

        const approvalUrl = responseData.links.find(link => link.rel === 'approve').href;
        log1(["paypalPayment approvalUrl------------------>", approvalUrl]);

        return successResponse("Payment Charge Successfully!", { responseData: responseData, url: approvalUrl });
    } catch (error) {
        log1(["paypalPayment Error----->", error.message]);
        return errorResponse(messages.unexpectedDataError);
    };
};

// stripe payment 
export const stripePayment = async (payload) => {
    try {
        log1(["stripePayment payload------------------>", payload]);
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        const checkOutSession = await stripe.checkout.sessions.create({
            payment_method_types: payload?.payment_method_types || ["card"],
            mode: "payment",
            line_items: [{
                price_data: {
                    currency: payload?.currency,
                    unit_amount: payload?.amount,
                    product_data: { 
                        name: "Celebrity Payment",
                    },
                },
                quantity: 1,
            }],
            success_url: payload?.success_url,
            cancel_url: payload?.cancel_url,
            metadata: payload?.metadata,
        });

        return successResponse("Payment Charge Successfully!", checkOutSession);
    } catch (error) {
        log1(["stripePayment Error----->", error.message]);
        return errorResponse(messages.unexpectedDataError);
    }
    
}