import dotenv from 'dotenv';
dotenv.config();

export default {
    AUTH_TOKEN_LENGTH: 15,
    OTP_LENGTH: 6,
    OTP_EXPIRATION_TIME: 1000 * 60 * 10,
    MAX_FILE_SIZE: 5 * 1024 * 1024, // 5 MB
    DEFAULT_ITEM_PER_PAGE: 10,
    DEFAULT_CURRENT_PAGE: 1,
    PRODUCT_UPLOAD_PATH: "assets/images/ProductImages",
    BANNER_UPLOAD_PATH: "assets/images/BannerImages",
    USER_STATUS: {
        PENDING: 1,
        ACTIVE: 2,
        SUSPEND: 3,
        INACTIVE: 4,
    },
    TRANSACTION_STATUS: {
        PENDING: 0,
        SUCCESS: 1,
        FAILED: 2,
    },
    PRODUCT_CATEGORY_STATUS:{
        INACTIVE: 1,
        ACTIVE: 2,
    },
    PRODUCT_BANNER_STATUS:{
        INACTIVE: 1,
        ACTIVE: 2,
    },
    PRODUCT_STATUS: {
        PENDING: 1,
        ACTIVE: 2,
        SUSPEND: 3,
    },
    PAYMENT_METHOD: {
        STRIPE: 1,
        PAYPAL: 2,
        DEFAULT: 3,
    },
    PAYMENT_STATUS: {
        PENDING: 1,
        SUCCESS: 2,
        FAILED: 3,
    },
    TEMP_PAYMENT_STATUS: {
        PENDING: 1,
        COMPLETE: 2,
    },
}
