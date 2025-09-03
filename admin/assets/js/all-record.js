$(document).ready(function() {
    $('#startDate').val("");
    $('#endDate').val("");
    $("#search_reset").addClass("d-none");
    datepicker();
    filterData("/admin/record-list");
});

$(document).on("change", "#product_filter_btn", function () {
    let product_val = $(this).val();

    if(product_val){
        $("#search_reset").removeClass("d-none");
    } else {
        $("#search_reset").addClass("d-none");
    };

    let objectData = {
        productId: product_val,
    };

    setFilters(objectData);
    filterData("/admin/record-list");
});

$(document).on("click", "#search_reset", function () {
    $('#startDate').val('');
    $('#endDate').val('');
    $('#product_filter_btn').val('');

    $('#reportrange span').html(moment().format('MMMM D, YYYY') + ' - ' + moment().format('MMMM D, YYYY'));
    $("#search_reset").addClass("d-none");
    
    let objectData = {
        productId: "",
        startDate: "",
        endDate: "",
    };

    setFilters(objectData);
    filterData("/admin/record-list");
});

function datepicker(){
    const start = moment();
    const end = moment();

    function cb(start, end) {
        $('#reportrange span').html(start.format('MMMM D, YYYY') + ' - ' + end.format('MMMM D, YYYY'));
    };

    $('#reportrange').daterangepicker({
        startDate: start,
        endDate: end,
        ranges: {
            'Today': [moment(), moment()],
            'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
            'Last 7 Days': [moment().subtract(6, 'days'), moment()],
            'Last 30 Days': [moment().subtract(29, 'days'), moment()],
            'This Month': [moment().startOf('month'), moment().endOf('month')],
            'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
        },
        locale: {
            format: 'MMMM D, YYYY'
        }
    }, cb);

    cb(start, end);

    $('#reportrange').on('apply.daterangepicker', function(ev, picker) {
        $('#startDate').val(picker.startDate.format('YYYY-MM-DD'));
        $('#endDate').val(picker.endDate.format('YYYY-MM-DD'));
        $('#reportrange span').html(picker.startDate.format('MMMM D, YYYY') + ' - ' + picker.endDate.format('MMMM D, YYYY'));
        $("#search_reset").removeClass("d-none");

        filterRecords(); // call your filter function here
    });
};

function filterRecords(){
    const startDate = $('#startDate').val();
    const endDate = $('#endDate').val();

    let objectData = {
        startDate: startDate,
        endDate: endDate,
    };

    setFilters(objectData);
    filterData("/admin/record-list");
};

function exportData(type) {
    // Get Summary
    const summary = {
        total_users: document.getElementById("total-users").innerText,
        free_entries: document.getElementById("free-entries").innerText,
        paid_entries: document.getElementById("paid-entries").innerText,
        gift_entries: document.getElementById("gift-entries").innerText,
        total_entries: document.getElementById("total-entries").innerText,
        total_revenue: document.getElementById("total-revenue").innerText
    };

    // Get Table Data
    const tableData = [];
    const rows = document.querySelectorAll("#data-table tbody tr");
    for (let row of rows) {
        const cols = row.querySelectorAll("td");
        tableData.push({
            no: cols[0].innerText,
            product: cols[1].innerText,
            users: cols[2].innerText,
            free: cols[3].innerText,
            paid: cols[4].innerText,
            gift: cols[5].innerText,
            total_entries: cols[6].innerText,
            revenue_usd: cols[7].innerText,
            avg_user_usd: cols[8].innerText
        });
    }

    if (type === "json") {
        const finalData = {
            summary,
            data: tableData
        };
        const jsonStr = JSON.stringify(finalData, null, 2);
        const blob = new Blob([jsonStr], {
            type: "application/json"
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "product_data.json";
        link.click();
    } else if (type === "csv") {
        let csv = [];
        csv.push("Summary");
        csv.push("Total Users,Free Entries,Paid Entries,Gift Entries,Total Entries,Total Revenue (USD)");
        csv.push([
            summary.total_users,
            summary.free_entries,
            summary.paid_entries,
            summary.gift_entries,
            summary.total_entries,
            summary.total_revenue
        ].join(","));

        csv.push(""); // empty line
        csv.push("No,Product,Users,Free,Paid,Gift,Total Entries,Revenue (USD),Avg/User (USD)");

        tableData.forEach(row => {
            csv.push([
                row.no, row.product, row.users, row.free, row.paid, row.gift,
                row.total_entries, row.revenue_usd, row.avg_user_usd
            ].join(","));
        });

        const blob = new Blob([csv.join("\n")], {
            type: "text/csv"
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "product_data.csv";
        link.click();
    }
}