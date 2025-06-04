import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { ButtonBuilder, ButtonStyle, MessageFlags } from 'discord.js';
import paginationEmbed from 'discordjs-v14-pagination';
import {
  Context,
  NumberOption,
  Options,
  SlashCommand,
  SlashCommandContext,
} from 'necord';
import { SOURCES } from '../bot.constants';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';
import { formatMilliseconds } from '../utils/format.util';

export class QueueCommandOptions {
  @NumberOption({
    name: 'страница',
    description: 'Страница очереди треков',
    min_value: 1,
    max_value: 100,
  })
  page?: number;
}

@Injectable()
export class QueueCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'queue',
    description: 'Показать очередь треков',
  })
  async queue(
    @Context() [interaction]: SlashCommandContext,
    @Options() { page }: QueueCommandOptions,
  ) {
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

    const sourceInfo = SOURCES[track.info.sourceName];

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

    const currentPage = page ?? 1;

    const pages = tracks.map(
      (track, index) =>
        `${index + 2}. [**${track.info.title} от ${track.info.author}**](${track.info.uri})`,
    );

    const queueListEmbed = tracks.length
      ? MAIN_EMBED()
          .setAuthor({ name: 'Очередь треков' })
          .setDescription('Трек')
      : MAIN_EMBED()
          .setAuthor({ name: 'Очередь треков' })
          .setDescription('Треков нет.');

    const previousButton = new ButtonBuilder()
      .setCustomId('previous')
      .setLabel('⬅️')
      .setStyle(ButtonStyle.Secondary);

    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setLabel('➡️')
      .setStyle(ButtonStyle.Secondary);

    await paginationEmbed(
      interaction,
      [currentTrackEmbed, queueListEmbed],
      [previousButton, nextButton],
      60000,
      'Страница {current}/{total}',
    );
  }
}
