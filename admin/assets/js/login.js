$(document).ready(function(){
    $("#email").val("");
    $("#password").val("");
    $("#login").attr("disabled", true);
});

$(document).on("keyup", "#email, #password", function () {
    const email = $("#email").val();
    const password = $("#password").val();

    if (email && password) {
        $("#login").attr("disabled", false);
    } else {
        $("#login").attr("disabled", true);
    };
});

$(document).on('keydown', '#email, #password', function(e){
    if (e.key === "Enter" || e.which === 13) {
        e.preventDefault();
        if (!$(this).data("enterPressed")) {
            $(this).data("enterPressed", true);
            $("#login").trigger("click");
        };
    }
});

$(document).on("click", "#login", function (e) {
    e.preventDefault();
    
    const email = $("#email").val();
    const password = $("#password").val();

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$/;

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
    };

    if (validationMessage !== "") {
        showToast(0, validationMessage);
        return;
    };

    const requestData = {
        email: email,
        password: password
    };

    $(this).attr("disabled", true);

    postAjaxCall("/admin/login", requestData, function (response) {
        showToast(response.flag, response.msg);
        if (response.flag === 1) {
            setTimeout(() => {
                window.location.href = "/admin/dashboard";
            }, 1000);
        } else {
            $("#login").attr("disabled", false);
            $("#email").data("enterPressed", false);
            $("#password").data("enterPressed", false);
        };
    });
});

$('#ey2').click(function() {
    var passwordField = $('#password');
    if (passwordField.attr('type') === 'password') {
        passwordField.attr('type', 'text');  
        $(this).removeClass('fa-eye-slash').addClass('fa-eye');  
    } else {
        passwordField.attr('type', 'password');  
        $(this).removeClass('fa-eye').addClass('fa-eye-slash');  
    }
});