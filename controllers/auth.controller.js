const { Users } = require('../models/index');
const mongoose = require('mongoose');
const ObjectID = require("mongoose").Types.ObjectId;
const jwt = require('jsonwebtoken');

const maxAge = 3 * 24 * 60 * 60 * 1000;
const createToken = (id) => {
  return jwt.sign({ id }, process.env.TOKEN_SECRET, {
    expiresIn: maxAge
  })
};

module.exports.signInWithDiscord = async (req, res) => {
  const { userId } = req.body
  console.log(userId);
  try {
    if (userId) {
      const user = await Users.login(userId);
      if (user) {
        const token = createToken(user._id);
        res.cookie('jwt', token, { httpOnly: true, maxAge });
        res.status(200).json({ user: user._id })
      } else {
        const createUser = async d => {
          const merged = Object.assign(
            { _id: mongoose.Types.ObjectId() },
            d
          );
          const saveData = await new Users(merged);
          return saveData.save().then((g) => {
            return g;
          })
        }
        const user2 = await createUser({
          userId: userId,
        });
        if (user2) {
          const token = createToken(user2._id);
          res.cookie('jwt', token, { httpOnly: true, maxAge });
          res.status(201).json({ user: user2._id });
        }
      }
    }
  } catch (err) {
    res.status(200).send(err);
  }
}

module.exports.getUserData = async (req, res) => {
  const { id } = req.params;
  if (!ObjectID.isValid(id))
    return res.status(400).send("ID unknown : " + id);

  try {
    const user = await Users.findOne({ _id: id });
    if (user) {
      res.status(200).json(user)
    } else {
      res.status(404).json({ error: 'User not found' })
    }
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
  }
}

module.exports.logout = (req, res) => {
  res.cookie('jwt', '', { maxAge: 1 });
  res.redirect('/');
}