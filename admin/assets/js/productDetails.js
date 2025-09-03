$(document).ready(function () {
    const product_id = $("#product_id").val();
    setFilters({
        productId: product_id,
    });
    filterData("/admin/product-transaction-list");
});