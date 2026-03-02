const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('gempaterbaru')
    .setDescription('Menampilkan informasi gempa terbaru dari BMKG'),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      const response = await fetch(
        'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json'
      );

      if (!response.ok) {
        throw new Error('Gagal mengambil data dari BMKG');
      }

      const data = await response.json();
      const gempa = data.Infogempa.gempa;

      const embed = new EmbedBuilder()
        .setTitle('🌍 Gempa Terbaru')
        .setColor(0xff0000)
        .addFields(
          { name: 'Lokasi', value: gempa.Wilayah },
          { name: 'Waktu', value: `${gempa.Tanggal} ${gempa.Jam}` },
          { name: 'Magnitudo', value: gempa.Magnitude, inline: true },
          { name: 'Kedalaman', value: gempa.Kedalaman, inline: true },
          { name: 'Potensi', value: gempa.Potensi }
        )
        .setFooter({ text: 'Data dari BMKG' })
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

    } catch (error) {
      console.error(error);
      await interaction.editReply(
        'Terjadi kesalahan saat mengambil data gempa.'
      );
    }
  },
};