
$(document).ready(function(){

  $(".game").on("click",function(){
    $(".game").toggle();
    $(this).toggle("fast");
    $(this).append("<h3>Good Luck !</h3>")
  });
});