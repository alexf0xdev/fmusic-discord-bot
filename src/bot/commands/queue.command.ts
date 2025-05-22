import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { SOURCES } from '../utils/constants.util';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';
import { formatMilliseconds } from '../utils/format.util';

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

    const currentTrack = player.queue.current;

    const currentTrackEmbed = currentTrack
      ? MAIN_EMBED()
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
          })
      : MAIN_EMBED()
          .setAuthor({ name: 'Сейчас играет' })
          .setDescription('Сейчас ничего не играет.');

    const tracks = player.queue.tracks;

    const queueListEmbed = MAIN_EMBED()
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
