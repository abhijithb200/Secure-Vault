// Function to send a POST request with token and role
const axios = require('axios');

// Function to add two numbers
function add(a, b) {
    return a + b;
}

async function dataGet(token, role) {
    const data = {
        token: token,
        role: role
    };

    try {
        const response = await axios.post('http://localhost:5000/detokenize', data);
        return response.data;
    } catch (error) {
        console.error('Error sending POST request:', error);
        throw error;
    }
}
async function editProfile(token, data) {
    const d = {
        token: token,
        data: data
    };

    try {
        const response = await axios.put('http://localhost:5000/edit', d);
        return response.data;
    } catch (error) {
        console.error('Error sending POST request:', error);
        throw error;
    }
}

async function emailToken(email) {
    const data = {
        email : email
    };

    try {
        const response = await axios.post('http://localhost:5000/generate-token', data);
        return response.data;
    } catch (error) {
        console.error('Error sending POST request:', error);
        throw error;
    }
}

module.exports = {
    add,
    dataGet,
    emailToken,
    editProfile
};