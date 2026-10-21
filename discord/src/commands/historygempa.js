const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getLatestEarthquakes } = require('../database/gempaRepository');

const ITEMS_PER_PAGE = 5;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('historygempa')
        .setDescription('Menampilkan riwayat gempa yang tercatat NusaAlert'),

    async execute(interaction) {
        const earthquakes = getLatestEarthquakes(100);

        if (earthquakes.length === 0) {
            return interaction.reply({
                content: 'Belum ada data gempa yang tersimpan.',
                flags: 64
            });
        }

        let page = 0;

        const getPageCount = () =>
            Math.ceil(earthquakes.length / ITEMS_PER_PAGE);

        const createEmbed = (currentPage) => {
            const start = currentPage * ITEMS_PER_PAGE;
            const pageData = earthquakes.slice(
                start,
                start + ITEMS_PER_PAGE
            );

            const description = pageData
                .map((gempa, index) => {
                    const number = start + index + 1;

                    return [
                        `**${number}. M${gempa.magnitude} - ${gempa.wilayah}**`,
                        `> ${gempa.tanggal} ${gempa.jam}`,
                        `> Kedalaman: ${gempa.kedalaman}`
                    ].join('\n');
                })
                .join('\n\n');

            return new EmbedBuilder()
                .setTitle('Riwayat Gempa')
                .setDescription(description)
                .setFooter({text: `Halaman ${currentPage + 1}/${getPageCount()} • ${earthquakes.length} gempa tercatat`})
                .setTimestamp();
        };

        const createButtons = (currentPage) => {
            return new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('historygempa_previous')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage === 0),

                new ButtonBuilder()
                    .setCustomId('historygempa_next')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(currentPage >= getPageCount() - 1)
            );
        };

        const message = await interaction.reply({
            embeds: [createEmbed(page)],
            components: [createButtons(page)],
            fetchReply: true
        });

        const collector = message.createMessageComponentCollector({
            time: 120000
        });

        collector.on('collect', async (buttonInteraction) => {
            if (buttonInteraction.user.id !== interaction.user.id) {
                return buttonInteraction.reply({
                    content: 'Tombol ini bukan untuk lo.',
                    flags: 64
                });
            }

            if (buttonInteraction.customId === 'historygempa_previous') {
                page--;
            }

            if (buttonInteraction.customId === 'historygempa_next') {
                page++;
            }

            await buttonInteraction.update({
                embeds: [createEmbed(page)],
                components: [createButtons(page)]
            });
        });

        collector.on('end', async () => {
            try {
                await message.edit({
                    components: [createButtons(page).setComponents(
                        ...createButtons(page).components.map(component =>
                            ButtonBuilder.from(component).setDisabled(true)
                        )
                    )]
                });
            } catch {
            }
        });
    }
};