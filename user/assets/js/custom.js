var amountScrolled = 200;
var amountScrolledNav = 25;
let correctAnswer = 0;
const lastAttempts = 0;
const lockoutMinutes = 10;
const countdownTime = 120;

$(window).scroll(function () {
    if ($(window).scrollTop() > amountScrolled) {
        $("button.back-to-top").addClass("show");
    } else {
        $("button.back-to-top").removeClass("show");
    }
});

$(document).ready(function () {
    getAllTotalQuantity();
});

// copy function
$(document).on("click", ".copy-btn", function () {
    const $btn = $(this);
    const copyText = $btn.attr("data-text");

    if (!copyText) return;

    // ✅ Check if inside a visible modal
    const $activeModal = $btn.closest(".modal.show");
    const targetContainer = $activeModal.length > 0 ? `#${$activeModal.attr("id")}` : "body";

    const $tempInput = $("<input>");
    $(targetContainer).append($tempInput);
    $tempInput.val(copyText).select();
    document.execCommand("copy");
    $tempInput.remove();

    // Tooltip logic
    const $tooltip = $btn.closest(".c-tooltip");
    $tooltip.attr("tooltip-text", "Copied");

    const $copiedText = $btn.find(".copied-text");
    $copiedText.addClass("show");

    setTimeout(() => {
        $tooltip.attr("tooltip-text", "Copy to Clipboard");
        $copiedText.removeClass("show");
    }, 1000);
});

$(document).on("click", ".inp-elem.eye", function (e) {
    const $input = $(this).siblings("input");
    const isVisible = $input.attr("type") === "text";

    $input.attr("type", isVisible ? "password" : "text");
    $(this).toggleClass("show");
});

$(".back-to-login").on("click", function(e){
    e.preventDefault();
    $(".modal.show").modal("hide");
    $("#signinModal").modal("show");
})

function getAllTotalQuantity() {
    getAjaxCall(`/total-cart-item?_=${new Date().getTime()}`, function (response) {
        if (response.flag === 1) {
            $("#total_quantity_val").text(response.data.totalQuantity);
            $("#total_quantity_val").attr("data-total-quantity", response.data.totalQuantity);
        };
    });
};

// ==================
document.addEventListener('DOMContentLoaded', function () {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    const tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
});
