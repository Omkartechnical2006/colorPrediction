let countdown;
let timeLeft = 30; // Start at 30 seconds
const sound = new Audio("http://codeskulptor-demos.commondatastorage.googleapis.com/GalaxyInvaders/player_shoot.wav");

function startTimer() {
  countdown = setInterval(() => {
    // Calculate minutes and seconds
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // Split seconds into two digits
    const firstSecondDigit = Math.floor(seconds / 10);  // First digit
    const secondSecondDigit = seconds % 10;  // Second digit

    // Display the minute (always 0 in this case) and the two digits of seconds
    document.getElementById('first-second-digit').textContent = firstSecondDigit;
    document.getElementById('second-second-digit').textContent = secondSecondDigit;

    // Play sound when timeLeft is 5 or less and greater than 0
    if (timeLeft <= 5 && timeLeft > 0) {
      sound.play();
    }

    // Stop the timer when it reaches 0
    if (timeLeft === 0) {
      clearInterval(countdown);
      timeLeft = 30; // Reset the timer
      startTimer(); // Restart the countdown
    }

    timeLeft--; // Decrease the time
  }, 1000);
}

// Start the timer when the page loads
window.onload = function() {
  startTimer();
};