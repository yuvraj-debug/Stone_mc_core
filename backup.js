require('dotenv').config();
const { Client, GatewayIntentBits, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, Events } = require('discord.js');
const ms = require('ms');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildModeration,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageTyping,
        GatewayIntentBits.DirectMessages
    ]
});

client.commands = new Collection();
const giveawayMap = new Map();

// Command Registration
const commands = [
    {
        name: 'ban',
        description: 'Bans a user from the server',
        options: [
            {
                name: 'user',
                description: 'The user to ban',
                type: 6,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for the ban',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.BanMembers.toString()
    },
    {
        name: 'giveaway',
        description: 'Create a new giveaway',
        options: [
            {
                name: 'create',
                description: 'Create a new giveaway',
                type: 1,
                options: [
                    {
                        name: 'channel',
                        description: 'The channel to host the giveaway in',
                        type: 7,
                        channel_types: [ChannelType.GuildText],
                        required: true
                    },
                    {
                        name: 'winners',
                        description: 'Number of winners',
                        type: 4,
                        required: true
                    },
                    {
                        name: 'duration',
                        description: 'Duration of the giveaway (e.g., 1d, 2h, 30m)',
                        type: 3,
                        required: true
                    },
                    {
                        name: 'name',
                        description: 'Name/prize of the giveaway',
                        type: 3,
                        required: true
                    }
                ]
            }
        ],
        default_member_permissions: PermissionFlagsBits.ManageMessages.toString()
    },
    {
        name: 'kick',
        description: 'Kicks a user from the server',
        options: [
            {
                name: 'target',
                description: 'The user to kick',
                type: 6,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for the kick',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.KickMembers.toString()
    },
    {
        name: 'lock',
        description: 'Lock a channel for everyone',
        options: [
            {
                name: 'channel',
                description: 'The channel to lock',
                type: 7,
                channel_types: [ChannelType.GuildText],
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.ManageChannels.toString()
    },
    {
        name: 'lockall',
        description: 'Locks all text channels in the server',
        default_member_permissions: PermissionFlagsBits.ManageChannels.toString()
    },
    {
        name: 'mediachannel',
        description: 'Toggle media-only mode in a channel',
        options: [
            {
                name: 'channel',
                description: 'The channel to toggle media-only mode',
                type: 7,
                channel_types: [ChannelType.GuildText],
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.ManageChannels.toString()
    },
    {
        name: 'message',
        description: 'Track messages between two dates',
        options: [
            {
                name: 'channel',
                description: 'The channel to track messages in',
                type: 7,
                channel_types: [ChannelType.GuildText],
                required: true
            },
            {
                name: 'start',
                description: 'Start date (YYYY-MM-DD)',
                type: 3,
                required: true
            },
            {
                name: 'end',
                description: 'End date (YYYY-MM-DD)',
                type: 3,
                required: true
            }
        ],
        default_member_permissions: PermissionFlagsBits.ManageMessages.toString()
    },
    {
        name: 'modlogs',
        description: 'View all moderation logs for a user',
        options: [
            {
                name: 'user',
                description: 'The user to view logs for',
                type: 6,
                required: true
            }
        ],
        default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
    },
    {
        name: 'mute',
        description: 'Temporarily mute a member',
        options: [
            {
                name: 'user',
                description: 'The user to mute',
                type: 6,
                required: true
            },
            {
                name: 'duration',
                description: 'Duration of the mute (e.g., 1d, 2h, 30m)',
                type: 3,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for the mute',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
    },
    {
        name: 'nick',
        description: "Change a member's nickname",
        options: [
            {
                name: 'user',
                description: 'The user to change nickname',
                type: 6,
                required: true
            },
            {
                name: 'nickname',
                description: 'The new nickname (leave empty to reset)',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.ManageNicknames.toString()
    },
    {
        name: 'ping',
        description: 'Check bot latency and API response time'
    },
    {
        name: 'purge',
        description: 'Delete a specified number of messages (up to 100)',
        options: [
            {
                name: 'amount',
                description: 'Number of messages to delete',
                type: 4,
                required: true,
                min_value: 1,
                max_value: 100
            }
        ],
        default_member_permissions: PermissionFlagsBits.ManageMessages.toString()
    },
    {
        name: 'role',
        description: 'Manage user roles',
        options: [
            {
                name: 'add',
                description: 'Add a role to a user',
                type: 1,
                options: [
                    {
                        name: 'user',
                        description: 'The user to add the role to',
                        type: 6,
                        required: true
                    },
                    {
                        name: 'role',
                        description: 'The role to add',
                        type: 8,
                        required: true
                    }
                ]
            },
            {
                name: 'remove',
                description: 'Remove a role from a user',
                type: 1,
                options: [
                    {
                        name: 'user',
                        description: 'The user to remove the role from',
                        type: 6,
                        required: true
                    },
                    {
                        name: 'role',
                        description: 'The role to remove',
                        type: 8,
                        required: true
                    }
                ]
            }
        ],
        default_member_permissions: PermissionFlagsBits.ManageRoles.toString()
    },
    {
        name: 'unban',
        description: 'Unbans a user from the server',
        options: [
            {
                name: 'userid',
                description: 'The user ID to unban',
                type: 3,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for the unban',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.BanMembers.toString()
    },
    {
        name: 'unlock',
        description: 'Unlock a specific text channel',
        options: [
            {
                name: 'channel',
                description: 'The channel to unlock',
                type: 7,
                channel_types: [ChannelType.GuildText],
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.ManageChannels.toString()
    },
    {
        name: 'unlockall',
        description: 'Unlock all text channels in the server',
        default_member_permissions: PermissionFlagsBits.ManageChannels.toString()
    },
    {
        name: 'unmute',
        description: 'Remove a user timeout (unmutes them)',
        options: [
            {
                name: 'user',
                description: 'The user to unmute',
                type: 6,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for the unmute',
                type: 3,
                required: false
            }
        ],
        default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
    },
    {
        name: 'warn',
        description: 'Warn a user',
        options: [
            {
                name: 'user',
                description: 'The user to warn',
                type: 6,
                required: true
            },
            {
                name: 'reason',
                description: 'Reason for the warning',
                type: 3,
                required: true
            }
        ],
        default_member_permissions: PermissionFlagsBits.ModerateMembers.toString()
    }
];

// Moderation logs storage (in-memory, will reset on bot restart)
const modLogs = new Map();

// Helper function to log moderation actions
function logModAction(guildId, userId, action, moderatorId, reason, duration = null) {
    if (!modLogs.has(guildId)) {
        modLogs.set(guildId, new Map());
    }
    
    const guildLogs = modLogs.get(guildId);
    if (!guildLogs.has(userId)) {
        guildLogs.set(userId, []);
    }
    
    guildLogs.get(userId).push({
        action,
        moderator: moderatorId,
        reason,
        duration,
        timestamp: new Date().toISOString()
    });
}

// Helper function to create rich embeds
function createEmbed(title, description, color = 0xED4245) {
    return new EmbedBuilder()
        .setTitle(title)
        .setDescription(description)
        .setColor(color)
        .setTimestamp()
        .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() });
}

// Helper function to check if a string is a valid date
function isValidDate(dateString) {
    const regEx = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regEx)) return false;
    const d = new Date(dateString);
    return d instanceof Date && !isNaN(d);
}

// Register commands when bot starts
client.once('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    
    try {
        await client.application.commands.set(commands);
        console.log('Slash commands registered!');
    } catch (error) {
        console.error('Error registering commands:', error);
    }
});

// Command handling
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options, guild, member, user } = interaction;

    try {
        switch (commandName) {
            case 'ban': {
                if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to ban members.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const target = options.getUser('user');
                const reason = options.getString('reason') || 'No reason provided';

                if (target.id === user.id) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You cannot ban yourself.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                if (target.id === client.user.id) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'I cannot ban myself.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const targetMember = await guild.members.fetch(target.id).catch(() => null);
                if (targetMember && !targetMember.bannable) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'I cannot ban this user due to role hierarchy.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                await guild.bans.create(target.id, { reason });
                logModAction(guild.id, target.id, 'ban', user.id, reason);

                const embed = createEmbed('User Banned', `✅ Successfully banned ${target.tag} (${target.id})`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: user.tag, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });
            }

            case 'giveaway': {
                const subCommand = options.getSubcommand();
                if (subCommand === 'create') {
                    if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'You do not have permission to create giveaways.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    const channel = options.getChannel('channel');
                    const winners = options.getInteger('winners');
                    const duration = options.getString('duration');
                    const name = options.getString('name');

                    const durationMs = ms(duration);
                    if (!durationMs || durationMs < 60000 || durationMs > 604800000) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'Duration must be between 1 minute and 7 days.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    const endTime = Date.now() + durationMs;
                    const giveawayId = `${channel.id}-${Date.now()}`;

                    const embed = createEmbed('🎉 **GIVEAWAY** 🎉', name)
                        .addFields(
                            { name: 'Hosted by', value: user.toString(), inline: true },
                            { name: 'Winners', value: winners.toString(), inline: true },
                            { name: 'Ends in', value: `<t:${Math.floor(endTime / 1000)}:R>`, inline: true }
                        )
                        .setFooter({ text: `React with 🎉 to enter! | ID: ${giveawayId}` });

                    const row = new ActionRowBuilder()
                        .addComponents(
                            new ButtonBuilder()
                                .setCustomId('giveaway_join')
                                .setLabel('Join Giveaway')
                                .setStyle(ButtonStyle.Primary)
                                .setEmoji('🎉')
                        );

                    const message = await channel.send({ 
                        embeds: [embed],
                        components: [row]
                    });

                    giveawayMap.set(giveawayId, {
                        channelId: channel.id,
                        messageId: message.id,
                        endTime,
                        winners,
                        prize: name,
                        hostId: user.id,
                        entries: new Set()
                    });

                    setTimeout(() => endGiveaway(giveawayId), durationMs);

                    return interaction.reply({ 
                        embeds: [createEmbed('Giveaway Created', `Giveaway created in ${channel.toString()}`)],
                        ephemeral: true 
                    });
                }
                break;
            }

            case 'kick': {
                if (!member.permissions.has(PermissionFlagsBits.KickMembers)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to kick members.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const target = options.getUser('target');
                const reason = options.getString('reason') || 'No reason provided';

                if (target.id === user.id) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You cannot kick yourself.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                if (target.id === client.user.id) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'I cannot kick myself.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const targetMember = await guild.members.fetch(target.id);
                if (!targetMember.kickable) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'I cannot kick this user due to role hierarchy.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                await targetMember.kick(reason);
                logModAction(guild.id, target.id, 'kick', user.id, reason);

                const embed = createEmbed('User Kicked', `✅ Successfully kicked ${target.tag} (${target.id})`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: user.tag, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });
            }

            case 'lock': {
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to lock channels.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const channel = options.getChannel('channel') || interaction.channel;
                
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: false
                });

                const embed = createEmbed('Channel Locked', `🔒 ${channel.toString()} has been locked by ${user.tag}`)
                    .setColor(0x5865F2);

                return interaction.reply({ embeds: [embed] });
            }

            case 'lockall': {
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to lock channels.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const textChannels = guild.channels.cache.filter(c => 
                    c.type === ChannelType.GuildText && 
                    c.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.SendMessages)
                );

                let lockedCount = 0;
                for (const channel of textChannels.values()) {
                    try {
                        await channel.permissionOverwrites.edit(guild.roles.everyone, {
                            SendMessages: false
                        });
                        lockedCount++;
                    } catch (error) {
                        console.error(`Failed to lock channel ${channel.name}:`, error);
                    }
                }

                const embed = createEmbed('Channels Locked', `🔒 Locked ${lockedCount} text channels`)
                    .setColor(0x5865F2);

                return interaction.reply({ embeds: [embed] });
            }

            case 'mediachannel': {
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to manage channels.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const channel = options.getChannel('channel') || interaction.channel;
                const currentPerms = channel.permissionOverwrites.cache.get(guild.roles.everyone.id);
                const isMediaOnly = currentPerms?.deny.has(PermissionFlagsBits.SendMessages) || false;

                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: !isMediaOnly,
                    AttachFiles: isMediaOnly ? null : true
                });

                const embed = createEmbed(
                    'Media Channel Toggled', 
                    isMediaOnly ? 
                        `📷 Media-only mode has been disabled in ${channel.toString()}` : 
                        `📷 Media-only mode has been enabled in ${channel.toString()} (only images/videos can be sent)`
                ).setColor(0x5865F2);

                return interaction.reply({ embeds: [embed] });
            }

            case 'message': {
                if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to track messages.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const channel = options.getChannel('channel');
                const startDate = options.getString('start');
                const endDate = options.getString('end');

                if (!isValidDate(startDate)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'Invalid start date format. Use YYYY-MM-DD.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                if (!isValidDate(endDate)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'Invalid end date format. Use YYYY-MM-DD.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const start = new Date(startDate);
                const end = new Date(endDate);

                if (start > end) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'Start date must be before end date.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                await interaction.deferReply();

                let messages = [];
                let lastId;
                let hasMore = true;

                while (hasMore) {
                    const fetched = await channel.messages.fetch({
                        limit: 100,
                        ...(lastId && { before: lastId })
                    });

                    if (fetched.size === 0) break;

                    messages.push(...fetched.filter(m => 
                        new Date(m.createdTimestamp) >= start && 
                        new Date(m.createdTimestamp) <= end
                    ).values());

                    lastId = fetched.last().id;
                    hasMore = fetched.size === 100 && new Date(fetched.last().createdTimestamp) > start;
                }

                const userCounts = {};
                messages.forEach(msg => {
                    if (!userCounts[msg.author.id]) {
                        userCounts[msg.author.id] = {
                            count: 0,
                            user: msg.author
                        };
                    }
                    userCounts[msg.author.id].count++;
                });

                const sorted = Object.values(userCounts).sort((a, b) => b.count - a.count);
                const top10 = sorted.slice(0, 10);

                const embed = createEmbed(
                    'Message Statistics', 
                    `📊 Message count in ${channel.toString()} between \`${startDate}\` and \`${endDate}\``
                ).setColor(0x5865F2);

                if (top10.length > 0) {
                    embed.addFields(
                        top10.map((item, index) => ({
                            name: `${index + 1}. ${item.user.tag}`,
                            value: `${item.count} messages`,
                            inline: true
                        }))
                    );
                } else {
                    embed.setDescription('No messages found in the specified date range.');
                }

                return interaction.editReply({ embeds: [embed] });
            }

            case 'modlogs': {
                if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to view mod logs.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const target = options.getUser('user');
                const guildLogs = modLogs.get(guild.id);
                const userLogs = guildLogs?.get(target.id) || [];

                if (userLogs.length === 0) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Moderation Logs', `No moderation logs found for ${target.tag}`)],
                        ephemeral: true 
                    });
                }

                const embed = createEmbed(`Moderation Logs for ${target.tag}`, `Total actions: ${userLogs.length}`)
                    .setColor(0x5865F2);

                userLogs.slice(0, 10).forEach((log, index) => {
                    embed.addFields({
                        name: `${index + 1}. ${log.action.toUpperCase()} - <t:${Math.floor(new Date(log.timestamp).getTime() / 1000)}:R>`,
                        value: [
                            `Moderator: <@${log.moderator}>`,
                            `Reason: ${log.reason}`,
                            log.duration ? `Duration: ${log.duration}` : ''
                        ].filter(Boolean).join('\n'),
                        inline: false
                    });
                });

                return interaction.reply({ embeds: [embed], ephemeral: true });
            }

            case 'mute': {
                if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to mute members.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const target = options.getUser('user');
                const duration = options.getString('duration');
                const reason = options.getString('reason') || 'No reason provided';

                const durationMs = ms(duration);
                if (!durationMs || durationMs < 60000 || durationMs > 2419200000) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'Duration must be between 1 minute and 28 days.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                if (target.id === user.id) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You cannot mute yourself.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                if (target.id === client.user.id) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'I cannot mute myself.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const targetMember = await guild.members.fetch(target.id);
                if (!targetMember.moderatable) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'I cannot mute this user due to role hierarchy.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const endTime = new Date(Date.now() + durationMs);
                await targetMember.timeout(durationMs, reason);
                logModAction(guild.id, target.id, 'mute', user.id, reason, duration);

                const embed = createEmbed('User Muted', `🔇 Successfully muted ${target.tag} (${target.id})`)
                    .addFields(
                        { name: 'Duration', value: duration, inline: true },
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: user.tag, inline: true },
                        { name: 'Until', value: `<t:${Math.floor(endTime.getTime() / 1000)}:F>`, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });
            }

            case 'nick': {
                if (!member.permissions.has(PermissionFlagsBits.ManageNicknames)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to manage nicknames.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const target = options.getUser('user');
                const nickname = options.getString('nickname');

                if (target.id === user.id && !member.permissions.has(PermissionFlagsBits.ChangeNickname)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You cannot change your own nickname.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const targetMember = await guild.members.fetch(target.id);
                if (targetMember.roles.highest.position >= member.roles.highest.position && member.id !== guild.ownerId) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You cannot change the nickname of someone with a higher or equal role.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                await targetMember.setNickname(nickname || null);

                const embed = createEmbed('Nickname Changed', `✅ Successfully ${nickname ? 'changed' : 'reset'} nickname for ${target.tag}`)
                    .addFields(
                        { name: 'New Nickname', value: nickname || 'None (reset)', inline: true },
                        { name: 'Moderator', value: user.tag, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });
            }

            case 'ping': {
                const start = Date.now();
                await interaction.reply({ 
                    embeds: [createEmbed('Pinging...', 'Calculating latency...')],
                    ephemeral: true 
                });
                const end = Date.now();

                const embed = createEmbed('🏓 Pong!', 'Here are the latency statistics:')
                    .addFields(
                        { name: 'API Latency', value: `${Math.round(client.ws.ping)}ms`, inline: true },
                        { name: 'Response Time', value: `${end - start}ms`, inline: true }
                    )
                    .setColor(0x57F287);

                return interaction.editReply({ embeds: [embed] });
            }

            case 'purge': {
                if (!member.permissions.has(PermissionFlagsBits.ManageMessages)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to purge messages.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const amount = options.getInteger('amount');

                await interaction.deferReply({ ephemeral: true });

                const messages = await interaction.channel.messages.fetch({ limit: amount + 1 });
                const filtered = messages.filter(msg => !msg.pinned && (Date.now() - msg.createdTimestamp) < 1209600000);

                if (filtered.size === 0) {
                    return interaction.editReply({ 
                        embeds: [createEmbed('Error', 'No messages found to delete (messages older than 14 days cannot be bulk deleted).', 0xFF0000)]
                    });
                }

                await interaction.channel.bulkDelete(filtered);

                const embed = createEmbed('Messages Purged', `✅ Deleted ${filtered.size - 1} messages`)
                    .addFields(
                        { name: 'Moderator', value: user.tag, inline: true }
                    )
                    .setColor(0x57F287);

                return interaction.editReply({ embeds: [embed] });
            }

            case 'role': {
                const subCommand = options.getSubcommand();
                const target = options.getUser('user');
                const role = options.getRole('role');

                if (subCommand === 'add') {
                    if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'You do not have permission to manage roles.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    if (role.position >= member.roles.highest.position && member.id !== guild.ownerId) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'You cannot add a role that is higher or equal to your highest role.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    if (role.managed) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'This role is managed by an integration and cannot be manually assigned.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    const targetMember = await guild.members.fetch(target.id);
                    if (targetMember.roles.cache.has(role.id)) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'User already has this role.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    await targetMember.roles.add(role);
                    logModAction(guild.id, target.id, 'role_add', user.id, role.name);

                    const embed = createEmbed('Role Added', `✅ Successfully added ${role.toString()} to ${target.tag}`)
                        .addFields(
                            { name: 'Moderator', value: user.tag, inline: true }
                        );

                    return interaction.reply({ embeds: [embed] });
                } else if (subCommand === 'remove') {
                    if (!member.permissions.has(PermissionFlagsBits.ManageRoles)) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'You do not have permission to manage roles.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    if (role.position >= member.roles.highest.position && member.id !== guild.ownerId) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'You cannot remove a role that is higher or equal to your highest role.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    if (role.managed) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'This role is managed by an integration and cannot be manually removed.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    const targetMember = await guild.members.fetch(target.id);
                    if (!targetMember.roles.cache.has(role.id)) {
                        return interaction.reply({ 
                            embeds: [createEmbed('Error', 'User does not have this role.', 0xFF0000)],
                            ephemeral: true 
                        });
                    }

                    await targetMember.roles.remove(role);
                    logModAction(guild.id, target.id, 'role_remove', user.id, role.name);

                    const embed = createEmbed('Role Removed', `✅ Successfully removed ${role.toString()} from ${target.tag}`)
                        .addFields(
                            { name: 'Moderator', value: user.tag, inline: true }
                        );

                    return interaction.reply({ embeds: [embed] });
                }
                break;
            }

            case 'unban': {
                if (!member.permissions.has(PermissionFlagsBits.BanMembers)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to unban members.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const userId = options.getString('userid');
                const reason = options.getString('reason') || 'No reason provided';

                if (!/^\d{17,20}$/.test(userId)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'Invalid user ID format.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const bans = await guild.bans.fetch();
                if (!bans.has(userId)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'This user is not banned.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                await guild.bans.remove(userId, reason);
                logModAction(guild.id, userId, 'unban', user.id, reason);

                const embed = createEmbed('User Unbanned', `✅ Successfully unbanned user with ID ${userId}`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: user.tag, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });
            }

            case 'unlock': {
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to unlock channels.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const channel = options.getChannel('channel') || interaction.channel;
                
                await channel.permissionOverwrites.edit(guild.roles.everyone, {
                    SendMessages: null
                });

                const embed = createEmbed('Channel Unlocked', `🔓 ${channel.toString()} has been unlocked by ${user.tag}`)
                    .setColor(0x57F287);

                return interaction.reply({ embeds: [embed] });
            }

            case 'unlockall': {
                if (!member.permissions.has(PermissionFlagsBits.ManageChannels)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to unlock channels.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const textChannels = guild.channels.cache.filter(c => 
                    c.type === ChannelType.GuildText && 
                    !c.permissionsFor(guild.roles.everyone).has(PermissionFlagsBits.SendMessages)
                );

                let unlockedCount = 0;
                for (const channel of textChannels.values()) {
                    try {
                        await channel.permissionOverwrites.edit(guild.roles.everyone, {
                            SendMessages: null
                        });
                        unlockedCount++;
                    } catch (error) {
                        console.error(`Failed to unlock channel ${channel.name}:`, error);
                    }
                }

                const embed = createEmbed('Channels Unlocked', `🔓 Unlocked ${unlockedCount} text channels`)
                    .setColor(0x57F287);

                return interaction.reply({ embeds: [embed] });
            }

            case 'unmute': {
                if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to unmute members.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const target = options.getUser('user');
                const reason = options.getString('reason') || 'No reason provided';

                const targetMember = await guild.members.fetch(target.id);
                if (!targetMember.isCommunicationDisabled()) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'This user is not muted.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                await targetMember.timeout(null, reason);
                logModAction(guild.id, target.id, 'unmute', user.id, reason);

                const embed = createEmbed('User Unmuted', `🔊 Successfully unmuted ${target.tag} (${target.id})`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: user.tag, inline: true }
                    );

                return interaction.reply({ embeds: [embed] });
            }

            case 'warn': {
                if (!member.permissions.has(PermissionFlagsBits.ModerateMembers)) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You do not have permission to warn members.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                const target = options.getUser('user');
                const reason = options.getString('reason');

                if (target.id === user.id) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'You cannot warn yourself.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                if (target.id === client.user.id) {
                    return interaction.reply({ 
                        embeds: [createEmbed('Error', 'I cannot warn myself.', 0xFF0000)],
                        ephemeral: true 
                    });
                }

                logModAction(guild.id, target.id, 'warn', user.id, reason);

                const embed = createEmbed('User Warned', `⚠️ ${target.tag} has been warned`)
                    .addFields(
                        { name: 'Reason', value: reason, inline: true },
                        { name: 'Moderator', value: user.tag, inline: true }
                    );

                try {
                    await target.send({ 
                        embeds: [createEmbed('You have been warned', `You received a warning in ${guild.name}`)
                            .addFields(
                                { name: 'Reason', value: reason, inline: true },
                                { name: 'Moderator', value: user.tag, inline: true }
                            )
                            .setColor(0xFFA500)]
                    });
                } catch (error) {
                    console.error(`Failed to DM warning to ${target.tag}:`, error);
                    embed.addFields({ name: 'Note', value: 'Could not DM the user about this warning.', inline: false });
                }

                return interaction.reply({ embeds: [embed] });
            }

            default:
                return interaction.reply({ 
                    embeds: [createEmbed('Error', 'Unknown command.', 0xFF0000)],
                    ephemeral: true 
                });
        }
    } catch (error) {
        console.error(`Error executing command ${commandName}:`, error);
        return interaction.reply({ 
            embeds: [createEmbed('Error', 'An error occurred while executing this command.', 0xFF0000)],
            ephemeral: true 
        });
    }
});

// Giveaway button interaction
client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isButton() || interaction.customId !== 'giveaway_join') return;

    const message = interaction.message;
    const giveawayId = message.embeds[0]?.footer?.text.split('ID: ')[1];
    if (!giveawayId || !giveawayMap.has(giveawayId)) return;

    const giveaway = giveawayMap.get(giveawayId);
    if (giveaway.entries.has(interaction.user.id)) {
        return interaction.reply({ 
            embeds: [createEmbed('Error', 'You have already entered this giveaway!', 0xFF0000)],
            ephemeral: true 
        });
    }

    giveaway.entries.add(interaction.user.id);
    return interaction.reply({ 
        embeds: [createEmbed('Success', 'You have entered the giveaway!', 0x57F287)],
        ephemeral: true 
    });
});

// Giveaway end function
async function endGiveaway(giveawayId) {
    const giveaway = giveawayMap.get(giveawayId);
    if (!giveaway) return;

    const channel = await client.channels.fetch(giveaway.channelId).catch(() => null);
    if (!channel) {
        giveawayMap.delete(giveawayId);
        return;
    }

    const message = await channel.messages.fetch(giveaway.messageId).catch(() => null);
    if (!message) {
        giveawayMap.delete(giveawayId);
        return;
    }

    const entries = Array.from(giveaway.entries);
    if (entries.length === 0) {
        const embed = createEmbed('🎉 **GIVEAWAY ENDED** 🎉', giveaway.prize)
            .addFields(
                { name: 'Hosted by', value: `<@${giveaway.hostId}>`, inline: true },
                { name: 'Winners', value: giveaway.winners.toString(), inline: true },
                { name: 'Entries', value: 'No one entered this giveaway!', inline: true }
            )
            .setFooter({ text: `Giveaway ended | ID: ${giveawayId}` });

        await message.edit({ 
            embeds: [embed],
            components: []
        });

        giveawayMap.delete(giveawayId);
        return;
    }

    const winners = [];
    for (let i = 0; i < Math.min(giveaway.winners, entries.length); i++) {
        const randomIndex = Math.floor(Math.random() * entries.length);
        winners.push(entries[randomIndex]);
        entries.splice(randomIndex, 1);
    }

    const winnersMention = winners.map(id => `<@${id}>`).join(', ');
    const embed = createEmbed('🎉 **GIVEAWAY ENDED** 🎉', giveaway.prize)
        .addFields(
            { name: 'Hosted by', value: `<@${giveaway.hostId}>`, inline: true },
            { name: 'Winners', value: winnersMention, inline: true },
            { name: 'Entries', value: giveaway.entries.size.toString(), inline: true }
        )
        .setFooter({ text: `Giveaway ended | ID: ${giveawayId}` });

    await message.edit({ 
        embeds: [embed],
        components: []
    });

    const winnerEmbed = createEmbed('🎉 **YOU WON!** 🎉', `You won the giveaway for **${giveaway.prize}** in ${channel.toString()}!`)
        .setColor(0xFEE75C);

    for (const winnerId of winners) {
        try {
            const user = await client.users.fetch(winnerId);
            await user.send({ embeds: [winnerEmbed] });
        } catch (error) {
            console.error(`Failed to DM giveaway winner ${winnerId}:`, error);
        }
    }

    giveawayMap.delete(giveawayId);
}

// Start the bot
client.login(process.env.DISCORD_TOKEN);