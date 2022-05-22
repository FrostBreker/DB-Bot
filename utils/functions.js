const { MessageAttachment } = require("discord.js");
const { DataMo } = require("../models/index");
const mongoose = require("mongoose");
const { options, guildId } = require("../config.json");

module.exports = async client => {
    //Server
    client.getData = async dataMd => {
        const data = await DataMo.findOne({ messageId: dataMd.messageId }).catch(() => { });
        return data ? data : undefined;
    };

    client.getAllDatasOfUser = async (id) => {
        const data = await DataMo.find().catch(() => { });
        const arr = [];
        data.map((e) => {
            if (e.userId === id) {
                return arr.push(e);
            }
        })
        return arr ? arr : undefined;
    };

    client.saveData = async d => {
        const merged = Object.assign(
            { _id: mongoose.Types.ObjectId() },
            d
        );
        const saveData = await new DataMo(merged);
        return saveData
            .save()
            .then((g) =>
                console.log(
                    `${client.timestampParser()} => Nouvelle donnée enregistrée => ${g.name}`
                )
            );

    };

    client.sortData = async userId => {
        const allDatas = await client.getAllDatasOfUser(userId);
        const channel = await client.checkUser(userId);
        if (!channel) return "no-channel";
        const allMessageOfChannel = (await channel.messages.fetch());
        if (!allMessageOfChannel) return "no-data";
        const refAll = [];
        await allDatas.map(async (d) => {
            const message = await allMessageOfChannel.find((lead) => {
                if (lead.id === d.messageId) return lead;
            });
            if (message) {
                refAll.push(d);
            } else {
                await client.deleteData(d.messageId);
            }
        });
        if (client.isEmpty(refAll)) return "no-data";

        return refAll;
    }

    client.createData = async d => {
        const channel = await client.checkUser(d.userId);
        if (!channel) return "no-channel";

        const attach = new MessageAttachment(d.attch, d.name);

        await channel.send({ files: [attach] }).then(async (msg) => {
            const att = msg.attachments.first();
            const data = client.saveData({
                userId: d.userId,
                channelId: channel.id,
                guildId: guildId,
                name: att.name,
                link: att.url,
                messageId: msg.id,
                type: att.contentType,
                size: att.size,
            })
            return data;
        });
    };

    client.deleteData = async id => {
        await DataMo.deleteOne({ messageId: id }).exec().then((d) => console.log(`${client.timestampParser()} => Suppression d'une donnée => ${id}`));
    }

    client.checkUser = async (userId) => {
        const guild = await client.guilds.cache.get(guildId);
        const searchChannel = await guild.channels.cache.find((c) => c.name === userId);
        if (searchChannel) return searchChannel;
        else {
            const channel = await guild.channels.create(userId, {
                type: "text",
                topic: userId
            });
            return channel;
        }
    }

    //have timestamp
    client.timestampParser = num => {
        if (num) {
            let options = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            };

            let date = new Date(num).toLocaleDateString("fr-FR", options);
            return date.toString();
        } else {
            let options = {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            };

            let date = new Date(Date.now()).toLocaleDateString("fr-FR", options);
            return date.toString();
        }
    };

    //Is EMpty ??
    client.isEmpty = (value) => {
        return (
            value === undefined ||
            value === null ||
            (typeof value === "object" && Object.keys(value).length === 0) ||
            (typeof value === "string" && value.trim().length === 0)
        );
    };
};