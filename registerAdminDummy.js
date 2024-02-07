const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
require('dotenv').config();



const mongoURI = `mongodb://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@mongo:27017/${process.env.MONGO_DATABASE}?authSource=admin`;

mongoose.connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB Connected successfully'))
    .catch(err => console.error(err));

const createDummyAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ username: 'admin' });
        if (adminExists) {
            console.log('Dummy admin user is already there');
            mongoose.connection.close();
            return;
        }

        const hashedPassword = await bcrypt.hash('password', 10);
        const adminUser = new User({
            name: 'Admin User2',
            email: 'admin2@admin.com',
            uname: 'admin3',
            contact: '123456',
            role: 'admin',
            password: hashedPassword,
        });
        await adminUser.save();
        console.log('Admin user created successfully.');
    } catch (error) {
        console.error('Error, unable to create dummy admin user:', error);
    } finally {
        mongoose.connection.close();
    }
};

createDummyAdminUser();
