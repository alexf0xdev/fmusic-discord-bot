import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { SOURCES } from '../bot.constants';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';
import { formatMilliseconds } from '../utils/format.util';
import { paginate } from '../utils/paginate.util';

@Injectable()
export class QueueCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'queue',
    description: 'Показать очередь треков',
  })
  async queue(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      const embed = ERROR_EMBED().setDescription('Бот не запущен.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const tracks = player.queue.tracks;
    const track = player.queue.current;

    const sourceInfo = SOURCES[track?.info.sourceName];

    const currentTrackEmbed = track
      ? MAIN_EMBED()
          .setTitle(track.info.title)
          .setAuthor({ name: 'Сейчас играет' })
          .setDescription(track.info.author)
          .setURL(track.info.uri)
          .setThumbnail(track.info.artworkUrl)
          .addFields(
            {
              name: 'Длительность',
              value: `${formatMilliseconds(player.lastPosition)} из ${formatMilliseconds(track.info.duration)}`,
              inline: true,
            },
            {
              name: '\u200B',
              value: '\u200B',
              inline: true,
            },
          )
          .setFooter({ text: sourceInfo.name, iconURL: sourceInfo.iconUrl })
      : MAIN_EMBED()
          .setAuthor({ name: 'Сейчас играет' })
          .setDescription('Сейчас ничего не играет.');

    if (!tracks.length) {
      const embed = MAIN_EMBED()
        .setAuthor({ name: 'Очередь треков' })
        .setDescription('Треков нет.');

      return interaction.reply({
        embeds: [currentTrackEmbed, embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const trackPerPage = 10;
    const totalPages = Math.ceil(tracks.length / trackPerPage);

    const pages = [...Array(totalPages)].map((_, index) => {
      const startIndex = index * trackPerPage;
      const endIndex = startIndex + trackPerPage;
      const pageTracks = tracks.slice(startIndex, endIndex);

      return MAIN_EMBED()
        .setAuthor({ name: 'Очередь треков' })
        .setDescription(
          pageTracks
            .map(
              (track, i) =>
                `${startIndex + i + 1}. [**${track.info.title} от ${track.info.author}**](${track.info.uri})`,
            )
            .join('\n'),
        )
        .setFooter({
          text: `Страница: ${index + 1}/${totalPages}  •  Всего треков: ${tracks.length}`,
        });
    });

    await paginate({
      interaction,
      pages,
      otherEmbeds: [currentTrackEmbed],
      ephemeral: true,
    });
  }
}
