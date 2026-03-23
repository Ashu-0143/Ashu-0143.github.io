
$(document).ready(function(){
alert("jQuery working!");
  $(".game").on("click",function(){
    $(".game").toggle();
    $(this).toggle("fast");
    
  });
});
