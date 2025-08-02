import dotenv from 'dotenv';
dotenv.config();

export default {
    AUTH_TOKEN_LENGTH: 15,
    OTP_LENGTH: 6,
    OTP_EXPIRATION_TIME: 1000 * 60 * 10,
    CURRENCY_CODE: "USD",
    PAYMENT_METHOD: {
        STRIPE: 1,
        PAYPAL: 2,
        DEFAULT: 3,
    },
    USER_STATUS: {
        PENDING: 1,
        ACTIVE: 2,
        SUSPEND: 3,
    },
    PAYMENT_STATUS: {
        PENDING: 1,
        SUCCESS: 2,
        FAILED: 3,
    },
    MEMBERSHIP_STATUS: {
        INACTIVE: 0,
        ACTIVE: 1,
    },
    GOOGLE_2FA_STATUS: {
        DISABLED: 0,
        ENABLED: 1,
    },
    GIFT_CARD_STATUS: {
        PENDING: 0,
        ACTIVE: 1,
        REDEEMED: 2,
    },
    REDEEM_CODE_LENGTH: 6,
    CELEBRITY_STATUS: {
        PENDING: 1,
        ACTIVE: 2,
        SUSPEND: 3,
    },
    GIFT_TYPE: {
        SENT: 1,
        RECEIVED: 2,
    },
    GIFT_SHOW_STATUS: {
        PENDING: 1,
        SUCCESS: 2,
        FAILED: 3,
    },
    TEMP_PAYMENT_STATUS: {
        PENDING: 1,
        COMPLETE: 2,
    },
    TICKET_TYPE: {
        FREE: 1,
        PAID: 2,
        GIFT: 3,
    },
    TICKET_STATUS: {
        PENDING: 1,
        SUCCESS: 2,
        FAILED: 3,
    },
    MAX_DEVICE_LOGIN_LIMIT: 3,
    GIFT_SEND_STATUS :{
        PENDING: 0,
        SUCCESS: 1,
    }
}
