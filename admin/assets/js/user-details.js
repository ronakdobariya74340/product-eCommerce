$(document).ready(function () {
});

$(document).on("click", "#sb-transaction-listing-tab", function() {
    userTransactionHistoryFilter({});
});

$(document).on("click", "#sb-gift-redeem-history-tab", function() {
    userGiftRedeemHistoryFilter({});
});
$(document).on("click", "#my-limit-tab", function() {
    userEntriesHistoryFilter({});
});


$(document).on("click", ".trx-type-filter", function() {
    const status = $(this).data("status");
    const statusText = $(this).text();

    $("#trx-type-filter-btn .filter-data").text(statusText).addClass("active");
    $("#trx-type-filter-btn .hr-line-sm").addClass("active");
    $("#trx-type-filter-clear").removeClass("d-none");
    
    let objectData = {
        type: status,
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

$(document).on("click", "#trx-type-filter-clear", function() {
    $("#trx-type-filter-btn .filter-data").text("").removeClass("active");
    $("#trx-type-filter-btn .hr-line-sm").removeClass("active");
    $("#trx-type-filter-clear").addClass("d-none");
    
    let objectData = {
        type: "",
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

$(document).on("click", ".trx-status-filter", function() {
    const status = $(this).data("status");
    const statusText = $(this).text();

    $("#trx-status-filter-btn .filter-data").text(statusText).addClass("active");
    $("#trx-status-filter-btn .hr-line-sm").addClass("active");
    $("#trx-status-filter-clear").removeClass("d-none");
    
    let objectData = {
        status: status,
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

$(document).on("click", "#trx-status-filter-clear", function() {
    $("#trx-status-filter-btn .filter-data").text("").removeClass("active");
    $("#trx-status-filter-btn .hr-line-sm").removeClass("active");
    $("#trx-status-filter-clear").addClass("d-none");
    
    let objectData = {
        status: "",
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

// ticket status filter
$(document).on("click", ".status-filter", function() {
    const status = $(this).data("status");
    const statusText = $(this).text();

    $("#status-filter-btn .filter-data").text(statusText).addClass("active");
    $("#status-filter-btn .hr-line-sm").addClass("active");
    $("#status-filter-clear").removeClass("d-none");
    
    let objectData = {
        giftcardStatus: status,
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

$(document).on("click", "#status-filter-clear", function() {
    $("#status-filter-btn .filter-data").text("").removeClass("active");
    $("#status-filter-btn .hr-line-sm").removeClass("active");
    $("#status-filter-clear").addClass("d-none");
    
    let objectData = {
        giftcardStatus: "",
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

// payment status filter
$(document).on("click", ".payment-filter", function() {
    const paymentMethod = $(this).data("status");
    const statusText = $(this).text();

    $("#payment-filter-btn .filter-data").text(statusText).addClass("active");
    $("#payment-filter-btn .hr-line-sm").addClass("active");
    $("#payment-filter-clear").removeClass("d-none");
    
    let objectData = {
        paymentMethod: paymentMethod,
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

$(document).on("click", "#payment-filter-clear", function() {
    $("#payment-filter-btn .filter-data").text("").removeClass("active");
    $("#payment-filter-btn .hr-line-sm").removeClass("active");
    $("#payment-filter-clear").addClass("d-none");
    
    let objectData = {
        paymentMethod: "",
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

$(document).on("click", ".f-reset-btn", function() {
   
    $("#trx-type-filter-btn .filter-data").removeClass("active").text("");
    $("#trx-type-filter-btn .hr-line-sm").removeClass("active");
    $("#trx-type-filter-clear").addClass("d-none");

    $("#trx-status-filter-btn .filter-data").removeClass("active").text("");
    $("#trx-status-filter-btn .hr-line-sm").removeClass("active");
    $("#trx-status-filter-clear").addClass("d-none");

    $("#status-filter-btn .filter-data").removeClass("active").text("");
    $("#status-filter-btn .hr-line-sm").removeClass("active");
    $("#status-filter-clear").addClass("d-none");

    $("#payment-filter-btn .filter-data").removeClass("active").text("");
    $("#payment-filter-btn .hr-line-sm").removeClass("active");
    $("#payment-filter-clear").addClass("d-none");


    let objectData = {
        type: "",
        paymentMethod: "",
        status: "",
    };

    userTransactionHistoryFilter(objectData);
    toggleResetButtonVisibility();
});

function userTransactionHistoryFilter(data) {
    let userId = $("#userId").val();

    let objectData = {
        userId: userId,
    };

    let combinedObj = { ...objectData, ...data };

    setFilters(combinedObj);
    filterData("/admin/user-transaction-filter", "user-transaction-history-table-data");
};

function userGiftRedeemHistoryFilter(data) {
    let userId = $("#userId").val();

    let objectData = {
        userId: userId,
    };

    let combinedObj = { ...objectData, ...data };

    setFilters(combinedObj);
    filterData("/admin/user-gift-redeem-filter", "user-gift-redeem-history-table-data");
};

function toggleResetButtonVisibility() {
    const hasActiveFilters = $(".filter-btn .filter-data.active").text().trim() !== "";

    if (hasActiveFilters) {
        $(".f-reset-btn").removeClass("d-none");
    } else {
        $(".f-reset-btn").addClass("d-none");
    }
};

// When the suspend modal trigger is clicked
$('[data-bs-target="#user-suspend-modal"]').on("click", function () {
    const userId = $(this).data("user-id");
    $("#confirm-user-suspension").attr("data-user-id", userId);

});

// When the confirm suspension button is clicked
$("#confirm-user-suspension").on("click", function(e) {
    const userId = $(this).data("user-id");
    const reason = $("#suspension-reason").val().trim();

    if (!reason) {
        showToast(0, "Please enter a reason for suspension.");
        return;
    }
    suspendUser({user_id: userId, reason, status: 3})
});

$('[data-bs-target="#user-unsuspend-modal"]').on("click", function(){
    const userId = $(this).data("user-id");
    $("#confirm-user-unsuspend").attr("data-user-id", userId);
})

$("#confirm-user-unsuspend").on("click", function(e){
    const userId = $(this).data("user-id")
    
    suspendUser({user_id: userId, status: 2})
})


function suspendUser(data){
    postAjaxCall("/admin/edit-user", data, function(response) {
        showToast(response.flag, response.msg);
        if (response.flag) {
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    });
}

function userEntriesHistoryFilter(data) {
    let userId = $("#userId").val();

    let objectData = {
        userId: userId,
    };

    let combinedObj = { ...objectData, ...data };

    setFilters(combinedObj);
    filterData("/admin/user-entries-filter", "user-entries-table-data");
};