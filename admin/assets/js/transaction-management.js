$(document).ready(function () {
    filterData("/admin/transaction-list");
    $('#greaterThanCheckbox').prop('checked', true);
    filter.isgreaterthan = true;
});

$("#nameSelect").on("change", function () {
    let name = $(this).val();
    let userId = $(this).find("option:selected").data("id");
    $('.filter-name .hr-line-sm').addClass('active');
    $('.filter-name .filter-data').html(name).addClass('active');

    // Programmatically hide the dropdown using Bootstrap's dropdown API
    const dropdown = bootstrap.Dropdown.getInstance(
        $(this).closest(".dropdown").find('[data-bs-toggle="dropdown"]')[0]
    );
    if (dropdown) dropdown.hide();

    filter.userId = userId
    filterData("/admin/transaction-list");
    
    $('#resetFilters').removeClass('d-none');
    $('#clearName').prop('disabled', false);
});


$(document).on("click", "#resetFilters", function () {

    $('#nameSelect').val("")
    $('.filter-name .hr-line-sm').removeClass('active');
    $('.filter-name .filter-data').html("").removeClass('active');

    $('#amountInput').val("")
    $('.filter-amount .hr-line-sm').removeClass('active');
    $('.filter-amount .filter-data').html("").removeClass('active');
    $('#greaterThanCheckbox').prop('checked', true);
    $('#lessThanCheckbox').prop('checked', false);

    $("#status-filter").val("")
    $("#status-filter-btn .filter-data").html("").removeClass("active");
    $("#status-filter-btn .hr-line-sm").removeClass("active");

    $("#productCategory-filter").val("");
    $("#productCategory-filter-btn .filter-data").html("").removeClass("active");
    $("#productCategory-filter-btn .hr-line-sm").removeClass("active");

    $("#product-filter").val("")
    $("#product-filter-btn .filter-data").html("").removeClass("active");
    $("#product-filter-btn .hr-line-sm").removeClass("active");

    $('#resetFilters').addClass('d-none');
    
    filter.userId = "";
    filter.amount = "";
    filter.status = "";
    filter.productId = "";
    filter.productCategoryId = "";

    filterData("/admin/transaction-list");
});

$(document).on("input", "#amountInput", function () {
    const amount = $(this).val();
    if (amount) {
        $('#applyAmount').prop('disabled', false);
    } else {
        $('#applyAmount').prop('disabled', true);
    };
});

$(document).on("click", "#applyAmount", function () {
    const amount = $("#amountInput").val().trim();
    $('.filter-amount .hr-line-sm').addClass('active');
    $('.filter-amount .filter-data').html(amount).addClass('active');
    
    filter.amount = amount;
       filterData("/admin/transaction-list");
    
    $('#resetFilters').removeClass('d-none');
    $('#clearAmount').prop('disabled', false);
});

$(document).on("click", "#clearAmount", function () {
    $('#amountInput').val("");
    $('#applyAmount').prop('disabled', true);
    
    $('.filter-amount .hr-line-sm').removeClass('active');
    $('.filter-amount .filter-data').html("").removeClass('active');
    
    filter.amount = "";
       filterData("/admin/transaction-list");

    const status = $('.filter-status .filter-data').html();
    if (!status) {
        $('#resetFilters').addClass('d-none');
    }
    $('#clearAmount').prop('disabled', true);
});

$('#greaterThanCheckbox').change(function() {
    if ($(this).is(':checked')) {
        $('#lessThanCheckbox').prop('checked', false);
        
    }
    filter.isgreaterthan = true;
    const dropdown = bootstrap.Dropdown.getInstance(
        $(this).closest(".dropdown").find('[data-bs-toggle="dropdown"]')[0]
    );
    if (dropdown) dropdown.show();
});

$('#lessThanCheckbox').change(function() {
    if ($(this).is(':checked')) {
        $('#greaterThanCheckbox').prop('checked', false);
    }
    filter.isgreaterthan = false;
    const dropdown = bootstrap.Dropdown.getInstance(
        $(this).closest(".dropdown").find('[data-bs-toggle="dropdown"]')[0]
    );
    if (dropdown) dropdown.show();
});

// status filter
$(document).on("click", ".status-filter", function() {
    const status = $(this).data('status');
    const statusText = $(this).data('status-text');

    $("#clear-status-filter").removeClass("d-none");
    $("#status-filter-btn .filter-data").text(statusText).addClass("active");
    $("#status-filter-btn .hr-line-sm").addClass("active");

    $('#resetFilters').removeClass('d-none');

    filter.status = status
    filterData("/admin/transaction-list");
});

$(document).on("click", "#clear-status-filter", function() {
    $("#clear-status-filter").addClass("d-none");
    $("#status-filter-btn .filter-data").text("").removeClass("active");
    $("#status-filter-btn .hr-line-sm").removeClass("active");
    
    $('#resetFilters').addClass('d-none');

   filter.status = ""
    filterData("/admin/transaction-list");
})

// productCategory filter
$(document).on("click", ".productCategory-filter", function() {
    const productCategoryId = $(this).data('product-ategory-id');
    const statusText = $(this).data('status-text');

    $("#clear-productCategory-filter").removeClass("d-none");
    $("#productCategory-filter-btn .filter-data").text(statusText).addClass("active");
    $("#productCategory-filter-btn .hr-line-sm").addClass("active");

    $('#resetFilters').removeClass('d-none');

    filter.productCategoryId = productCategoryId
    filterData("/admin/transaction-list");
});

$(document).on("click", "#clear-productCategory-filter", function() {
    $("#clear-productCategory-filter").addClass("d-none");
    $("#productCategory-filter-btn .filter-data").text("").removeClass("active");
    $("#productCategory-filter-btn .hr-line-sm").removeClass("active");
    
    $('#resetFilters').addClass('d-none');

   filter.productCategoryId = ""
    filterData("/admin/transaction-list");
})

// product filter
$(document).on("click", ".product-filter", function() {
    const productId = $(this).data('product-id');
    const statusText = $(this).data('status-text');

    $("#clear-product-filter").removeClass("d-none");
    $("#product-filter-btn .filter-data").text(statusText).addClass("active");
    $("#product-filter-btn .hr-line-sm").addClass("active");

    $('#resetFilters').removeClass('d-none');

    filter.productId = productId
    filterData("/admin/transaction-list");
});

$(document).on("click", "#clear-product-filter", function() {
    $("#clear-product-filter").addClass("d-none");
    $("#product-filter-btn .filter-data").text("").removeClass("active");
    $("#product-filter-btn .hr-line-sm").removeClass("active");

    $('#resetFilters').addClass('d-none');
    
   filter.productId = ""
    filterData("/admin/transaction-list");
})
