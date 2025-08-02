import Cart from "../models/cart.model.js";

export const getCartFromCookies = async (req) => {
    try {
        const cookieCartRaw = req.cookies.celebrityCart ? JSON.parse(req.cookies.celebrityCart) : [];

        const cookieCart = cookieCartRaw || [];

        const userId = req.session?.user?._id;
        let dbCart = [];

        if (userId) {
            const userCart = await Cart.findOne({ userId });
            dbCart = userCart?.cartData || [];
        };

        const mergedCart = mergeCartData(dbCart, cookieCart);

        return mergedCart;
    } catch {
        return [];
    };
};

export const setCartCookie = (res, cartData) => {
    res.cookie("celebrityCart", JSON.stringify(cartData), {
        httpOnly: false,
        maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });
};

export const mergeCartData = (dbCart = [], cookieCart = []) => {
    const mergedMap = new Map();

    const processCart = (cart) => {
        for (const item of cart) {
            const { celebrityId, membershipList } = item;

            if (!mergedMap.has(celebrityId)) {
                mergedMap.set(celebrityId, new Map());
            };

            const membershipMap = mergedMap.get(celebrityId);

            for (const membership of membershipList) {
                const { membershipId, totalQuantity, isSendGift } = membership;

                if (membershipMap.has(membershipId)) {
                    const existing = membershipMap.get(membershipId);
                    existing.totalQuantity += totalQuantity;
                } else {
                    membershipMap.set(membershipId, {
                        membershipId,
                        totalQuantity,
                        isSendGift
                    });
                };
            };
        };
    };

    processCart(dbCart);
    processCart(cookieCart);

    // Convert mergedMap back to array format
    const mergedResult = [];

    for (const [celebrityId, membershipMap] of mergedMap.entries()) {
        const membershipList = Array.from(membershipMap.values());
        mergedResult.push({ celebrityId, membershipList });
    };

    return mergedResult;
};
