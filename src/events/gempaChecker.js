const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

let lastGempaId = null;

module.exports = {
  name: 'clientReady',
  once: true,

  async execute(client) {
    console.log('Gempa checker aktif.');

    setInterval(async () => {
      try {
        const response = await fetch(
          'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json'
        );

        const data = await response.json();
        const gempa = data.Infogempa.gempa;

        const gempaId = `${gempa.Tanggal}-${gempa.Jam}-${gempa.Magnitude}`;

        // Cek apakah gempa ini sudah pernah dikirim sebelumnya
        if (gempaId === lastGempaId) return;
        lastGempaId = gempaId;

        const configFolder = path.join(__dirname, '../../gempa-config');
        if (!fs.existsSync(configFolder)) return;

        const files = fs.readdirSync(configFolder);

        for (const file of files) {
          const config = JSON.parse(
            fs.readFileSync(path.join(configFolder, file))
          );

          const channel = await client.channels
            .fetch(config.channelId)
            .catch(() => null);

          if (!channel) continue;

          const embed = new EmbedBuilder()
            .setTitle('🚨 Gempa Terbaru')
            .addFields(
              { name: 'Lokasi', value: gempa.Wilayah },
              { name: 'Waktu', value: `${gempa.Tanggal} ${gempa.Jam}` },
              { name: 'Magnitudo', value: gempa.Magnitude, inline: true },
              { name: 'Kedalaman', value: gempa.Kedalaman, inline: true },
              { name: 'Potensi', value: gempa.Potensi }
            )
            .setFooter({ text: 'Data dari BMKG' })
            .setTimestamp();

          channel.send({ embeds: [embed] });
        }

      } catch (err) {
        console.error('Gempa checker error:', err);
      }
    }, 60000);
  },
};