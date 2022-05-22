const mongoose = require("mongoose");

const dataSchema = mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    userId: String,
  },
  {
    timestamps: true,
  }
);
dataSchema.statics.login = async function (userId) {
  const user = await this.findOne({ userId });
  if (user) {
    return user
  }
};
module.exports = mongoose.model("Users", dataSchema);
