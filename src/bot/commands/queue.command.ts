import { PlayerManager } from '@necord/lavalink';
import { Injectable, UseFilters } from '@nestjs/common';
import { EmbedBuilder, MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ErrorFilter } from '../filters/error.filter';
import { SOURCES } from '../utils/constants.util';
import { formatMilliseconds } from '../utils/format.util';

@Injectable()
@UseFilters(ErrorFilter)
export class QueueCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'queue',
    description: 'Показать очередь треков',
  })
  async queue(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      const embed = new EmbedBuilder()
        .setColor('#ff0000')
        .setAuthor({ name: 'Ошибка' })
        .setDescription('Бот не запущен.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const currentTrack = player.queue.current;

    const currentTrackEmbed = new EmbedBuilder()
      .setColor('#FF8000')
      .setTitle(currentTrack.info.title)
      .setAuthor({ name: 'Сейчас играет' })
      .setDescription(currentTrack.info.author)
      .setURL(currentTrack.info.uri)
      .setThumbnail(currentTrack.info.artworkUrl)
      .addFields(
        {
          name: 'Длительность',
          value: `${formatMilliseconds(player.lastPosition)} из ${formatMilliseconds(currentTrack.info.duration)}`,
          inline: true,
        },
        {
          name: '\u200B',
          value: '\u200B',
          inline: true,
        },
      )
      .setFooter({
        text: SOURCES[currentTrack.info.sourceName].name,
        iconURL: SOURCES[currentTrack.info.sourceName].iconUrl,
      });

    const tracks = player.queue.tracks;

    const queueListEmbed = new EmbedBuilder()
      .setColor('#FF8000')
      .setAuthor({ name: 'Очередь треков' })
      .setDescription(
        tracks.length
          ? player.queue.tracks
              .map(
                (track, index) =>
                  `${index + 2}. [**${track.info.title} от ${track.info.author}**](${track.info.uri})`,
              )
              .join('\n')
          : 'Треков больше нет.',
      );

    await interaction.reply({
      embeds: [currentTrackEmbed, queueListEmbed],
      flags: MessageFlags.Ephemeral,
    });
  }
}
