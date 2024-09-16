document.addEventListener('DOMContentLoaded', function() {

    // Register Form Validation
    document.getElementById('Register').addEventListener('submit', function(e) {
        e.preventDefault();
        
        var mobile = document.getElementById('mobile').value;
        var password = document.getElementById('password').value;
        var rcode = document.getElementById('rcode').value;
        var remember = document.getElementById('remember').checked;

        // Validate Mobile Number
        if (mobile === "") {
            document.getElementById('mobile').focus();
            document.getElementById('mobile').classList.add('borderline');
            alert('Mobile number is required');
            return false;
        }
        if (mobile.length < 10) {
            document.getElementById('mobile').focus();
            document.getElementById('mobile').classList.add('borderline');
            alert('Mobile number must be at least 10 digits long');
            return false;
        }

        // Validate Password
        if (password === "") {
            document.getElementById('password').focus();
            document.getElementById('password').classList.add('borderline');
            alert('Password is required');
            return false;
        }
        if (password.length < 5) {
            document.getElementById('password').focus();
            document.getElementById('password').classList.add('borderline');
            alert('Password must be at least 5 characters long');
            return false;
        }

        // Validate Recommendation Code
        if (rcode === "") {
            document.getElementById('rcode').focus();
            document.getElementById('rcode').classList.add('borderline');
            alert('Recommendation code is required');
            return false;
        }

        // Validate Remember Checkbox
        if (!remember) {
            alert('Please accept the policy');
            return false;
        }

        // If everything is valid, submit the form (for now, just log)
        alert('All fields are valid. Form submitted.');
    });

    // Login Form Validation
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var loginmobile = document.getElementById('login_mobile').value;
        var loginpassword = document.getElementById('login_password').value;
        
        // Validate Mobile Number
        if (loginmobile === "") {
            document.getElementById('login_mobile').focus();
            document.getElementById('login_mobile').classList.add('borderline');
            alert('Login mobile number is required');
            return false;
        }
        if (loginmobile.length < 10) {
            document.getElementById('login_mobile').focus();
            document.getElementById('login_mobile').classList.add('borderline');
            alert('Login mobile number must be at least 10 digits long');
            return false;
        }

        // Validate Password
        if (loginpassword === "") {
            document.getElementById('login_password').focus();
            document.getElementById('login_password').classList.add('borderline');
            alert('Login password is required');
            return false;
        }
        if (loginpassword.length < 5) {
            document.getElementById('login_password').focus();
            document.getElementById('login_password').classList.add('borderline');
            alert('Login password must be at least 5 characters long');
            return false;
        }

        // If everything is valid, submit the form (for now, just log)
        alert('All fields are valid. Form submitted.');
    });

    // OTP Form Validation
    document.getElementById('otpsubmitForm').addEventListener('submit', function(e) {
        e.preventDefault();

        var otp = document.getElementById('otp').value;
        
        // Validate OTP
        if (otp === "") {
            document.getElementById('otp').focus();
            document.getElementById('otp').classList.add('borderline');
            alert('OTP is required');
            return false;
        }

        // If OTP is valid, submit the form (for now, just log)
        alert('OTP is valid. Form submitted.');
    });

    // Mobile Verification Function
    function mobileVerification() {
        var mobile = document.getElementById('mobile').value;

        // Validate Mobile Number
        if (mobile === "") {
            document.getElementById('mobile').focus();
            document.getElementById('mobile').classList.add('borderline');
            alert('Mobile number is required');
            return false;
        }
        if (mobile.length < 10) {
            document.getElementById('mobile').focus();
            document.getElementById('mobile').classList.add('borderline');
            alert('Mobile number must be at least 10 digits long');
            return false;
        }

        // For now, just simulate success
        alert('Mobile verification successful');
    }

    // Attach mobile verification to button click
    document.getElementById('verifyMobileBtn').addEventListener('click', mobileVerification);

});
