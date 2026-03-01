const { SlashCommandBuilder, ChannelType, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setgempa')
    .setDescription('Set channel untuk notifikasi gempa otomatis')
    .addChannelOption(option =>
      option
        .setName('channel')
        .setDescription('Pilih text channel')
        .addChannelTypes(ChannelType.GuildText)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    const channel = interaction.options.getChannel('channel');

    const folderPath = path.join(__dirname, '../../gempa-config');
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath);
    }

    fs.writeFileSync(
      path.join(folderPath, `${interaction.guild.id}.json`),
      JSON.stringify(
        {
          guildId: interaction.guild.id,
          channelId: channel.id
        },
        null,
        2
      )
    );

    await interaction.reply({
      content: `✅ Notifikasi gempa akan dikirim ke ${channel}`,
      ephemeral: true
    });
  }
};