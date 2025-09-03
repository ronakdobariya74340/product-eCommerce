$(document).ready(function () {
    filterData("/admin/user-list");
});

$(document).on("input", "#email-filter-input", function() {
    let email = $("#email-filter-input").val();
    email = email.trim();
    if (email.length > 0) {
        $("#apply-email-filter").attr("disabled", false);
        $("#clear-email-filter").removeClass("d-none");
    } else {
        $("#apply-email-filter").attr("disabled", true);
        $("#clear-email-filter").addClass("d-none");
    };
});

$(document).on("click", "#apply-email-filter", function() {
    const email = $("#email-filter-input").val();
    let displayEmail = email.length > 15 ? email.substring(0, 15) + "..." : email;

    $("#email-filter-btn .filter-data").text(displayEmail).addClass("active");
    $("#email-filter-btn .hr-line-sm").addClass("active");
    $("#clear-email-filter").removeClass("d-none");

    let objectData = {
        email: email,
    };
    
    setFilters(objectData);
    filterData("/admin/user-list");
    toggleResetButtonVisibility();
});

$(document).on("click", "#clear-email-filter", function() {
    $("#email-filter-input").val(""); 

    $("#apply-email-filter").attr("disabled", true);
    $("#email-filter-btn .filter-data").text("").removeClass("active");
    $("#email-filter-btn .hr-line-sm").removeClass("active");
    $("#clear-email-filter").addClass("d-none");

    let objectData = {
        email: "",
    };

    setFilters(objectData);
    filterData("/admin/user-list");
    toggleResetButtonVisibility();
});

$(document).on("click", ".account-status-filter", function() {
    const status = $(this).data('status');
    const statusText = $(this).data('status-text');

    $("#clear-status-filter").removeClass("d-none");
    $("#status-filter-btn .filter-data").text(statusText).addClass("active");
    $("#status-filter-btn .hr-line-sm").addClass("active");

    let objectData = {
        status: status,
    };

    setFilters(objectData);
    filterData("/admin/user-list");
    toggleResetButtonVisibility();
});

$(document).on("click", "#clear-status-filter", function() {
    $("#clear-status-filter").addClass("d-none");
    $("#status-filter-btn .filter-data").text("").removeClass("active");
    $("#status-filter-btn .hr-line-sm").removeClass("active");
    
    let objectData = {
        status: "",
    };

    setFilters(objectData);
    filterData("/admin/user-list");
    toggleResetButtonVisibility();
});

$(document).on("click", ".2fa-status-filter", function() {
    const google_2fa_status = $(this).data('status');
    const statusText = $(this).data('status-text');

    $("#clear-google2fa-filter").removeClass("d-none");
    $("#google2fa-filter-btn .filter-data").text(statusText).addClass("active");
    $("#google2fa-filter-btn .hr-line-sm").addClass("active");

    let objectData = {
        google2faStatus: google_2fa_status,
    };

    setFilters(objectData);
    filterData("/admin/user-list");
    toggleResetButtonVisibility();
});

$(document).on("click", "#clear-google2fa-filter", function() {
    $("#clear-google2fa-filter").addClass("d-none");
    $("#google2fa-filter-btn .filter-data").text("").removeClass("active");
    $("#google2fa-filter-btn .hr-line-sm").removeClass("active");

    let objectData = {
        google2faStatus: "",
    };

    setFilters(objectData);
    filterData("/admin/user-list");
    toggleResetButtonVisibility();
});

$(document).on("click", ".f-reset-btn", function () {
    $(".f-reset-btn").addClass("d-none");
    $("#email-filter-input").val('').trigger("input");
    $("#email-filter-btn .filter-data").removeClass("active").text('');
    $("#email-filter-btn .hr-line-sm").removeClass("active");
    $("#google2fa-filter-btn .filter-data").removeClass("active").text('');
    $("#google2fa-filter-btn .hr-line-sm").removeClass("active");
    $("#status-filter-btn .filter-data").removeClass("active").text('');
    $("#status-filter-btn .hr-line-sm").removeClass("active");

    $("#clear-email-filter").addClass("d-none");
    $("#clear-google2fa-filter").addClass("d-none");
    $("#clear-status-filter").addClass("d-none");

    let objectData = {
        email: "",
        google2faStatus: "",
        status: "",
    };

    setFilters(objectData);
    filterData("/admin/user-list");
    toggleResetButtonVisibility();
});

$(document).on("click", "#edit-user", function () {
    const user_id = $("#edit-user-id").val();
    const user_status = $("#edit-user-status").val();
    const data = {
        user_id: user_id,
        status: user_status,
    };

    postAjaxCall("/admin/edit-user", data, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag == 1) {
            $('#edit-modal').modal('hide');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        };
    });
});

$(document).on("click", "#delete-user", function () {
    const user_id = $("#delete-user-id").val();
    const data = {
        user_id: user_id,
    };

    postAjaxCall("/admin/delete-user", data, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag == 1) {
            $('#delete-modal').modal('hide');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        };
    });
});

function toggleResetButtonVisibility() {
    const hasActiveFilters = $(".filter-btn .filter-data.active").text().trim() !== "";

    if (hasActiveFilters) {
        $(".f-reset-btn").removeClass("d-none");
    } else {
        $(".f-reset-btn").addClass("d-none");
    };
};