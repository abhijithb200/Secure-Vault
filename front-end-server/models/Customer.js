const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');



const customerSchema = new mongoose.Schema({
    token: {
        type: String,
        default: uuidv4
    },
    email: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Customer', customerSchema);