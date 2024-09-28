// Select the checkbox element
const checkbox = document.querySelector('.van-checkbox');
const icon = checkbox.querySelector('.van-checkbox__icon');

// Add a click event listener
checkbox.addEventListener('click', () => {
    // Toggle the checked class
    icon.classList.toggle('van-checkbox__icon--checked');
    
    // Toggle the aria-checked attribute
    const isChecked = icon.classList.contains('van-checkbox__icon--checked');
    checkbox.setAttribute('aria-checked', isChecked);
});



//second login validation by js
document.addEventListener("DOMContentLoaded", function() {
    const form = document.querySelector("form");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");
    const passwordTip = document.querySelector(".register__container-tip");
    const phoneInput = document.querySelector("input[name='mobile']");
    const phoneTip = document.createElement("div");
    phoneTip.className = "phone-error-message";
    phoneTip.style.color = "red"; // Optional: style the error message
    phoneInput.parentNode.appendChild(phoneTip);

    phoneInput.addEventListener("input", function() {
        const value = phoneInput.value.trim();
        if (value.length > 10) {
            phoneInput.value = value.slice(0, 10); // Limit to 10 digits
            showPhoneError("Phone number cannot exceed 10 digits.");
        } else if (!/^\d*$/.test(value)) {
            showPhoneError("Phone number must contain only digits.");
        } else if (value.length === 10) {
            clearPhoneError();
        } else {
            clearPhoneError();
        }
    });
// end phone number validation 
    function showPhoneError(message) {
        phoneTip.textContent = message;
        phoneTip.style.display = "block"; // Show the error message
    }

    function clearPhoneError() {
        phoneTip.textContent = "";
        phoneTip.style.display = "none"; // Hide the error message
    }

    form.addEventListener("submit", function(event) {
        // Clear previous error messages
        const errorMessages = document.querySelectorAll(".error-message");
        errorMessages.forEach(msg => msg.remove());
        passwordTip.style.display = "none"; // Hide the tip initially

        let valid = true;

        // Validate Username
        if (usernameInput.value.trim() === "") {
            showError(usernameInput, "Username cannot be empty");
            valid = false;
        }

        // Validate Password
        const passwordValue = passwordInput.value.trim();
        if (passwordValue === "") {
            showError(passwordInput, "Password cannot be empty");
            valid = false;
        } else if (!isValidPassword(passwordValue)) {
            passwordTip.style.display = "block"; // Show the password criteria tip
            valid = false;
        }

        if (!valid) {
            event.preventDefault(); // Prevent form submission if validation fails
        }
    });

    function isValidPassword(password) {
        const minLength = 8;
        const hasLetters = /[a-zA-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        return password.length >= minLength && hasLetters && hasNumbers;
    }

    function showError(input, message) {
        const errorSpan = document.createElement("span");
        errorSpan.className = "error-message";
        errorSpan.style.color = "red"; // Optional: style the error message
        errorSpan.textContent = message;
        input.parentNode.appendChild(errorSpan);
    }

    document.getElementsByClassName("eye")[0].addEventListener("click", () => {
        let a = passwordInput.type;
        passwordInput.type = a === "password" ? "text" : "password";
    });
});

//end



// document.addEventListener('DOMContentLoaded', function () {
//     // Register Form Validation
//     document.getElementById('Register').addEventListener('submit', function (e) {
//         e.preventDefault();

//         var mobile = document.getElementById('mobile').value;
//         var password = document.getElementById('password').value;
//         var rcode = document.getElementById('rcode').value;
//         var remember = document.getElementById('remember').checked;

//         // Validate Mobile Number
//         if (mobile === "") {
//             document.getElementById('mobile').focus();
//             document.getElementById('mobile').classList.add('borderline');
//             alert('Mobile number is required');
//             return false;
//         }

//         if (mobile.length < 10) {
//             document.getElementById('mobile').focus();
//             document.getElementById('mobile').classList.add('borderline');
//             alert('Mobile number must be at least 10 digits long');
//             return false;
//         }

//         // Validate Password
//         if (password === "") {
//             document.getElementById('password').focus();
//             document.getElementById('password').classList.add('borderline');
//             alert('Password is required');
//             return false;
//         }
//         if (password.length < 5) {
//             document.getElementById('password').focus();
//             document.getElementById('password').classList.add('borderline');
//             alert('Password must be at least 5 characters long');
//             return false;
//         }

//         // Validate Recommendation Code
//         if (rcode === "") {
//             document.getElementById('rcode').focus();
//             document.getElementById('rcode').classList.add('borderline');
//             alert('Recommendation code is required');
//             return false;
//         }

//         // Validate Remember Checkbox
//         if (!remember) {
//             alert('Please accept the policy');
//             return false;
//         }

//         // Submit form after successful validation
//         alert('All fields are valid. Form submitted.');
//         this.submit(); // Submit form after validation
//     });

//     // Login Form Validation
//     document.getElementById('loginForm').addEventListener('submit', function (e) {
//         e.preventDefault();

//         var loginmobile = document.getElementById('login_mobile').value;
//         var loginpassword = document.getElementById('login_password').value;

//         // Validate Mobile Number
//         if (loginmobile === "") {
//             document.getElementById('login_mobile').focus();
//             document.getElementById('login_mobile').classList.add('borderline');
//             alert('Login mobile number is required');
//             return false;
//         }
//         if (loginmobile.length < 10) {
//             document.getElementById('login_mobile').focus();
//             document.getElementById('login_mobile').classList.add('borderline');
//             alert('Login mobile number must be at least 10 digits long');
//             return false;
//         }

//         // Validate Password
//         if (loginpassword === "") {
//             document.getElementById('login_password').focus();
//             document.getElementById('login_password').classList.add('borderline');
//             alert('Login password is required');
//             return false;
//         }
//         if (loginpassword.length < 5) {
//             document.getElementById('login_password').focus();
//             document.getElementById('login_password').classList.add('borderline');
//             alert('Login password must be at least 5 characters long');
//             return false;
//         }

//         // Submit form after successful validation
//         alert('All fields are valid. Form submitted.');
//         this.submit(); // Submit form after validation
//     });

//     // Mobile Verification Function
//     function mobileVerification() {
//         var mobile = document.getElementById('mobile').value;

//         // Validate Mobile Number
//         if (mobile === "") {
//             document.getElementById('mobile').focus();
//             document.getElementById('mobile').classList.add('borderline');
//             alert('Mobile number is required');
//             return false;
//         }
//         if (mobile.length < 10) {
//             document.getElementById('mobile').focus();
//             document.getElementById('mobile').classList.add('borderline');
//             alert('Mobile number must be at least 10 digits long');
//             return false;
//         }

//         // For now, just simulate success
//         alert('Mobile verification successful');
//     }

//     // Attach mobile verification to button click
//     document.getElementById('verifyMobileBtn').addEventListener('click', mobileVerification);
// });

// // Updated isNumber function to handle keypress validation
// function isNumber(e) {
//     const keyCode = e.which || e.keyCode;
//     const key = String.fromCharCode(keyCode);

//     if (!/^\d+$/.test(key)) {  // Check if the key is a digit
//         alert("Please enter your mobile number");
//         e.preventDefault();  // Prevent non-numeric input
//     }
// }
