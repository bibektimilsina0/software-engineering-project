const mongoose = require('mongoose')

const tokenSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        default: function () {
            return new Date(Date.now() + 5*60*1000)
        }
    }
})



module.exports = mongoose.model('token', tokenSchema);