$(document).ready(function () {
    filterData("/admin/product-category-list");
});

$(document).on("click", "#add_new_product_category", function (e) {
    e.preventDefault();

    $("#addProductCategoryModalLabel").text("Add Product Category");
    $("#productCategoryName").val("");
    $("#productCategoryStatus").prop("checked", true);
    $("#update_product_category").addClass("d-none");
    $("#add_product_category").removeClass("d-none");
});

$("#add_product_category").on("click", function () {    
    const name = $("#productCategoryName").val();
    const status = $("#productCategoryStatus").is(":checked") ? 2 : 1;

    let validationMessage = "";
    if (!name) {
        validationMessage = "Category Name is required. Please enter name.";
    } else if (name && name.length < 3) {
        validationMessage = "Category Name minimum 3 character.";
    };

    if (validationMessage !== "") {
        showToast(0, validationMessage);
        return;
    };

    const requestData = {
        name: name,
        status: status,
    };

    postAjaxCall("/admin/product-category-add", requestData, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            $("#addProductCategoryModal").modal("hide");
            filterData("/admin/product-category-list");
        };
    });
});

$(document).on("click", ".delete_product_category", function (e) {
    e.preventDefault();
    $("#confirm_delete").removeData("product-category-id");

    const productCategoryId = $(this).data("id");

    $("#confirm_delete").data("product-category-id", productCategoryId);
    $("#deleteProductCategoryModal").modal("show");
})

$(document).on("click", "#confirm_delete", function () {
    const productCategoryId = $(this).data("product-category-id");
    if (!productCategoryId) {
        showToast(0, "Invalid product category id for deletion.");
        return;
    };

    postAjaxCall("/admin/product-category-delete", { productCategoryId: productCategoryId }, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            $("#confirm_delete").removeData("product-category-id");
            $("#deleteProductCategoryModal").modal("hide");
            filterData("/admin/product-category-list");
        }
    });
});

$(document).on("click", ".edit-product-category", function (e) {
    e.preventDefault();

    const productCategoryId = $(this).data("product-category-id");

    postAjaxCall("/admin/product-category-details", { productCategoryId: productCategoryId }, function(response) {
        if(response.flag === 1) {
            let {
                name,
                status,
            } = response.data;

            $("#productCategoryName").val(name);
            $("#productCategoryStatus").prop("checked", status === 2);
            
            const $parent = $("#productCategoryStatus").parent();
            $parent.removeClass("on off").addClass(status === 2 ? "on" : "off");
            
            $("#addProductCategoryModalLabel").text("Update Product Category");
            $("#update_product_category").removeClass("d-none");
            $("#add_product_category").addClass("d-none");
            $("#update_product_category").data("product-category-id", productCategoryId);
        };
    });
});

$("#update_product_category").on("click", function () {
    const productCategoryId = $(this).data("product-category-id");
    const name = $("#productCategoryName").val();
    const status = $("#productCategoryStatus").is(":checked") ? 2 : 1;

    let validationMessage = "";
    if (!productCategoryId) {
        validationMessage = "Category Id is required.";
    } else if (!name) {
        validationMessage = "Category Name is required. Please enter name.";
    } else if (name && name.length < 3) {
        validationMessage = "Category Name minimum 3 character.";
    };

    if (validationMessage !== "") {
        showToast(0, validationMessage);
        return;
    };

    const requestData = {
        productCategoryId: productCategoryId,
        name: name,
        status: status,
    };

    postAjaxCall("/admin/product-category-update", requestData, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            resetProductCategoryForm();
            $("#addProductCategoryModal").modal("hide");
            filterData("/admin/product-category-list");
        }
    });
});

// set filters
$(document).on("input", "#nameInput", function () {
    const name = $(this).val();
    if (name) {
        $('#applyName').prop('disabled', false);
    } else {
        $('#applyName').prop('disabled', true);
    };
});

$(document).on("click", "#applyName", function () {
    const name = $("#nameInput").val().trim();
    $('.filter-name .hr-line-sm').addClass('active');
    $('.filter-name .filter-data').html(name).addClass('active');
    
    filter.name = name;
    filterData("/admin/product-category-list");
    
    $('#resetFilters').removeClass('d-none');
    $('#clearName').prop('disabled', false);
});

$(document).on("click", "#resetFilters", function () {

    $('#nameInput').val("");
    $('#applyName').prop('disabled', true);
    $('#clearName').prop('disabled', true);
    $('.filter-name .hr-line-sm').removeClass('active');
    $('.filter-name .filter-data').html("").removeClass('active');

     
    $('.filter-duration .hr-line-sm').removeClass('active');
    $('.filter-duration .filter-data').html("").removeClass('active');
    // $('#duration-select').val("")

    $('.filter-status .hr-line-sm').removeClass('active');
    $('.filter-status .filter-data').html("").removeClass('active');
    $('#status-select').val("")

    $('#resetFilters').addClass('d-none');
    
    filter.name = "";
    filter.duration = "";
    filter.status = "";
    filterData("/admin/product-category-list");
});

$(document).on("click", "#clearName", function () {
  $('#nameInput').val("");
  $('#applyName').prop('disabled', true);
  
  $('.filter-name .hr-line-sm').removeClass('active');
  $('.filter-name .filter-data').html("").removeClass('active');
 
  
  filter.name = "";
  filterData("/admin/product-category-list");

  const status = $('.filter-status .filter-data').html();
  if (!status) {
      $('#resetFilters').addClass('d-none');
  }
  $('#clearName').prop('disabled', true);
});

$("#status-select").on("change", function () {
    let status = $(this).val();
    let name = $(this).find("option:selected").val() !== "" && $(this).find("option:selected").text() ;
    $('.filter-status .hr-line-sm').addClass('active');
    $('.filter-status .filter-data').html(name).addClass('active');

    // Programmatically hide the dropdown using Bootstrap's dropdown API
    const dropdown = bootstrap.Dropdown.getInstance(
        $(this).closest(".dropdown").find('[data-bs-toggle="dropdown"]')[0]
    );
    if (dropdown) dropdown.hide();

    filter.status = status
    filterData("/admin/product-category-list");
    
    $('#resetFilters').removeClass('d-none');
});

$("#productCategoryStatus").on("change", function(e){
    if( $(this).is(":checked")){
        $(this).parent().removeClass("off").addClass("on")
    }else{
        $(this).parent().removeClass("on").addClass("off")
    }
})

// reset productCategory form
function resetProductCategoryForm() {
    $("#addProductCategoryModalLabel").text("Add Product Category");
    $("#productCategoryName").val("");
    $("#productCategoryStatus").prop("checked", true);
    $("#update_product_category").addClass("d-none");
    $("#add_product_category").removeClass("d-none");
}
