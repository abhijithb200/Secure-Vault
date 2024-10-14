function openTab(evt, tabName) {
  const tabContents = document.getElementsByClassName('tab-content');
  for (let i = 0; i < tabContents.length; i++) {
    tabContents[i].classList.remove('active');
  }
  const tabButtons = document.getElementsByClassName('tab-button')

  for (let i = 0; i < tabButtons.length; i++) {

    tabButtons[i].classList.remove('active');

  }

  document.getElementById(tabName).classList.add('active');

  evt.currentTarget.classList.add('active');
};
let users = new Map([
    ["user1", "pass1"],
    ["user2", "pass2"]
]);
document.getElementById("customer-form").addEventListener("submit", async function(event) {
  event.preventDefault();
  const login_btn = document.getElementById("customer-login-btn");
  const customer_id = document.getElementById('customer_id');
  const customer_pass = document.getElementById('customer_pass');



  try {
    // Send a POST request to the /login endpoint
    const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: customer_id.value })
    });

    // Parse the response
    const result = await response.text();
    if(result == "success") {
      customer_id.disabled = true;
      customer_pass.disabled = true;
      customer_id.style.color = "#d7d3d0";
      customer_id.style.backgroundColor = "rgba(255,255,255,0.1)";
      customer_pass.style.color = "#d7d3d0";
      customer_pass.style.backgroundColor = "rgba(255,255,255,0.1)";
      login_btn.style.display = "none";
      document.getElementById("OTP").style.display = "block";
      document.getElementById("Invalid-cred").style.display = "none";
    }else {
      document.getElementById("Invalid-cred").style.display = "block"
    }
} catch (error) {
  document.getElementById("Invalid-cred").style.display = "block"
  console.error('Error:', error);
}

  // if (users.has(customer_id.value) && users.get(customer_id.value) === customer_pass.value) {
  //   customer_id.disabled = true;
  //   customer_pass.disabled = true;
  //   customer_id.style.color = "#d7d3d0";
  //   customer_id.style.backgroundColor = "rgba(255,255,255,0.1)";
  //   customer_pass.style.color = "#d7d3d0";
  //   customer_pass.style.backgroundColor = "rgba(255,255,255,0.1)";
  //   login_btn.style.display = "none";
  //   document.getElementById("OTP").style.display = "block";
  //   document.getElementById("Invalid-cred").style.display = "none";
  // } else document.getElementById("Invalid-cred").style.display = "block";
});

document.getElementById("OTP").addEventListener("submit", async function(event) {
    event.preventDefault();
    const OTP = document.getElementById("OTP");
    const customer_id = document.getElementById('customer_id');
    const OTP_VALUE = document.getElementById("OTP-val");

    try {
      // Send a POST request to the /login endpoint
      const response = await fetch('http://localhost:3001/verify-otp', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email: customer_id.value, otp: OTP_VALUE.value })
      });

  
    const result = await response.text();
    if(result == "success") {
        const customerId = document.getElementById('customer_id').value;
        window.location.replace(`customer_profile.html?user=${customerId}&type=customer`);
        document.getElementById("Invalid-otp").style.display = "none";
    }else{
        document.getElementById("Invalid-otp").style.display = "block";
    }
        
    } catch (error) {
    console.error('Error:', error);
   }

});

document.getElementById("agent-form").addEventListener("submit", function(event) {
  event.preventDefault();
});
let agent = new Map([
    ["agent", "agentpass"]
]);
document.getElementById("agent-form").addEventListener("submit", function(event) {
  event.preventDefault();
  const agentId = document.querySelector('#agent-form input[type=text]').value;
  const agentPass = document.querySelector('#agent-form input[type=password]').value;
  if (agent.has(agentId) && agent.get(agentId) === agentPass) {

    window.location.replace("agent_dashboard.html");

    document.getElementById("Invalid-cred2").style.display = "none";



  } else {

    document.getElementById("Invalid-cred2").style.display = "block";

  }
});