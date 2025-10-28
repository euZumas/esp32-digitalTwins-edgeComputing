const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema({ 
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    isVerified: {type: Boolean, default: false}
}, {timestamps: true}); // <-- adiciona createdAt e updatedAt automaticamente

const User = mongoose.model('User', UserSchema)

module.exports = User