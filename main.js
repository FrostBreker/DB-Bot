const { Client, Collection } = require("discord.js");
require("dotenv").config();
const TOKEN = process.env.TOKEN;
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const client = new Client({ intents: 98303 });
const multer = require("multer");
const userRoutes = require("./routes/user.routes");
const { checkUser, requireAuth } = require("./middleware/auth.middleware");
const upload = multer();

// Setup DB
require("./utils/functions")(client);
client.mongoose = require("./utils/mongoose");
client.mongoose.init(client.timestampParser());
// Handler and Commands
["EventUtil"].forEach((handler) => {
    require(`./utils/handlers/${handler}`)(client);
});

//Express

const app = express();

const corsOptions = {
    origin: `${process.env.CLIENT_URL}`,
    credentials: true,
    allowedHeaders: ["sessionId", "Content-Type", "Authorization", "authorization"],
    exposedHeaders: ["sessionId"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
};
app.use(cors(corsOptions));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

// jwt
app.get("*", checkUser);
app.get("/jwtid", requireAuth, (req, res) => {
    res.status(200).send(res.locals.user._id);
});

// routes
app.use("/api/user", userRoutes);

app.post('/api/data/', upload.single("file"), async (req, res) => {
    const { file } = req;
    if (file.size >= 8000000) return res.status(400).json({ error: "large" });
    const respond = await client.createData({ attch: file.buffer, name: file.originalname, userId: req.body.userId });
    if (respond === "no-guild") return res.status(400).json({ error: "guild" });
    if (respond === "no-channel") return res.status(400).json({ error: "channel" });
    return res.status(200).json({ success: "data" });
});

app.get('/api/data/:id', async (req, res) => {
    const respond = await client.sortData(req.params.id);
    if (respond === "no-data") return res.status(200).json({ error: "data" });
    if (respond === "no-channel") return res.status(200).json({ error: "channel" });
    return res.status(200).json({ success: "data", data: respond });
});

app.delete('/api/data/:id', async (req, res) => {
    await client.deleteData(req.params.id);
    return res.status(200).json({ success: "deleted" });
});

//Check error
process.on("exit", (code) => {
    console.log(`Le processus s'est arrêté avec le code: ${code}!`);
});
process.on("uncaughtException", (err, origin) => {
    console.log(`uncaughtException: ${err}`, `Origine: ${origin}`);
});
process.on("unhandledRejection", (reason, promise) => {
    console.log(`UNHANDLED_REJECTION: ${reason}\n--------\n`, promise);
});
process.on("warning", (...args) => {
    console.log(...args);
});

//Login
client.login(TOKEN);

// server
app.listen(process.env.PORT, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});