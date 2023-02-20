const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tweetSchema = ({
        author: {
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        text: {
            type: String,
            required: true
        }
    },
    {
        timestamps: true
})

module.exports = tweetSchema;