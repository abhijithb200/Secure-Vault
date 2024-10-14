const userList = document.getElementById("user-list");


async function loadUsers() {
    try {
        const response = await fetch('http://localhost:3001/get-all-customers-emails')
    
    
        const result = await response.json();
        users = result.emails
        console.log(result.emails)
        
        

        } catch (error) {
            alert(error)
        console.error('Error:', error);
        }


    users.forEach(userId => {
        let userDiv = document.createElement("div");
        userDiv.className = "user mb-3";
        userDiv.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <strong>${userId}</strong>
                <button class="btn btn-primary" onclick="viewProfile('${userId}')">View Profile</button>
            </div>
        `;
        userList.appendChild(userDiv);
    });
}

function viewProfile(userId) {
    window.location.href = `customer_profile.html?user=${userId}`;
}

window.onload = loadUsers