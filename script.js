// get elements
var cards = document.querySelectorAll(".card");

var lightbox = document.getElementById("lightbox");
var lbIllusion = document.getElementById("lb-illusion");
var closeBtn = document.getElementById("lb-close");

var yesBtn = document.getElementById("yesBtn");
var noBtn = document.getElementById("noBtn");

var scoreText = document.getElementById("score");
var finishBtn = document.getElementById("finishBtn");
var finalResult = document.getElementById("finalResult");

// variables
var score = 0;
var answered = 0;
var answeredCurrent = false;

// open card in lightbox
for (var i = 0; i < cards.length; i++) {
  cards[i].addEventListener("click", function () {
    var illusion = this.querySelector(".illusion").cloneNode(true);

    lbIllusion.innerHTML = "";
    lbIllusion.appendChild(illusion);

    lightbox.classList.add("active");
    lightbox.removeAttribute("hidden");

    document.body.style.overflow = "hidden";

    // reset for new illusion
    answeredCurrent = false;
  });
}

// close lightbox with the X and
closeBtn.addEventListener("click", function () {
  closeLightbox();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeLightbox();
  }
});
function closeLightbox() {
  lightbox.classList.remove("active");

  setTimeout(function () {
    lightbox.setAttribute("hidden", "");
    lbIllusion.innerHTML = "";
    document.body.style.overflow = "auto";
  }, 300);
}
//close with esc
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeLightbox();
  }
});
// YES button
yesBtn.addEventListener("click", function () {
  if (answeredCurrent === true) return;

  score++;
  answered++;
  answeredCurrent = true;

  updateScore();
});

// NO button
noBtn.addEventListener("click", function () {
  if (answeredCurrent === true) return;

  answered++;
  answeredCurrent = true;

  updateScore();
});

// update score
function updateScore() {
  scoreText.innerHTML = "Score: " + score;
}

// finish test
finishBtn.addEventListener("click", function () {
  if (answered === 0) {
    finalResult.innerHTML = " Try some illusions first!";
    return;
  }

  var resultText = "";

  if (score <= 2) {
    resultText = "Strong visual control — hard to fool";
  } else if (score <= 5) {
    resultText = "Normal perception — sometimes tricked";
  } else {
    resultText = "Highly susceptible — easily fooled";
  }

  finalResult.innerHTML =
    "Final Result:<br><strong>" + resultText + "</strong>";
});
