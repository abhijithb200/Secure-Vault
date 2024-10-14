function getQueryParam(param) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
}

const currentUser = getQueryParam('user');
const currentType = getQueryParam('type');

if (!currentUser) {
    alert('User not specified!');
    throw new Error('User not specified in URL.');
}



// Attach the function to window.onload
window.onload = onPageLoad;


const submit = document.getElementById("submit");
const fname = document.getElementById("fname");
const lname = document.getElementById("lname");
const dob = document.getElementById("dob");
const email = document.getElementById("email");
const phone = document.getElementById("phone");
const credit = document.getElementById("credit");
const place = document.getElementById("place");
const ssn = document.getElementById("ssn");

let params = [fname, lname, dob, phone, credit, place, ssn];
let keys = ["firstName", "lastName", "dob", "phone", "credit_card", "place", "ssn"];



async function onPageLoad() {
    if (currentType == "customer") {
        try {
            const response = await fetch('http://localhost:3001/get-information', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user: currentUser })
            });
        
        
          const result = await response.json();
          
          params.forEach(function(val, index) {
            // Retrieve the value from tokenDetails using the corresponding key
            const value = result.tokenDetails ? result.tokenDetails[keys[index]] : '';
        
            // Set the value of the input field (or textContent for non-input elements)
            if (val.tagName === 'INPUT' || val.tagName === 'TEXTAREA') {
                val.value = value;
            } else {
                val.textContent = value;
            }
        
            // Set the border color to white
            val.style.borderColor = 'white';
        });
    
          if(result) {
              const customerId = document.getElementById('customer_id').value;
              window.location.replace(`customer_profile.html?user=${customerId}&type=customer`);
              document.getElementById("Invalid-otp").style.display = "none";
          }else{
              document.getElementById("Invalid-otp").style.display = "block";
          }
              
          } catch (error) {
          console.error('Error:', error);
         }
    }else {
        try {
            const response = await fetch('http://localhost:3001/get-information-agent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ user: currentUser })
            });
        
        
          const result = await response.json();
          
          params.forEach(function(val, index) {
            // Retrieve the value from tokenDetails using the corresponding key
            const value = result.tokenDetails ? result.tokenDetails[keys[index]] : '';
        
            // Set the value of the input field (or textContent for non-input elements)
            if (val.tagName === 'INPUT' || val.tagName === 'TEXTAREA') {
                val.value = value;
            } else {
                val.textContent = value;
            }
        
            // Set the border color to white
            val.style.borderColor = 'white';
        });
    
          if(result) {
              const customerId = document.getElementById('customer_id').value;
              window.location.replace(`customer_profile.html?user=${customerId}&type=customer`);
              document.getElementById("Invalid-otp").style.display = "none";
          }else{
              document.getElementById("Invalid-otp").style.display = "block";
          }
              
          } catch (error) {
          console.error('Error:', error);
         }
    }
}

document.getElementById("profile-form").addEventListener("submit", async function(event) {
    event.preventDefault();

    if (currentType == "customer"){
    
    if (submit.textContent === "Edit Profile") {
        // Enable editing mode
        params.forEach(function(val) {
            val.style.borderColor = "grey";
            val.contentEditable = "true";
        });
        submit.textContent = "Save Profile";
        
    } else if (submit.textContent === "Save Profile") {
        // Collect the updated values
        let updatedData = {};
        params.forEach(function(val, index) {
            const newValue = val.textContent.trim();
            updatedData[keys[index]] = newValue;
            val.style.borderColor = "white";
            val.contentEditable = "false";
        });
        
        // Send the updated data to the backend
        try {
            const response = await fetch('http://localhost:3001/edit-profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user: currentUser,
                    data: updatedData
                })
            });

            const result = await response.json();
            
            if (response.ok) {
                alert('Profile updated successfully!');
            } else {
                alert('Failed to update profile: ' + result.error);
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred while updating the profile.');
        }
        
        submit.textContent = "Edit Profile";
    }}
    else {
        alert("No access to edit customer profile")
    }
});
