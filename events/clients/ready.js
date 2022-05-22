module.exports = {
    name: "ready",
    once: true,
    async execute(client) {
        //Startup
        console.log(`Connected as ${client.user.tag}!`);
        client.user.setPresence({ activities: [{ name: `with all modules`, type: "PLAYING" }], status: 'online' });
    }
};