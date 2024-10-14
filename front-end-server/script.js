const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const Customer = require('./models/Customer');
const axios = require('axios');


// 1. create customer collection with token and state - uid
const DB_USER = 'admin';
const DB_PASSWORD = 'password';
const DB_NAME = 'customers';
const DB_HOST =  'localhost:27017';

mongoose.connect(`mongodb://${DB_USER}:${DB_PASSWORD}@${DB_HOST}`, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

async function tokenize(data) {
    const d = {
        tablename : "customer",
        data : data
    };

    try {
        const response = await axios.post('http://localhost:5000/tokenize', d);

        return response.data.token;
    } catch (error) {
        console.error('Error sending POST request:', error);
        throw error;
    }
}

// Create a new customer document with specific UIDs for token and state
const createCustomer = async () => {

    const customer = new Customer({
        token: await tokenize(
            {
                "ssn": "898-45-6789",
                "dob": "1981-01-01",
                "credit_card": "4111-1111-1111-1111",
                "place": "New York",
                "firstName" : "John",
                "lastName" : "Joseph",
                "phone" : "123456789"
            }
        ),
        email: '04f8996da763b7a969b1028ee3007569eaf3a635486ddab211d512c85b9df8fb@example.com'
    });
    await customer.save();
    const customer2 = new Customer({
        token: await tokenize(
            {
                "ssn": "898-45-6789",
                "dob": "1981-01-01",
                "credit_card": "4111-1111-1111-1111",
                "place": "Paris",
                "firstName" : "Albert",
                "lastName" : "Jose",
                "phone" : "123456789"
            }
        ),
        email: '0a041b9462caa4a31bac3567e0b6e6fd9100787db2ab433d96f6d178cabfce90@example.com'
    });
    await customer2.save();
    const customer3 = new Customer({
        token: await tokenize(
            {
                "ssn": "898-45-6789",
                "dob": "1981-01-01",
                "credit_card": "4111-1111-1111-1111",
                "place": "USA",
                "firstName" : "Mohsin",
                "lastName" : "Ghumman",
                "phone" : "123456789"
            }
        ),
        email: '6025d18fe48abd45168528f18a82e265dd98d421a7084aa09f61b341703901a3@example.com'
    });
    await customer3.save();
    console.log('Customer created:', customer);
};

createCustomer().then(() => {
    // mongoose.disconnect();
    console.log("Customer created successfully")
}).catch((error) => {
    console.error('Error creating customer:', error);
    mongoose.disconnect();
});