$(document).ready(function(){});

$(document).on("click", "#back_to_cart", function (e) {
    e.preventDefault();
    window.location.href = "/cart";
});

$(document).on("click", "#final_checkout_btn", function (e) {
    e.preventDefault();

    let final_payout = parseInt($("#final_amount_val").data("final-payout"));
    let select_payment_method = $("#select_payment_method").val();
    const userId = $("#user_id").val();
    const userEmail = $("#user_email").val();
    const is_verify_google2fa_Status = $("#is_verify_google2fa_Status").val();
    const userGoogle2faStatus = $("#user_google2fa_Status").val();
    const userSecurityVerify = $("#user_security_verify").val();

    const validMethods = [1, 2];

    if (!select_payment_method || !validMethods.includes(parseInt(select_payment_method))) {
        showToast(0, "Please select payment method");
        window.location.href = "/cart";
        return;
    };

    if(isNaN(final_payout) || final_payout <= 0){
        showToast(0, "Invalid amount");
        window.location.href = "/cart";
        return;
    };

    if(!userId){
        $("#signinModal").modal("show");
        return;
    };

    if(parseInt(is_verify_google2fa_Status) === 0 && parseInt(userGoogle2faStatus) === 1){
        $("#2fa-modal").modal("show");
        $("#2FA-email-input").val(userEmail);
        $("#2FA-login-view").val(2);
        return;
    };

    if(!userSecurityVerify || userSecurityVerify !== "1") {
        if (isUserLockedOut()) {
            showToast(0, "No more attempts. Please try again after 10 minutes.");
            return;
        };

        let attemptCount = parseInt(localStorage.getItem("attempt-count"));
        if (userId && (attemptCount === 0 || attemptCount === null || isNaN(attemptCount))) {
            localStorage.setItem("attempt-count", 3);
        };

        generateSecurityQuestion();
        let celebrity_name = "Celebrity";
        $("#verifyModal .celebrity_verify_name").html(`<strong>${celebrity_name}</strong>`);
        $("#verifyModal #security_show_by_payment").val(1);
        $("#verifyModal").modal("show");
        return;
    };

    let payload = {
        paymentMethod: parseInt(select_payment_method),
        totalPaymentAmount: parseFloat(final_payout),
    };

    postAjaxCall("/make-payment", payload, function (response) {
        showToast(response.flag, response.msg);
        $("#user_security_verify").val("");
        if (response.flag === 1) {
            if(parseInt(select_payment_method) === parseInt(response?.data?.paymentType)) {
                window.location.href = response?.data?.redirectUrl;
            };
        };
    });
});
