
$(document).ready(function () {

  let random = null;
  let trails = 0;

  $(".game1").on("click", function () {

    $("#minNumber").val("1");
    $("#maxNumber").val("");
    $("#guessNumber").val("");
    $(".resultNum").text("");

    trails = 0;

    $(".g").toggle();
    $(this).toggle("fast");
    $(".game1Center").toggle("fast");

    let min = parseInt($("#minNumber").val());
    let max = parseInt($("#maxNumber").val());
    random = Math.floor(Math.random() * (max - min + 1)) + min;

   $("#guessButton").off("click").on("click", function () {

  let min = parseInt($("#minNumber").val());
  let max = parseInt($("#maxNumber").val());
  let guess = parseInt($("#guessNumber").val());

  if (isNaN(min) || isNaN(max) || isNaN(guess)) {
    $(".resultNum").text("Enter valid numbers");
    return;
  }

  if (min >= max) {
    $(".resultNum").text("Min should be less than Max");
    return;
  }

  if (trails === 0) {
    random = Math.floor(Math.random() * (max - min + 1)) + min;
  }

  if (guess < min || guess > max) {
    $(".resultNum").text("Out of range!");
    return;
  }

  trails++;

  if (guess > random) {
    $(".resultNum").text("Too High!");
  } else if (guess < random) {
    $(".resultNum").text("Too Low!");
  } else {
    $(".resultNum").text("Correct in " + trails + " tries");
    trails = 0; 
    $("#minNumber").val("");
    $("#maxNumber").val("");
    $("#guessNumber").val("");
  }

});

  });

  $(".game2").on("click", function (){
    $(".g").toggle();
    $(this).toggle("fast");
  });
$(".more").on("click", function () {
    window.location.href = "https://www.friv.com/old";
  
  });
});

