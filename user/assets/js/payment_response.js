$(document).ready(function(){
    $("#payment_fail_section").addClass("d-none");
    $("#final_success_section").addClass("d-none");
    $("#payment_pending_section").addClass("d-none");

    let paymentStatus = $("#user_payment_status").val();

    let payStatus = paymentStatus ? parseFloat(paymentStatus) : 0;

    if(payStatus === 200){
        $("#final_success_section").removeClass("d-none");
    } else if(payStatus !== 200){
        $("#payment_fail_section").removeClass("d-none");
    } else {
        $("#payment_pending_section").removeClass("d-none");
    };
});

$(document).on("click", "#go_to_my_entries", function (e) {
    e.preventDefault();
    window.location.href = "/setting?tab=v-pills-settings-tab";
});

$(document).on("click", "#re_try_payment", function (e) {
    e.preventDefault();
    let payment_link = $(this).data("payment-link");
    window.location.href = payment_link;
});

$(document).on("click", ".copy_gift_link", function (e) {
    e.preventDefault();
    const link = $(this).data("text");
    if (!link) {
        return;
    };

    const $temp = $("<input>");
    $("body").append($temp);
    $temp.val(link).select();

    document.execCommand("copy");
    $temp.remove();

    $(this).find(".copied-text").addClass("show");

    setTimeout(() => {
        $(this).find(".copied-text").removeClass("show");
    }, 1000);
});

$(document).on("click", ".share_gift_card", function (e) {
    e.preventDefault();
    const link = $(this).data("gift-link");
    const gift_card_id = $(this).data("gift-id");
    if (!link) {
        return;
    };

    $("#shareModal #receiver-email").val("");
    $("#shareModal #share_gift_id").val(gift_card_id);
    $("#shareModal #share_gift_url").attr("href", link).text(link);
    $("#shareModal").modal("show");
});

$(document).on("click", "#shareModal #send-giftcard-btn", function (e) {
    e.preventDefault();
    const email = $("#shareModal #receiver-email").val();
    const giftcardId = $("#shareModal #share_gift_id").val();
    const giftcardUrl = $("#shareModal #share_gift_url").attr("href");

    // regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = emailRegex.test(email);

    if (!isValidEmail) {
        $(".spinner-btn").removeClass("disabled");
        showToast(0, "Please enter a valid email address.");
        return;
    };

    const data = {
        receiverEmail: email,
        giftcardId: giftcardId,
    };

   // ! implement logic of share giftcrad
   sendGiftCard(data)
});