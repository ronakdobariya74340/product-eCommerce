let timerInterval;

$(document).ready(function(){
    $("#username").val("");
    $("#register_email").val("");
    $("#register_password").val("");
    $("#terms_checkbox").prop("checked", false);
    $("#register_btn").addClass("btn-disabled");
});

$("#signup-modal").on("show.bs.modal", function(e){
    $("#username").val("");
    $("#register_email").val("");
    $("#register_password").val("");
    $("#register_btn").addClass("btn-disabled");

    $("#terms_checkbox").prop("checked", false);

})

$(document).on("keyup", "#register_form input", function () {
    const username = $("#username").val();
    const email = $("#register_email").val();
    const password = $("#register_password").val();

    $("#register_form input").data("enterPressed", false);

    if(username !== "" && email !== "" && password !== ""){
        $("#register_btn").removeClass("btn-disabled");
    } else {
        $("#register_btn").addClass("btn-disabled");
    };
});

$(document).on("keypress", "#register_form input", function(e){
    if (e.key === "Enter" || e.which === 13) {
        e.preventDefault();
        if (!$(this).data("enterPressed")) {
            $(this).data("enterPressed", true);
            $("#register_btn").trigger("click");
        };
    };
});

let registerToken = "";
$(document).on("click", "#register_btn", function (e) {
    e.preventDefault();

    const username = $("#username").val();
    const email = $("#register_email").val();
    const password = $("#register_password").val();
    const terms_checkbox = $("#terms_checkbox").is(":checked");

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;
    const passwordRegex =/^(?=.*[A-Z])(?=.*\d).{6,}$/  

    let validationMessage = "";
    if (!username) {
        validationMessage = "Username is required. Please enter your user name.";
    } else if (username && username.length < 3) {
        validationMessage = "Username minimum 3 character.";
    } else if (email?.length === 0) {
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
    } else  if (!passwordRegex.test(password)) {
        validationMessage = "Password must be at least 6 characters long, contain at least one uppercase letter and one number.";
    } else if(!terms_checkbox){
        validationMessage = "Please Checked Terms and Conditions and Privacy Policy.";
    };

    if (validationMessage !== "") {
        $(".spinner-btn").removeClass("disabled");
        showToast(0, validationMessage);
        return;
    };

    const requestData = {
        username: username,
        email: email,
        password: password,
    };
    
    $("#register_form input").data("enterPressed", true);
    $(this).addClass("btn-disabled");

    postAjaxCall("/auth/register", requestData, function (response) {
        showToast(response.flag, response.msg);
        $(".spinner-btn").removeClass("disabled");
        if (response.flag === 1) {
            const { token, endtime } = response.data;
            registerToken = token;
            $("#username").val("");
            $("#register_email").val("");
            $("#register_password").val("");
            $("#register_btn").addClass("btn-disabled");
            setTimeout(() => {
                // window.location.href = `/auth/register/verify-otp?token=${token}`;
                $("#signup-modal").modal("hide");
                $("#verify_token_id").val(token);
                $("#verify-account-email span").text(`${email[0]}${"*".repeat(Math.max(0, 5))}${email[email.indexOf("@") - 1]}${email.slice(email.indexOf("@"))}`);

                $("#verify-account-modal").modal("show");
            }, 5);
        } else {
            $("#register_btn").removeClass("btn-disabled");
            $("#register_form input").data("enterPressed", false);
        };
    });
});

// verify otp
$(document).on('submit', '.auth-form form', function (e) {
    e.preventDefault();
});

$(document).on("input", "#otp-input", function (e) {
    e.preventDefault()
    let otpValue = $(this).val().replace(/[^0-9]/g, '');
    otpValue = otpValue.slice(0, 6);
    $(this).val(otpValue);

    if (otpValue.length === 6) {
        $(".spinner-btn").removeClass("btn-disabled");
    } else {
        $(".spinner-btn").addClass("btn-disabled");
    }
});

$(document).on("click", "#verify-otp", function (e) {
    e.preventDefault();
    $(".spinner-btn").addClass("disabled");
    
    const otp = $("#otp-input").val();
    const token = $("#verify_token_id").val();
    const ua = {
        deviceType: result.device.type || 'web',
        deviceVendor: result.device.vendor || '',
        deviceModel: result.device.model || '',
        os: result.os.name || '',
        browser: result.browser.name || '',
        userAgent: navigator.userAgent 
      }

    postAjaxCall("/auth/register/verify-otp", { otp, token, ua }, function (response) {
        showToast(response.flag, response.msg);
        $(".spinner-btn").removeClass("disabled");
        if (response.flag === 1) {
            $("#verify_token_id").val("");
            $("#otp-input").val("");
            setTimeout(() => {
                $("#verify-account-modal").modal("hide");
            }, 1000);
        } else {
            $(".spinner-btn").removeClass("btn-disabled");
        }
    });
});


// Resend button click
$(document).on("click", ".resend-btn", function (e) {
    e.preventDefault();
    startOtpTimer();
    resendOtp(registerToken);

});

// Start on modal open (optional)
$(document).on("shown.bs.modal", "#verify-account-modal", function (e) {
    startOtpTimer();
});

// // resend Otp 
function resendOtp(registerToken) {
    postAjaxCall("/auth/register/resend-otp", { token: registerToken }, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            startOtpTimer();
            $("#otp-input").val('');
            $(".spinner-btn").addClass("btn-disabled");
        } else {
            $(".spinner-btn").removeClass("btn-disabled");
        }
    });
}

function startOtpTimer(duration = countdownTime) {
    let remaining = duration;
    const $timer = $("#resend-timer");
    const $resend = $(".resend-btn");

    $timer.removeClass("d-none").text(formatTime(remaining));
    $resend.addClass("d-none");

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
        }
    }, 1000);
}

function formatTime(seconds) {
    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
}