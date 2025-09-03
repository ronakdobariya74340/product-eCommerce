$(window).on('load', function() { // makes sure the whole site is loaded 
    $('.preloader').fadeOut();
});

$(".menu-bars").click(function(){
  $("body").addClass("active-menu");
});
$(".sidebar-close").click(function(){
  $("body").removeClass("active-menu");
});



// function dropDown(el) {
//   this.dd = el;
//   this.placeholder = this.dd.children('span');
//   this.opts = this.dd.find('ul.dropdown > li');
//   this.val = '';
//   this.index = -1;
//   this.initEvents();
// }
// dropDown.prototype = {
//   initEvents: function() {
//     var obj = this;
    
//     obj.dd.on('click', function() {
//       $(this).toggleClass('active');
//       return false;
//     });
    
//     obj.opts.on('click', function() {
//       var opt = $(this);
//       obj.val = opt.text();
//       obj.index = opt.index();
//       obj.placeholder.text(obj.val);
//     });
//   }
// }



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
  
}

