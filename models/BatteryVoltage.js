"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var BatteryVoltageSchema = new mongoose_1.Schema({
    voltage: {
        type: Number,
        required: [true, 'Voltage is required'],
        min: [0, 'Voltage must be positive'],
    },
    percentage: {
        type: Number,
        required: [true, 'Percentage is required'],
        min: [0, 'Percentage must be at least 0'],
        max: [100, 'Percentage must be at most 100'],
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: ['normal', 'low', 'critical'],
        required: [true, 'Status is required'],
    },
    vehicleId: {
        type: String,
        required: [true, 'Vehicle ID is required'],
        trim: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required'],
    },
    deviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'UserDevice',
        required: [true, 'Device ID is required'],
    },
}, {
    timestamps: true,
});
exports.default = mongoose_1.default.models.BatteryVoltage || mongoose_1.default.model('BatteryVoltage', BatteryVoltageSchema);
