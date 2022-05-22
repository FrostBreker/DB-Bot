const mongoose = require("mongoose");

const dataSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
    channelId: String,
    guildId: String,
    name: String,
    link: String,
    messageId: String,
    type: String,
    size: String
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Data", dataSchema);
