let MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
let MAX_FILE_COUNT = 5; // Maximum number of files allowed
let selectedfiles = []; 
let selectedBgImgfiles = []; 

$('[data-fancybox="gallery"]').fancybox({
    buttons: ["zoom", "fullScreen", "close"],
    loop: false,
    protect: true,
});


$(document).ready(function() {
    filterData("/admin/product-list");

    $("#productName").val("");
    $("#productImageInput").val("");
    $("#backgroundImageInput").val("");
    selectedfiles = [];
    selectedBgImgfiles = [];
    $("#thumbnail-preview-container").empty();
    $("#thumbnail_bgImg_preview_container").empty();
});

$(document).on("click", "#add_new_product", function (e) {
    e.preventDefault();

    selectedfiles = [];
    selectedBgImgfiles = [];

    $("#addProductModalLabel").text("Add New Product");
    $("#productName").val("");
    $("#product_category_id").val("");
    $("#productImageInput").val("");
    $("#backgroundImageInput").val("");
    $("#productPrice").val("");
    $("#product_status").prop("checked", true);
    $("#description").val("");
    $("#thumbnail-preview-container").empty();
    $("#thumbnail_bgImg_preview_container").empty();
    $("#update_product").addClass("d-none");
    $("#add_product").removeClass("d-none");
});

$("#product_status").on("change", function(e){
    if( $(this).is(":checked")){
        $(this).parent().removeClass("off").addClass("on")
    }else{
        $(this).parent().removeClass("on").addClass("off")
    }
})

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
    renderProductImage();

    return selectedfiles;
});

$("#backgroundImageInput").on("change", function (e) {
    const images = $(this)[0];
    const newFiles = Array.from(images.files);
    let overSizedImage = Array.from(images.files)?.filter(file => file.size > MAX_FILE_SIZE);

    $("#image-alert").text("");
    if (overSizedImage.length > 0 ) return $("#image-alert").text(`Image size should be less than ${MAX_FILE_SIZE / (1024 * 1024)} MB`);

    let combinedFile = [...selectedBgImgfiles, ...newFiles]?.filter(file => file.type.startsWith('image/') && file.size <= MAX_FILE_SIZE);
    $("#image-alert").text("");
    if(combinedFile.length > MAX_FILE_COUNT) return $("#image-alert").text(`You can upload a maximum of ${MAX_FILE_COUNT} images`).addClass("text-danger");

    selectedBgImgfiles = combinedFile;
    renderBackgroundImage();

    return selectedBgImgfiles;
});

$("#add_product").on("click", function(e) {
    e.preventDefault();

    const formData = new FormData();

    const product_name = $("#productName").val().trim();
    const product_category_id = $("#product_category_id").val();
    const product_price = $("#productPrice").val().trim();
    const productStatus = $("#product_status").is(":checked") ? 2 : 1;
    const description = $("#description").val();

    let validationMessage = "";
    if (!product_name) {
        validationMessage = "Product Name is required. Please enter name.";
    } else if (product_name && product_name.length < 3) {
        validationMessage = "Product Name minimum 3 character.";
    } else if (!product_price || parseInt(product_price) === 0) {
        validationMessage = "Please Enter product price.";
    } else if (!selectedfiles.length) {
        validationMessage = "Please select at least one profile image";
    } else if (!selectedBgImgfiles.length) {
        validationMessage = "Please select at least one background image";
    } else if (!product_category_id) {
        validationMessage = "Please select product category";
    } else if (!productStatus) {
        validationMessage = "Please select product status";
    };

    if (validationMessage !== "") {
        showToast(0, validationMessage);
        return;
    };

    selectedfiles.forEach(file => {
        formData.append("product_image", file);
    });

    selectedBgImgfiles.forEach((file) => {
        formData.append("backgroung_image", file);
    });

    formData.append("name", product_name);
    formData.append("productCategoryId", product_category_id);
    formData.append("productPrice", product_price);
    formData.append("productStatus", productStatus);
    formData.append("description", description || "");

    postFileCall("/admin/add-product", formData, function(response) {
        showToast(response.flag, response.msg);
        if(response.flag === 1) {
            $("#addProductModal").modal("hide");
            filterData("/admin/product-list");
        };
    });
});

$("#thumbnail-preview-container").on("click", ".remove-thumbnail", function () {
    const index = $(this).closest(".gallery-media").data("index");
    selectedfiles.splice(index, 1);
    renderProductImage();
});

$("#thumbnail_bgImg_preview_container").on("click", ".remove-thumbnail", function () {
    const index = $(this).closest(".gallery-media").data("index");
    selectedBgImgfiles.splice(index, 1);
    renderBackgroundImage();
});

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
    filterData("/admin/product-list");
    
    $('#resetFilters').removeClass('d-none');
    $('#clearName').prop('disabled', false);
});

$(document).on("click", "#resetFilters", function () {

    $('#nameInput').val("");
    $('#applyName').prop('disabled', true);
    $('#clearName').prop('disabled', true);
    $('.filter-name .hr-line-sm').removeClass('active');
    $('.filter-name .filter-data').html("").removeClass('active');


    $('#resetFilters').addClass('d-none');
    
    filter.name = "";
    filterData("/admin/product-list");
});

$(document).on("click", "#clearName", function () {
    $('#nameInput').val("");
    $('#applyName').prop('disabled', true);
    
    $('.filter-name .hr-line-sm').removeClass('active');
    $('.filter-name .filter-data').html("").removeClass('active');
    
    filter.name = "";
    filterData("/admin/product-list");

    const status = $('.filter-status .filter-data').html();
    if (!status) {
        $('#resetFilters').addClass('d-none');
    }
    $('#clearName').prop('disabled', true);
});

$(document).on("click", ".editProduct", function(e){
    e.preventDefault();
    $("#thumbnail-preview-container").empty();
    $("#thumbnail_bgImg_preview_container").empty();

    selectedfiles = [];
    selectedBgImgfiles = [];

    const product_id = $(this).data("product-id");

    $("#addProductModalLabel").text("");
    $("#update_product").data("product-id", "");
    $("#product_category_id").val("");
    $("#productName").val("");
    $("#productPrice").val("");
    $("#product_status").prop("checked", true);
    $("#description").val("");

    postAjaxCall("/admin/product-details", { productId: product_id }, function(response) {
        if(response.flag === 1) {
            let {
                name,
                image,
                backgroundImage,
                productPrice,
                productCategoryId,
                status,
                description,
            } = response.data;

            $("#addProductModalLabel").text("Edit Product");
            $("#update_product").removeClass("d-none");
            $("#update_product").data("product-id", product_id);
            $("#add_product").addClass("d-none");

            $("#product_category_id").val(productCategoryId);
            $("#productName").val(name);
            $("#productPrice").val(productPrice);
            $("#description").val(description);
            $("#product_status").prop("checked", status === 2);

            const $parent = $("#product_status").parent();
            $parent.removeClass("on off").addClass(status === 2 ? "on" : "off");

            selectedfiles = image.map((img) => img);
            selectedBgImgfiles = backgroundImage.map((bg) => bg);

            renderProductImage();
            renderBackgroundImage();
        } else {
            showToast(response.flag, response.msg);
            $("#addProductModal").modal("hide");
            filterData("/admin/product-list");
        };
    });
})

$("#update_product").on("click", function (e) {
    e.preventDefault();

    const formData = new FormData();
    const existingFiles = [];
    const existingBgImgFiles = [];

    const product_id = $(this).data("product-id");
    const product_name = $("#productName").val().trim();
    const product_category_id = $("#product_category_id").val();
    const product_price = $("#productPrice").val().trim();
    const productStatus = $("#product_status").is(":checked") ? 2 : 1;
    const description = $("#description").val();

    let validationMessage = "";
    if (!product_id) {
        validationMessage = "Product Id is required.";
    } else if (!product_name) {
        validationMessage = "Product Name is required. Please enter name.";
    } else if (product_name && product_name.length < 3) {
        validationMessage = "Product Name minimum 3 character.";
    } else if (!product_price || parseInt(product_price) === 0) {
        validationMessage = "Please enter product price.";
    } else if (!selectedfiles.length) {
        validationMessage = "Please select at least one profile image";
    } else if (!selectedBgImgfiles.length) {
        validationMessage = "Please select at least one background image";
    } else if (!product_category_id) {
        validationMessage = "Please select product type";
    } else if (!productStatus) {
        validationMessage = "Please select product status";
    };

    if (validationMessage !== "") {
        showToast(0, validationMessage);
        return;
    };

    selectedfiles.forEach(file => {
        if (file.isExist) existingFiles.push(file.name.split("/").pop());
        formData.append("product_image", file);
    });

    selectedBgImgfiles.forEach((file) => {
        if (file.isExist) existingBgImgFiles.push(file.name.split("/").pop());
        formData.append("backgroung_image", file);
    });

    formData.append("product_id", product_id);
    formData.append("metadata", JSON.stringify(existingFiles));
    formData.append("bgImgMetadata", JSON.stringify(existingBgImgFiles));
    formData.append("name", product_name);
    formData.append("productCategoryId", product_category_id);
    formData.append("productPrice", product_price);
    formData.append("productStatus", productStatus);
    formData.append("description", description || "");

    postFileCall("/admin/product-update", formData, function(response) {
        showToast(response.flag, response.msg);
        if(response.flag === 1) {
            $("#addProductModal").modal("hide");
            filterData("/admin/product-list");
        };
    });
});

$(document).on("click", ".delete_product", function (e) {
    e.preventDefault();

    $("#confirm_delete").removeData("product-id");

    const productId = $(this).data("id");

    $("#confirm_delete").data("product-id", productId);
    $("#deleteProductModal").modal("show");
});

$("#confirm_delete").on("click", function () {
    const productId = $(this).data("product-id");
    if (!productId) {
        showToast(0, "Invalid product id for delete.");
        return;
    };

    postAjaxCall("/admin/product-delete", { product_id: productId }, function (response) {
        showToast(response.flag, response.msg);

        if (response.flag === 1) {
            $("#confirm_delete").removeData("product-id");
            $("#deleteProductModal").modal("hide");
            filterData("/admin/product-list");
        };
    });
});

function renderProductImage(){
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

function renderBackgroundImage(){
    $("#thumbnail_bgImg_preview_container").empty();

    selectedBgImgfiles.forEach((file, index) => {
        if(typeof file === "string" && file.startsWith("http://")) {
            fetch(file).then(response=> response.blob()).then(blob => {
                const fileblob = new File([blob], file, { type: blob.type })
                fileblob.isExist = true;
                selectedBgImgfiles[index] = fileblob; 
                renderByBgImagefileReader(fileblob, index);
            })
        } else {
            renderByBgImagefileReader(file, index);
        };
    });
};

// fucntion to render by fileReader
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

function renderByBgImagefileReader(file, index){
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
        $("#thumbnail_bgImg_preview_container").append(thumbnailHtml);
    };
    fileReader.readAsDataURL(file);
};