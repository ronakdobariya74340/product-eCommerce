$(document).ready(function(){});

$(document).on("click", "#back_to_celebrities", function (e) {
    e.preventDefault();
    window.location.href = "/celebrities";
});

$(document).on("click", ".plus_qty_btn", function (e) {
    let current_index = $(this).data("index");
    let current_member_index = $(this).data("member-index");
    let current_price = $(this).data("current-price");
    let current_entries = $(this).data("current-entries");
    let current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();
    let current_membership_id = $("#cart_membership_id_" + current_member_index).val();
    let current_sub_total_amount = parseFloat($("#total_sub_amount_count").text().replace(/[^\d.]/g, ''));
    let current_total_amount = parseFloat($("#total_final_amount_count").text().replace(/[^\d.]/g, ''));
    let currentValue = parseInt($('#total_qty_pack_' + current_member_index).val());
    let totalQuantityHideCount = parseInt($("#total_qty_hide_count").val());
    let newPlusVal = parseFloat(currentValue + 1);

    $("#total_qty_pack_" + current_member_index).val(newPlusVal);

    let newAmount = parseFloat(newPlusVal * current_price);
    $("#total_price_pack_" + current_member_index).html("$" + newAmount);

    let newEntries = parseFloat(newPlusVal * current_entries);
    $("#total_entries_pack_" + current_member_index).html(newEntries + " Entries");

    let totalSubAmount = current_sub_total_amount + current_price;
    let totalFinalAmount = current_total_amount + current_price;

    $("#total_qty_hide_count").val(totalQuantityHideCount + 1);
    $("#total_sub_amount_hide_count").val(totalSubAmount);
    $("#total_amount_hide_count").val(totalFinalAmount);

    updateStorCartDetail("plus_qty", current_celebrity_id, current_membership_id);

    if (currentValue + 1 > 0) {
        $("#minus_qty_pack_btn_" + current_member_index).removeClass("btn-disabled");
    };

    totalFinalAmountCount();
});

$(document).on("click", ".minus_qty_btn", function (e) {
    let current_index = $(this).data("index");
    let current_member_index = $(this).data("member-index");
    let current_price = $(this).data("current-price");
    let current_entries = $(this).data("current-entries");
    let current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();
    let current_membership_id = $("#cart_membership_id_" + current_member_index).val();
    let current_sub_total_amount = parseFloat($("#total_sub_amount_count").text().replace(/[^\d.]/g, ''));
    let current_total_amount = parseFloat($("#total_final_amount_count").text().replace(/[^\d.]/g, ''));
    let currentValue = parseInt($('#total_qty_pack_' + current_member_index).val());
    let totalQuantityHideCount = parseInt($("#total_qty_hide_count").val());

    if (currentValue - 1 < 1) {
        return;
    };

    if (currentValue > 0) {
        let newMinusVal = parseFloat(currentValue - 1);
        $("#total_qty_pack_" + current_member_index).val(newMinusVal);

        let newAmount = parseFloat(newMinusVal * current_price);
        $("#total_price_pack_" + current_member_index).html("$" + newAmount);

        let newEntries = parseFloat(newMinusVal * current_entries);
        $("#total_entries_pack_" + current_member_index).html(newEntries + " Entries");

        let totalSubAmount = current_sub_total_amount - current_price;
        let totalFinalAmount = current_total_amount - current_price;

        $("#total_qty_hide_count").val(totalQuantityHideCount - 1);
        $("#total_sub_amount_hide_count").val(totalSubAmount);
        $("#total_amount_hide_count").val(totalFinalAmount);

        updateStorCartDetail("minus_qty", current_celebrity_id, current_membership_id);

        totalFinalAmountCount();
    };

    if (currentValue - 1 <= 1) {
        $(this).addClass("btn-disabled");
    };
});

// $(document).on("keydown", ".qty_input_btn", function(event) {
//     // Block dot and minus keys
//     if (event.key === "." || event.key === "-" || event.keyCode === 190 || event.keyCode === 189) {
//         event.preventDefault();
//     }
// });

// $(document).on("keyup", ".qty_input_btn", function(event) {
//     this.value = this.value.replace(/[.-]/g, '');

//     let current_value = parseInt($(this).val());
//     // if (isNaN(current_value) || current_value < 1) {
//     if (current_value < 1) {
//         $(this).val(1);
//     } else {
//         $(this).val(current_value);
//     };
// });

$(document).on("click", ".add_gift_membership_btn", function (e) {
    e.preventDefault();

    let current_index = $(this).data("index");
    let current_member_index = $(this).data("member-index");
    let current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();
    let current_membership_id = $("#cart_membership_id_" + current_member_index).val();
    let totalGiftHideCount = parseInt($("#total_gift_hide_count").val());

    $("#total_gift_hide_count").val(totalGiftHideCount + 1);

    $(this).addClass("d-none");
    $(this).data("is-gift", true).attr("data-is-gift", "true");
    // const isGift = $("#add_gift_membership_btn_" + current_member_index).attr("data-is-gift") === "true";
    $("#gift_membership_message_line_" + current_member_index).removeClass("d-none");

    updateStorCartDetail("gift_membership", current_celebrity_id, current_membership_id, true);

    totalFinalAmountCount();
});

$(document).on("click", ".remove_gift_membership_message_btn", function (e) {
    e.preventDefault();

    let current_index = $(this).data("index");
    let current_member_index = $(this).data("member-index");
    let current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();
    let current_membership_id = $("#cart_membership_id_" + current_member_index).val();
    let totalGiftHideCount = parseInt($("#total_gift_hide_count").val());

    if (totalGiftHideCount <= 0) {
        return;
    };

    // Decrease the total gift count
    $("#total_gift_hide_count").val(totalGiftHideCount - 1);

    $("#gift_membership_message_line_" + current_member_index).addClass("d-none");
    $("#add_gift_membership_btn_" + current_member_index).removeClass("d-none");
    $("#add_gift_membership_btn_" + current_member_index).data("is-gift", false).attr("data-is-gift", "false");
    $(".purchase_all_gift").prop("checked", false);
    
    updateStorCartDetail("gift_membership", current_celebrity_id, current_membership_id, false);

    totalFinalAmountCount();
});

$(document).on("click", ".remove_membership_btn", function (e) {
    e.preventDefault();

    let current_index = $(this).data("index");
    let current_member_index = $(this).data("member-index");
    let current_price = $(this).data("current-price");
    let current_membership_gift = $(this).data("membership-gift");
    let current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();
    let current_membership_id = $("#cart_membership_id_" + current_member_index).val();
    let current_sub_total_amount = parseFloat($("#total_sub_amount_count").text().replace(/[^\d.]/g, ''));
    let current_total_amount = parseFloat($("#total_final_amount_count").text().replace(/[^\d.]/g, ''));
    let currentValue = parseInt($('#total_qty_pack_' + current_member_index).val());
    let totalQuantityHideCount = parseInt($("#total_qty_hide_count").val());
    let totalGiftHideCount = parseInt($("#total_gift_hide_count").val());

    let newAmount = parseFloat(currentValue * current_price);

    let totalSubAmount = current_sub_total_amount - newAmount;
    let totalFinalAmount = current_total_amount - newAmount;

    $("#total_qty_hide_count").val(parseInt(totalQuantityHideCount - currentValue));
    $("#total_sub_amount_hide_count").val(totalSubAmount);
    $("#total_amount_hide_count").val(totalFinalAmount);

    if( current_membership_gift === "true") {
        $("#total_gift_hide_count").val(totalGiftHideCount - 1);
    };

    $("#gift_membership_message_line_" + current_member_index).addClass("d-none");

    updateStorCartDetail("remove_membership", current_celebrity_id, current_membership_id);

    totalFinalAmountCount();
});

$(document).on("click", ".remove_celebrity_btn", function (e) {
    e.preventDefault();

    let current_index = $(this).data("index");
    let current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();

    updateStorCartDetail("remove_celebrity", current_celebrity_id);

    totalFinalAmountCount();
});

$(document).on("click", ".purchase_all_gift", function (e) {
    $(".all_gift_send_btn").addClass("d-none");
    $(".gift_membership_message_view").addClass("d-none");
    $(".add_gift_membership_btn").addClass("d-none");
    $(".all_gift_message_apply_view").addClass("d-none");

    if ($(this).is(":checked")) {
        $(".all_gift_send_btn").removeClass("d-none");
        $("#total_gift_hide_count").val(0);
        totalFinalAmountCount();
    } else {
        updateEachGiftMembershipSequentially();
    };
});

$(document).on("click", ".all_gift_send_btn", async function (e) {
    e.preventDefault();

    let current_index = $(this).data("index");
    let total_membership = $(this).data("total-membership");
    let current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();
    let totalGiftHideCount = parseInt($("#total_gift_hide_count").val());

    $("#all_gift_message_view_" + current_index).removeClass("d-none");
    $("#all_gift_send_btn_" + current_index).addClass("d-none");

    $("#total_gift_hide_count").val(totalGiftHideCount + total_membership);

    await new Promise((resolve) => {
        updateStorCartDetail("add_celebrity_as_gift", current_celebrity_id, "", true, resolve);
    });

    totalFinalAmountCount();
});

$(document).on("click", ".remove_gift_celebrity_message_btn", async function (e) {
    e.preventDefault();

    let current_index = $(this).data("index");
    let total_membership = $(this).data("total-membership");
    let current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();
    let totalGiftHideCount = parseInt($("#total_gift_hide_count").val());

    $("#all_gift_message_view_" + current_index).addClass("d-none");
    $("#all_gift_send_btn_" + current_index).removeClass("d-none");

    $("#total_gift_hide_count").val(totalGiftHideCount - total_membership);

    await new Promise((resolve) => {
        updateStorCartDetail("add_celebrity_as_gift", current_celebrity_id, "", false, resolve);
    });

    totalFinalAmountCount();
});

$(document).on("click", "#all_empty_cart", function (e) {
    e.preventDefault();

    updateStorCartDetail("all_cart_empty");
});

$(document).on("click", "#review_checkout_btn", function (e) {
    const selectedPayment = $('input[name="select_payment_method"]:checked').val();

    if(!selectedPayment){
        showToast(0, "Please select payment method");
        return;
    };

    window.location.href = "/review-order/" + selectedPayment;
});

async function updateEachGiftMembershipSequentially() {
    let totalUnGiftCount = 0;

    for (const elem of $(".add_gift_membership_btn").toArray()) {
        const $elem = $(elem);
        const current_index = $elem.data("index");
        const memberIndex = $elem.data("member-index");
        const current_celebrity_id = $("#cart_celebrity_id_" + current_index).val();
        const current_membership_id = $("#cart_membership_id_" + memberIndex).val();
        const isGift = $elem.attr("data-is-gift") === "true";

        if (!isGift) {
            $elem.removeClass("d-none");
            await new Promise((resolve) => {
                updateStorCartDetail("gift_membership", current_celebrity_id, current_membership_id, false, resolve);
            });
        } else {
            totalUnGiftCount += 1;
            await new Promise((resolve) => {
                updateStorCartDetail("gift_membership", current_celebrity_id, current_membership_id, true, resolve);
            });
            $("#gift_membership_message_line_" + memberIndex).removeClass("d-none");
        };
    };

    $("#total_gift_hide_count").val(totalUnGiftCount);
    totalFinalAmountCount();
};

function totalFinalAmountCount(){
    let totalQuantityHideCount = $("#total_qty_hide_count").val();
    let totalGiftHideCount = $("#total_gift_hide_count").val();
    let totalSubAmountHideCount = $("#total_sub_amount_hide_count").val();
    let totalAmountHideCount = $("#total_amount_hide_count").val();

    $("#total_qty_count").html(totalQuantityHideCount);
    $("#total_gift_count").html(totalGiftHideCount);
    $("#total_sub_amount_count").html("$" + totalSubAmountHideCount + " USD");
    $("#total_final_amount_count").html("$" + totalAmountHideCount + " USD");

    getAllTotalQuantity();
};

function updateStorCartDetail(type, celebrity_id, membership_id, isGift = undefined, callback = undefined) {
    let payload = {
        type: type,
        celebrityId: celebrity_id ? celebrity_id : "",
        membershipId: membership_id ? membership_id : "",
    };

    if (typeof isGift !== "undefined") {
        payload.isGift = isGift;
    };

    postAjaxCall("/cart-update", payload, function (response) {
        if (response.flag === 1) {
            if (["plus_qty", "minus_qty", "remove_celebrity", "remove_membership", "all_cart_empty"].includes(type)) {
                location.reload();
                return;
            };
        };
        if (callback) callback();
    });
};