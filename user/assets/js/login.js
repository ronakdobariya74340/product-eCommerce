$(document).ready(function(){
    $("#email").val("");
    $("#password").val("");
    $("#login_btn").addClass("btn-disabled");
});

$(document).on("keyup", "#email, #password", function () {
    const email = $("#email").val();
    const password = $("#password").val();

    if(email && password){
        $("#login_btn").removeClass("btn-disabled");
    } else {
        $("#login_btn").addClass("btn-disabled");
    };
});

$(document).on('keydown', '#email, #password', function(e){
    if (e.key === "Enter" || e.which === 13) {
        e.preventDefault();
        if (!$(this).data("enterPressed")) {
            $(this).data("enterPressed", true);
            $("#login_btn").trigger("click");
        };
    };
});

$(document).on("click", "#togglePasswordVisibility", function (e) {
    e.stopPropagation();
    const passwordField = $("#password");
    const isHidden = passwordField.attr("type") === "password";

    passwordField.attr("type", isHidden ? "text" : "password");

    // Toggle visibility of both eye icons
    $("#ey1").toggleClass("d-none", !isHidden);
    $("#ey2").toggleClass("d-none", isHidden);
});

$(document).on("click", "#login_btn", function (e) {
    e.preventDefault();
    const email = $("#email").val();
    const password = $("#password").val();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/; 
    const passwordRegex =/^(?=.*[A-Z])(?=.*\d).{6,}$/

    let validationMessage = "";   
    if (email?.length === 0) {
        validationMessage = "Email is required. Please enter your email address.";
    } else if (!emailRegex.test(email)) {
        validationMessage = "Please enter a valid email address.";
    } else if (!emailRegex.test(email)) {
        validationMessage = "Invalid email address. Please enter a valid email address.";
    } else if (email.length > 255) {
        validationMessage = 'Email address is too long. Please enter a shorter email address.';
    } else if (password.length === 0) {
        validationMessage = "Password is required. Please enter your password.";
    } else if (password.length > 0 && password.length < 6) {
        validationMessage = "Please provide a valid password with a minimum length of 6 characters.";
    }else if (!passwordRegex.test(password)) {
        validationMessage = "Password must be at least 6 characters long, contain at least one uppercase letter and one number.";
    }

    if (validationMessage !== "") {
        $(".spinner-btn").removeClass("disabled");
        showToast(0, validationMessage);
        return;
    };

    const requestData = {
        email: email,
        password: password,
    };

    $(".spinner-btn").addClass("disabled");
    postAjaxCall("/auth/login", requestData, function (response) {
        showToast(response.flag, response.msg);
        $(".spinner-btn").removeClass("disabled");
        if (response.flag === 1) {
            if(response.data?.google2faStatus){
                $("#signinModal").modal("hide");
                $("#2fa-modal").modal("show");
                $("#2FA-email-input").val(response.data?.email);
                return;
            }
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        } else {
            $("#login_btn").removeClass("btn-disabled");
            $("#email").data("enterPressed", false);
            $("#password").data("enterPressed", false);
        };

        if(response.data?.status){
            resendOtp(response.data?.token)
            $("#verify_token_id").val(response.data?.token);
            $("#signinModal").modal("hide");
            $("#verify-account-modal").modal("show");
            $("#verify-account-email span").text(`${email[0]}${"*".repeat(Math.max(0, 5))}${email[email.indexOf("@") - 1]}${email.slice(email.indexOf("@"))}`);
        }
    });
});

$("#signinModal, #forgot-password-modal").on("hidden.bs.modal", function () {
    $("#email").val("");
    $("#password").val("");
    $("#login_btn").addClass("btn-disabled");
    $("#email").data("enterPressed", false);    
    $("#password").data("enterPressed", false);
    $("#forgot-password-email-input").val("");
});


$('[data-bs-target="#forgot-password-modal"]').on("click", function (e) {
    e.preventDefault();

    $("#forgot-password-email-input").val();
    $("#send-reset-link-btn").prop("disabled", true).addClass("btn-disabled")
})

$("#forgot-password-email-input").on("input", function () {
    const email = $(this).val().trim();
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (email && emailRegex.test(email)) {
        $("#send-reset-link-btn").prop("disabled", false).removeClass("btn-disabled")
    } else {
        $("#send-reset-link-btn").prop("disabled", true).addClass("btn-disabled")
    }
})

let token = null;
$("#send-reset-link-btn").on("click", function (e) {
    e.preventDefault();
    $("#send-reset-link-btn").prop("disabled", true).addClass("btn-disabled")
    forgotPassword($("#forgot-password-email-input").val().trim());
})

$("#reset-password-modal").on("show.bs.modal", function (e) {
    $("#reset-password-verify-otp-input").val("");
    $("#new-password-input").val("");
    $("#verify-reset-btn").addClass("btn-disabled");
    startResendOtpTimer();
})

$("#reset-password-verify-otp-input, #new-password-input").on("input", function () {
    const otpValue = $("#reset-password-verify-otp-input").val().replace(/[^0-9]/g, '').slice(0, 6);
    $("#reset-password-verify-otp-input").val(otpValue);

    if (otpValue.length === 6 && $("#new-password-input").val().length >= 6) {
        $("#verify-reset-btn").removeClass("btn-disabled");
    } else {
        $("#verify-reset-btn").addClass("btn-disabled");
    }
})

$(document).on("click","#verify-reset-btn", function (e) {
    e.preventDefault();
    const passwordRegex =/^(?=.*[A-Z])(?=.*\d).{6,}$/  
    
    //  password validation
    const password = $("#new-password-input").val().trim();
    let validationMessage = "";
    if (password.length < 6) {
       validationMessage ="Please provide a valid password with a minimum length of 6 characters."
    } else if (!passwordRegex.test(password)) {
        validationMessage = "Password must be at least 6 characters long, contain at least one uppercase letter and one number."
    }

    if (validationMessage !== "") {
        showToast(0, validationMessage);
        $(".spinner-btn").removeClass("disabled");
        $("#verify-reset-btn").prop("disabled", false);
        return;
    };
    ResetPassword(otp = $("#reset-password-verify-otp-input").val(), token, password);
})

// Resend button click
$(".resend-reset-btn").on("click", function (e) {
    e.preventDefault();
    startResendOtpTimer();
    resendRestOtp();
});

$(document).on('submit', '.auth-form form', function (e) {
    e.preventDefault();
});

// resend Otp 
function resendRestOtp() {
    postAjaxCall("/auth/reset-password/resend-otp", { token }, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            startResendOtpTimer();
            $("#reset-password-verify-otp-input").val('');
            $("#verify-reset-btn").addClass("btn-disabled");
        } else{
            $(".spinner-btn").removeClass("btn-disabled");
        }
    });
}

function startResendOtpTimer(duration = countdownTime) {
    let remaining = duration;
    const $timer = $("#resend-reset-timer");
    const $resend = $(".resend-reset-btn");

    $timer.removeClass("d-none").text(formatTime(remaining));
    $resend.addClass("d-none");
    $resend.prop("disabled", true);

    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
        remaining--;

        if (remaining >= 0) {
            $timer.text(formatTime(remaining));
        }

        if (remaining <= 0) {
            clearInterval(timerInterval);
            $timer.addClass("d-none")
            $resend.removeClass("d-none");
            $resend.prop("disabled", false);
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}

function forgotPassword(email){
    postAjaxCall("/auth/reset-password/send-otp", { email: email }, function (response) {
        $(".spinner-btn").removeClass("disabled");
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            token = response.data.token;
            $("#forgot-password-modal").modal("hide");
            $("#reset-password-modal").modal("show");
            $("#reset-password-verify-otp-email span").text(`${email[0]}${"*".repeat(Math.max(0, 5))}${email[email.indexOf("@") - 1]}${email.slice(email.indexOf("@"))}`);
        } 
    })
}

function ResetPassword(otp, token, password){
    postAjaxCall("/auth/reset-password", { otp, token, password }, function (response) {
        $(".spinner-btn").removeClass("disabled");
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            $("#reset-password-modal").modal("hide");
            $("#reset-password-successful-modal").modal("show");
        } else {
            $("#verify-reset-btn").removeClass("btn-disabled");
            $("#reset-password-verify-otp-input").data("enterPressed", false);
            $("#new-password-input").data("enterPressed", false);
        }
    })
}