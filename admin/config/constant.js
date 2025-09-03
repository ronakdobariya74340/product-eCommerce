import dotenv from 'dotenv';
dotenv.config();

export default {
    AUTH_TOKEN_LENGTH: 15,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
    USER_STATUS: {
        PENDING: 1,
        ACTIVE: 2,
        SUSPEND: 3,
        INACTIVE: 4,
    },
    DEFAULT_ITEM_PER_PAGE: 10,
    DEFAULT_CURRENT_PAGE: 1,
    TRANSACTION_STATUS: {
        PENDING: 0,
        SUCCESS: 1,
        FAILED: 2,
    },
    PRODUCT_UPLOAD_PATH: "assets/images/ProductImages",
    BANNER_UPLOAD_PATH: "assets/images/BannerImages",
    PRODUCT_CATEGORY_STATUS:{
        INACTIVE: 1,
        ACTIVE: 2,
    },
    PRODUCT_BANNER_STATUS:{
        INACTIVE: 1,
        ACTIVE: 2,
    },
    STATUS:{
        INACTIVE: 1,
        ACTIVE: 2,
    },
    PAYMENT_METHOD: {
        STRIPE: 1,
        PAYPAL: 2,
        DEFAULT: 3,
    },
    GIFT_CARD_STATUS: {
        PENDING: 0,
        ACTIVE: 1,
        REDEEMED: 2,
    },
    PRODUCT_STATUS: {
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
    GOOGLE_2FA_STATUS: {
        DISABLED: 0,
        ENABLED: 1,
    },
    GIFT_SEND_STATUS :{
        PENDING: 0,
        SUCCESS: 1,
    },
    FILTER_TRX_TYPE: {
        ALL: 0,
        FREE: 1,
        PAID: 2,
        GIFT: 3,
        MIXED: 4
    }
}
