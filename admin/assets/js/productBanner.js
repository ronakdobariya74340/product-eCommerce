let MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
let MAX_FILE_COUNT = 5; // Maximum number of files allowed
let selectedfiles = []; 

$(document).ready(function () {
    filterData("/admin/product-banner-list");

    $("#productBannerName").val("");
    $("#productImageInput").val("");
    selectedfiles = [];
    $("#thumbnail-preview-container").empty();
});

$(document).on("click", "#add_new_product_banner", function (e) {
    e.preventDefault();

    selectedfiles = [];

    $("#addEditProductBannerModalLabel").text("Add Product Banner");
    $("#productBannerName").val("");
    $("#productImageInput").val("");
    $("#productBannerStatus").prop("checked", true);
    $("#thumbnail-preview-container").empty();
    $("#update_product_banner").addClass("d-none");
    $("#add_product_banner").removeClass("d-none");
});

$("#productImageInput").on("change", function (e) {
    const images = $(this)[0];
    const newFiles = Array.from(images.files);
    let overSizedImage = Array.from(images.files)?.filter(file => file.size > MAX_FILE_SIZE);

    $("#image-alert").text("");
    if (overSizedImage.length > 0 ) return $("#image-alert").text(`Image size should be less than ${MAX_FILE_SIZE / (1024 * 1024)} MB`);

    let combinedFile = [...selectedfiles, ...newFiles]?.filter(file => file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE);
    $("#image-alert").text("");
    if(combinedFile.length > MAX_FILE_COUNT) return $("#image-alert").text(`You can upload a maximum of ${MAX_FILE_COUNT} images`).addClass("text-danger");

    selectedfiles = combinedFile;
    renderBannerImage();

    return selectedfiles;
});

$("#add_product_banner").on("click", function (e) {
    e.preventDefault();

    const formData = new FormData();

    const name = $("#productBannerName").val();
    const status = $("#productBannerStatus").is(":checked") ? 2 : 1;

    let validationMessage = "";
    if (!name) {
        validationMessage = "Banner Name is required. Please enter name.";
    } else if (name && name.length < 3) {
        validationMessage = "Banner Name minimum 3 character.";
    } else if (!status) {
        validationMessage = "Please select status";
    };

    if (validationMessage !== "") {
        showToast(0, validationMessage);
        return;
    };

    selectedfiles.forEach(file => {
        formData.append("banner_image", file);
    });

    formData.append("name", name);
    formData.append("status", status);

    postFileCall("/admin/product-banner-add", formData, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            $("#addEditProductBannerModal").modal("hide");
            filterData("/admin/product-banner-list");
        };
    });
});

$("#thumbnail-preview-container").on("click", ".remove-thumbnail", function () {
    const index = $(this).closest(".gallery-media").data("index");
    selectedfiles.splice(index, 1);
    renderBannerImage();
});

$(document).on("click", ".edit-product-banner", function (e) {
    e.preventDefault();
    $("#thumbnail-preview-container").empty();
    selectedfiles = [];

    const productBannerId = $(this).data("product-banner-id");
    $("#addEditProductBannerModalLabel").text("");
    $("#update_product_banner").data("product-banner-id", "");
    $("#productBannerName").val("");
    $("#productBannerStatus").prop("checked", true);

    postAjaxCall("/admin/product-banner-details", { productBannerId: productBannerId }, function(response) {
        if(response.flag === 1) {
            let {
                name,
                image,
                status,
            } = response.data;

            $("#add_product_banner").addClass("d-none");
            $("#addEditProductBannerModalLabel").text("Update Product Banner");
            $("#update_product_banner").removeClass("d-none");
            $("#update_product_banner").data("product-banner-id", productBannerId);

            $("#productBannerName").val(name);
            $("#productBannerStatus").prop("checked", status === 2);
            
            const $parent = $("#productBannerStatus").parent();
            $parent.removeClass("on off").addClass(status === 2 ? "on" : "off");

            selectedfiles = image.map((img) => img);

            renderBannerImage();
        } else {
            showToast(response.flag, response.msg);
            $("#addEditProductBannerModal").modal("hide");
            filterData("/admin/product-banner-list");
        };
    });
});

$("#update_product_banner").on("click", function (e) {
    e.preventDefault();

    const formData = new FormData();
    const existingFiles = [];

    const productBannerId = $(this).data("product-banner-id");
    const name = $("#productBannerName").val();
    const status = $("#productBannerStatus").is(":checked") ? 2 : 1;

    let validationMessage = "";
    if (!productBannerId) {
        validationMessage = "Banner Id is required.";
    } else if (!name) {
        validationMessage = "Banner Name is required. Please enter name.";
    } else if (name && name.length < 3) {
        validationMessage = "Banner Name minimum 3 character.";
    } else if (!status) {
        validationMessage = "Please select status";
    };

    if (validationMessage !== "") {
        showToast(0, validationMessage);
        return;
    };

    selectedfiles.forEach(file => {
        if (file.isExist) existingFiles.push(file.name.split("/").pop());
        formData.append("banner_image", file);
    });

    formData.append("productBannerId", productBannerId);
    formData.append("metadata", JSON.stringify(existingFiles));
    formData.append("name", name);
    formData.append("status", status);

    postFileCall("/admin/product-banner-update", formData, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            resetProductBannerForm();
            $("#addEditProductBannerModal").modal("hide");
            filterData("/admin/product-banner-list");
        };
    });
});

$(document).on("click", ".delete_product_banner", function (e) {
    e.preventDefault();

    $("#confirm_delete").removeData("product-banner-id");

    const productBannerId = $(this).data("id");

    $("#confirm_delete").data("product-banner-id", productBannerId);
    $("#deleteProductBannerModal").modal("show");
})

$(document).on("click", "#confirm_delete", function () {
    const productBannerId = $(this).data("product-banner-id");
    if (!productBannerId) {
        showToast(0, "Invalid product banner id for deletion.");
        return;
    };

    postAjaxCall("/admin/product-banner-delete", { productBannerId: productBannerId }, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            $("#confirm_delete").removeData("product-banner-id");
            $("#deleteProductBannerModal").modal("hide");
            filterData("/admin/product-banner-list");
        };
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
    filterData("/admin/product-banner-list");
    
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

    $('.filter-status .hr-line-sm').removeClass('active');
    $('.filter-status .filter-data').html("").removeClass('active');
    $('#status-select').val("")

    $('#resetFilters').addClass('d-none');
    
    filter.name = "";
    filter.duration = "";
    filter.status = "";
    filterData("/admin/product-banner-list");
});

$(document).on("click", "#clearName", function () {
    $('#nameInput').val("");
    $('#applyName').prop('disabled', true);
    
    $('.filter-name .hr-line-sm').removeClass('active');
    $('.filter-name .filter-data').html("").removeClass('active');
    
    
    filter.name = "";
    filterData("/admin/product-banner-list");

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
    filterData("/admin/product-banner-list");
    
    $('#resetFilters').removeClass('d-none');
});

$("#productBannerStatus").on("change", function(e){
    if( $(this).is(":checked")){
        $(this).parent().removeClass("off").addClass("on")
    } else{
        $(this).parent().removeClass("on").addClass("off")
    };
});

function renderBannerImage(){
    $("#thumbnail-preview-container").empty();

    selectedfiles.forEach((file, index) => {
        if(typeof file === "string" && file.startsWith("http://")) {
            fetch(file).then(response=> response.blob()).then(blob => {
                const fileblob = new File([blob], file, { type: blob.type })
                fileblob.isExist = true;
                selectedfiles[index] = fileblob; 
                renderByfileReader(fileblob, index);
            })
        } else {
            renderByfileReader(file, index);
        };
    });
};

function renderByfileReader(file, index){
    let fileReader = new FileReader();
    fileReader.onload = function(event) {
        const imgDataURL = event.target.result;
        let thumbnailHtml = ` <div class="gallery-media position-relative" data-index="${index}">
            <span class="remove-thumbnail" style="cursor:pointer;">
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="m15 9-6 6"></path>
                <path d="m9 9 6 6"></path>
            </svg>
            </span>
            <a href="${imgDataURL}" data-fancybox="gallery">
            <img src="${imgDataURL}" alt="">
            </a>
        </div> `; 
        $("#thumbnail-preview-container").append(thumbnailHtml);
    };
    fileReader.readAsDataURL(file);
};

// reset productBanner form
function resetProductBannerForm() {
    $("#addEditProductBannerModalLabel").text("Add Product Banner");
    $("#productBannerName").val("");
    $("#productBannerStatus").prop("checked", true);
    $("#update_product_banner").addClass("d-none");
    $("#add_product_banner").removeClass("d-none");
}
