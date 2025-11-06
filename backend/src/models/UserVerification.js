const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserVerificationSchema = new Schema({
    userId: { type: String, required: true },
    uniqueString: { type: String, required: true },
    expiresAt: { type: Date, required: true }
}, { timestamps: true }) // <-- createdAt e updatedAt automáticos

const UserVerification = mongoose.model('UserVerification', UserVerificationSchema)

module.exports = UserVerification