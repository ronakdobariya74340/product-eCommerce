var filter_url = '';
var filter = {
    totalItems: 0,
    itemPerPage: 10,
    currentPage: 1,
    totalPages: 1
};
var multipleFilter = [];

$(document).ready(function() {
    $('#recordPerPage').val(filter.itemPerPage);
    $('#status_search').trigger('focus');

    $(document).on('click', '.page_no', function() {
        var cp = $(this).data('page');
        var table = $(this).data('table');

        filter.currentPage = cp;
        var furl = multipleFilter[table]['filter_url'];
        filterData(furl, table);
    });
});

$(document).on("click", ".copy-btn", function() {
    var copyText = $(this).data("copy-text");
    var temp = $("<input>");
    $("body").append(temp);
    temp.val(copyText).select();
    document.execCommand("copy");
    temp.remove();
    const tooltip = $(this).closest(".c-tooltip");
    tooltip.attr("tooltip-text", "Copied");
    $(this).attr("src", "/assets/images/check.svg");
    setTimeout(() => {
        $(this).attr("src", "/assets/images/copy.svg");
        tooltip.attr("tooltip-text", "Copy to Clipboard");
    }, 1000); 
});

function changeRecordPerPage(url, table) {
    var id = '';
    if (typeof table !== 'undefined') {
        id = '-' + table;
    };

    var recPp = $('#recordPerPage' + id).val();
    if (isNaN(recPp)) {
        return false;
    } else if (recPp === "") {
        filter.itemPerPage = 10;
        $("#recordPerPage").val(10);
    } else if (recPp < 1) {
        return false;
    } else {
        filter.itemPerPage = parseInt(recPp);
    };

    filter.currentPage = 1;

    if (typeof table === 'undefined') {
        table = 'table-data';
    };

    filterData(url, table);
};

async function filterData(url, table) {
    $(".search_btn_show").attr('disabled', true);
    var token = $("#token").val();
    filter._token = token;

    if (typeof table === 'undefined') {
        table = 'table-data';
    };

    var flush = 1;
    if (typeof multipleFilter[table] !== 'undefined' && typeof multipleFilter[table]['filter'] !== 'undefined') {
        flush = 0;
        $.each(multipleFilter[table]['filter'], function(k, v) {
            if (typeof filter[k] === 'undefined') {
                filter[k] = v;
            };
        });
    } else {
        multipleFilter[table] = {};
    };

    var jdata = filter;
    filter_url = url;
    $(".pagination").addClass("btn-disabled");
    $(".pagination li").addClass("btn-disabled"); 

    await $.ajax({
        type: 'POST',
        url: url,
        data: JSON.stringify(jdata),
        dataType: "json",
        contentType: "application/json",
        success: function(res) {
            if (res.flag === 0) {
                filter.totalItems = 0;
                filter.totalPages = 0;
                $("#" + table).html("");
                $(".pagination").html("");
            } else {
                $("#" + table).html(res.blade);
                filter.totalItems = res["total_record"];

                if( filter.totalItems <= 10){
                    $('.pagination-area').addClass('d-none');
                    $("#pagination_section").addClass("d-none");
                } else {
                    $('.pagination-area').removeClass('d-none');
                    $("#pagination_section").removeClass("d-none");
                };

                filter.totalPages = filter.totalItems > 0 ? Math.ceil(filter.totalItems / filter.itemPerPage) : 0;
                if(filter.totalPages > 0){
                    $("#pagination-div").removeClass("d-none");
                    $("#main_pagination_div").removeClass("d-none");
                    setPagination(table);
                } else {
                    $("#pagination-div").addClass("d-none");
                    $("#main_pagination_div").addClass("d-none");
                    $(".pagination").html("");
                };
            };

            if (res['is_filter_visible'] == 0) {
                $(`#${table}-list-pagination`).addClass("d-none");
            } else {
                $(`#${table}-list-pagination`).removeClass("d-none");
            };

            $(".pagination").removeClass('btn-disabled');
            $(".pagination li a").removeClass("btn-disabled"); 
            $("#search_option_bet").removeClass("btn-disabled");
            $("#wizard-next").removeClass("btn-disabled");

            multipleFilter[table]['filter'] = filter;
            multipleFilter[table]['filter_url'] = filter_url;
            flushFilters(flush);
            $(".search_btn_show").attr('disabled', false);
        },
    }).fail(function () {
        $(".pagination li a").removeClass("btn-disabled"); 
    });
};

function setFilters(searchObject, removeField) {
    filter = {...filter, ...searchObject};

    if(removeField) {
        filter[removeField] = "";
    };
    filter.currentPage = 1;
};

function resetFilters(searchObject, table) {
    if (typeof table !== "undefined" && typeof multipleFilter[table] !== "undefined") {
        multipleFilter[table]["filtfilterers"] = filter;
    };

    filter = {...filter, ...searchObject};
    filter.currentPage = 1;

    if (filter?.multiselect?.length == 0) {
        delete filter.multiselect;
    };
};

function flushFilters(keep) {
    if (keep) {
        filter = {
            totalItems: 0,
            itemPerPage: filter.itemPerPage,
            currentPage: 1,
            totalPages: 1,
        };
    } else {
        filter = {};
    };
};

function paginationInput(e, cp, tp, table) {
    let newPage = $(e.target).val();
    if (!newPage) return false;

    newPage = Number(newPage);
    const currentPage = Number(cp);
    const totalPage = Number(tp);

    if (Number.isNaN(newPage) || Number.isNaN(totalPage) || newPage <= 0 || newPage > totalPage) {
        $(e.target).val(currentPage);
        return;
    };

    filter.currentPage = newPage;
    var furl = multipleFilter[table]["filter_url"];
    filterData(furl, table);
};

function setPagination(table) {
    var tp = filter.totalPages;
    var cp = filter.currentPage;
    var p = prevPage(cp, tp, 0);
    var li = '';

    var fl = '<li class="page-item"><a class="page-link page_no" data-page="' + 1 + '"  data-table="' + table + '" data-type="f"><svg width="9" height="8" viewBox="0 0 9 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.27344 7.5L4.77344 4L8.27344 0.5" stroke="#171D25" stroke-linecap="round" stroke-linejoin="round" /><path d="M4.1875 7.5L0.6875 4L4.1875 0.5" stroke="#171D25" stroke-linecap="round" stroke-linejoin="round" /></svg></a></li>';

    var ll = '<li class="page-item"><a data-page="' + tp + '" data-type="l" data-table="' + table + '" class="page-link page_no"><svg width="10" height="9" viewBox="0 0 10 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.960938 8.44824L4.50793 4.99588L1.05557 1.44888" stroke="#171D25" stroke-linecap="round" stroke-linejoin="round" /><path d="M5.04688 8.50391L8.59387 5.05154L5.14151 1.50455" stroke="#171D25" stroke-linecap="round" stroke-linejoin="round" /></svg></a></li>';

    var pp = '<li class="page-item"><a data-page="' + p + '" data-type="p"  data-table="' + table + '" class="page-link page_no"><svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4.22656 7.5L0.726562 4L4.22656 0.5" stroke="#171D25" stroke-linecap="round" stroke-linejoin="round" /></svg></a></li>';

    var p = prevPage(cp, tp, 1);

    var np = '<li class="page-item"><a data-page="' + p + '" data-type="n"  data-table="' + table + '" class="page-link page_no"><svg width="5" height="8" viewBox="0 0 5 8" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.84375 7.5L4.34375 4L0.84375 0.5" stroke="#171D25" stroke-linecap="round" stroke-linejoin="round" /></svg></a></li>';

    var ns = "";
    var ps = "";

    li += '<li class="page-item active"><div data-table="' + table + `" class="d-flex justify-content-center align-items-center i--pagination text-center pagination-div-tag"><input type="text" class="form-control shadow-none px-0 text-center pagination-input" value="${cp}" min="1" max="${tp}" onchange="paginationInput(event, ${cp}, ${tp}, '${table}')" style="width: 20px;"><div class="p-divider">/</div><div>${tp}</div></div></li>`;

    li = fl + pp + ps + li + ns + np + ll;
    var cls1 = "";
    var cls2 = "";
    if ($(".pagination").hasClass(table)) {
        cls1 = "." + table;
        cls2 = "." + table;
    };

    $(cls1 + ".pagination").html(li);

    $(cls1 + " .page_no").each(function () {
        var tp = $(this).data("type");
        if (tp == cp) {
            $(this).addClass("active");
        };
    });

    let id = "";
    if (table !== "table-data") {
        id = "-" + table;
    };
    $("#recordPerPage" + id).find("option[value='" + filter.itemPerPage + "']").attr("selected", true);

    if (cp == 1) {
        $(cls2 + ".pagination li:first-child").removeClass("page_no").addClass("btn-disabled");
        $(cls2 + ".pagination li:nth-child(2)").removeClass("page_no").addClass("btn-disabled");
    };

    if (cp == tp) {
        $(cls2 + ".pagination li:last-child").removeClass("page_no").addClass("btn-disabled");
        $(cls2 + ".pagination li:nth-last-child(2)").removeClass("page_no").addClass("btn-disabled");
        $(cls2 + ".pagination li .pagination-div-tag").addClass("btn-disabled");
    };
};

function prevPage(cp, tp, t) {
    var p = 1;
    if (t) {
        p = cp + 1 < tp ? cp + 1 : tp > 0 ? tp : 1;
    } else {
        p = cp - 1 > 0 ? cp - 1 : 1;
    };
    return p;
};

function nextDigit(cp, tp, t) {
    if (t) {
        for (i = cp; i <= tp; i++) {
            if (i % 7 == 0) {
                return i;
            };
        };
        return tp;
    } else {
        for (i = cp; i > 0; i--) {
            if (i % 7 == 0) {
                return i;
            };
        };
        return 1;
    };
};

function postAjaxCall(url, data, callback) {
    $.ajax({
        url: url,
        type: 'POST',
        data: data,
        success: function(response) {
            callback(response);
        },
        error: function(response) {
            callback(response.responseJSON);
        }
    });
};

function postFileCall(url, formData, callback) {
    $.ajax({
        type: "POST",
        url: url,
        data: formData,
        contentType: false,    
        processData: false,      
        success: function(response) {
            callback(response);
        },
        error: function(response) {
            console.error('Error:', response);
            callback(response.responseJSON);
        }
    });
};

function formatDate(dateString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('en-GB', options);
    return formattedDate;
};

function showToast(flag, val, time) {
    $("#toast").remove();
    if (!val) return;

    var noti_html = document.createElement("div");
    var att = document.createAttribute("id");
    att.value = "toast";
    noti_html.setAttributeNode(att);
    if (flag == 1) {
        noti_html.className = "notification is-success";
    } else if (flag == 0 || flag == 2) {
        noti_html.className = "notification is-error";
    } else {
        noti_html.className = "notification is-warning";
    }
    $("body").append(noti_html);
    $(noti_html).html(val);
    if (typeof time == "undefined" || time == null) {
        time = 5000;
    }
    setTimeout(function () {
        $("#toast").remove();
        time == null;
    }, time);
};

$(document).on("click", "#logout", function () {
    postAjaxCall("/admin/logout", {}, function (response) {
        showToast(response.flag, response.msg);
        const secret = response.data.secret;
        if (response.flag == 1) {
            $("#logoutModal").modal('hide');
            setTimeout(() => {
                window.location.href = `/admin/login/${secret}`;
            }, 1000);
        };
    });
});