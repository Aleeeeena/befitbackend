const mongoose = require("mongoose");

const TreatmentSchema = new mongoose.Schema(
  {
    dietitian: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "DietitianSubscription",
      required: true,
    },

    clients: [

      {
        clientId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserSubscription",
          required: true,
        },

        details: {
          age: { type: Number },
          purpose: { type: String },
          weight: { type: Number },
          height: { type: Number },
          todayMealIntake: {
            earlyMorning: { type: String, default: "" },
            morning: { type: String, default: "" },
            lunch: { type: String, default: "" },
            evening: { type: String, default: "" },
            night: { type: String, default: "" },
            waterIntake: { type: Number, default: 0 },
          },
        },

        chat: [
          {
            sender: {
              type: mongoose.Schema.Types.ObjectId,
              refPath: "chat.senderModel",
            }, // Sender can be Dietitian or Client
            senderModel: {
              type: String,
              enum: ["DietitianSubscription", "UserSubscription"],
            }, // Distinguish between sender types
            message: { type: String, required: true },
            timestamp: { type: Date, default: Date.now },
          },
        ],

        treatmentPlan: {
          details: { type: mongoose.Schema.Types.Mixed, default: {} },
          updatedAt: { type: Date, default: Date.now }, // Store last update time
        },
      },
    ],
  },
  { timestamps: true }
);

const Treatment = mongoose.model("Treatment", TreatmentSchema);
module.exports = Treatment;
