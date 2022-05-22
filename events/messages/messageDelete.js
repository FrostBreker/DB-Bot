module.exports = {
    name: "messageDelete",
    once: true,
    async execute(client, message) {
        await client.deleteData(message.id);
    }
};