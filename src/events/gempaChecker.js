const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');
 const { saveEarthquake } = require('../database/gempaRepository');

let lastGempaId = null;

module.exports = {
    name: 'clientReady',
    once: true,

    async execute(client) {
        console.log('Gempa checker aktif.');

        const checkGempa = async () => {
            try {
                const response = await fetch(
                    'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json'
                );

                if (!response.ok) {
                    throw new Error(
                        `BMKG returned HTTP ${response.status}`
                    );
                }

                const data = await response.json();
                const gempa = data?.Infogempa?.gempa;
                
                const result = saveEarthquake(gempa);
                
                if (!result.isNew) {
                    return;
                }
                console.log(`Gempa baru tersimpan: ${gempa.Tanggal} ${gempa.Jam} - M${gempa.Magnitude}`);

                if (!gempa) {
                    console.error('Data gempa tidak ditemukan.');
                    return;
                }

                const gempaId =`${gempa.Tanggal}-${gempa.Jam}-${gempa.Magnitude}`;
                if (gempaId === lastGempaId) return;
                lastGempaId = gempaId;

                const configFolder = path.join(
                    __dirname,
                    '../../gempa-config'
                );

                if (!fs.existsSync(configFolder)) return;

                const files = fs.readdirSync(configFolder);

                for (const file of files) {
                    try {
                        const config = JSON.parse(
                            fs.readFileSync(
                                path.join(configFolder, file),
                                'utf8'
                            )
                        );

                        const channel = await client.channels
                            .fetch(config.channelId)
                            .catch(() => null);

                        if (!channel) continue;

                        const embed = new EmbedBuilder()
                            .setTitle('🚨 Gempa Terbaru')
                            .addFields(
                                {
                                    name: 'Lokasi',
                                    value: gempa.Wilayah
                                },
                                {
                                    name: 'Waktu',
                                    value: `${gempa.Tanggal} ${gempa.Jam}`
                                },
                                {
                                    name: 'Magnitudo',
                                    value: gempa.Magnitude,
                                    inline: true
                                },
                                {
                                    name: 'Kedalaman',
                                    value: gempa.Kedalaman,
                                    inline: true
                                },
                                {
                                    name: 'Potensi',
                                    value: gempa.Potensi
                                }
                            )
                            .setFooter({text: 'Data dari BMKG'})
                            .setTimestamp();
                        await channel.send({embeds: [embed]});
                    } catch (error) {
                        console.error(`Failed to process config ${file}:`, error.message);
                    }
                }
            } catch (error) {
                console.error('Gempa checker error:', error.message);
            }
        };

        await checkGempa();
        setInterval(checkGempa, 60000);
    }
};