$(document).ready(function() {
    const maintenanceValue = $('#maintenance_mode').val();

    if (maintenanceValue == '1') {
        $('#maintenance_mode').prop('checked', true);
    };
    if (maintenanceValue == '0') {
        $('#maintenance_mode').prop('checked', false);
    };

    $('#maintenance_mode').change(function() {
        if ($(this).is(':checked')) {
            $(this).val('1');
        } else {
            $(this).val('0');
        }
    });
});

$(document).on('click', '#updateSettings', function() {
    const login_secret_token = $('#login_secret_token').val();
    const maintenance_mode = $('#maintenance_mode').val();

    const data = {
        login_secret_token: login_secret_token,
        maintenance_mode: maintenance_mode,
    };

    postAjaxCall("/admin/update-settings", data, function(response) {
        showToast(response.flag, response.msg);
    });
});

$(document).on('input', '#new_password, #confirm_password', function() {
    const new_password = $('#new_password').val();
    const confirm_password = $('#confirm_password').val();

    if (new_password && confirm_password) {
        $('#updatePassword').attr('disabled', false);
    } else {
        $('#updatePassword').attr('disabled', true);
    };
});

$(document).on('click', '#updatePassword', function() {
    const new_password = $('#new_password').val();
    const confirm_password = $('#confirm_password').val();

    const data = {
        new_password: new_password,
        confirm_password: confirm_password,
    };

    postAjaxCall("/admin/update-password", data, function(response) {
        showToast(response.flag, response.msg);
        const login_secret_token = response.data.login_secret_token;
        if (response.flag == 1) {
            setTimeout(function() {
                window.location.href = "/admin/login/" + login_secret_token;
            }, 1000);
        };
    });
});

$(document).on('keypress', '#new_password, #confirm_password', function(e){
    if (e.key === "Enter") {
        $('#updatePassword').click();
    };
});

// eye on off
$('#ey2, #ey3').on("click", function () {
    const isEy2 = $(this).attr("id") === "ey2";
    const passwordField = isEy2 ? $('#new_password') : $('#confirm_password');
  
    if (passwordField.attr('type') === 'password') {
      passwordField.attr('type', 'text');
      $(this).removeClass('fa-eye-slash').addClass('fa-eye');
    } else {
      passwordField.attr('type', 'password');
      $(this).removeClass('fa-eye').addClass('fa-eye-slash');
    }
  });
  