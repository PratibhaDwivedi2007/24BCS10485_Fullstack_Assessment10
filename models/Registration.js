const mongoose = require("mongoose");

const registrationSchema = new mongoose.Schema({
    studentName: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 50
    },

    collegeEmail: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.(edu|ac\.in)$/i,
            "Must be a valid college email ending in .edu or .ac.in"
        ]
    },

    rollNumber: {
        type: String,
        required: true,
        uppercase: true,
        match: /^[A-Z0-9]{8,10}$/
    },

    eventType: {
        type: String,
        required: true,
        enum: [
            "CODING_HACKATHON",
            "AI_WORKSHOP",
            "ROBOTICS",
            "GAMING"
        ]
    },

    teamSize: {
        type: Number,
        required: true,
        min: 1,
        max: 4,
        validate: {
            validator: Number.isInteger,
            message: "Team size must be an integer"
        }
    },

    ticketPrice: {
        type: Number,
        required: true,
        min: 0
    },

    discountCode: {
        type: String,
        trim: true,
        uppercase: true,
        default: undefined
    },

    finalAmount: {
        type: Number,
        required: true,
        min: 0
    },

    status: {
        type: String,
        enum: ["PENDING", "CONFIRMED", "CANCELLED"],
        default: "PENDING"
    },

    registrationDate: {
        type: Date,
        default: Date.now,
        validate: {
            validator: function (date) {
                return date <= new Date();
            },
            message: "Registration date cannot be in the future"
        }
    }
}, {
    timestamps: false
});

registrationSchema.pre("validate", function () {
    if (this.eventType === "AI_WORKSHOP" && this.teamSize !== 1) {
        this.invalidate(
            "teamSize",
            "AI Workshop only permits individual registrations"
        );
    }
});

module.exports = mongoose.model("Registration", registrationSchema);