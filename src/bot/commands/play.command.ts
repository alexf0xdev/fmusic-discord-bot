import { NecordLavalinkService, PlayerManager } from '@necord/lavalink';
import { Injectable, UseFilters } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import {
  Context,
  Options,
  SlashCommand,
  SlashCommandContext,
  StringOption,
} from 'necord';
import { ErrorFilter } from '../filters/error.filter';
import { SOURCES } from '../utils/constants.util';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';
import { formatMilliseconds } from '../utils/format.util';

export class PlayCommandOptions {
  @StringOption({
    name: 'запрос',
    description: 'Ссылка или название трека',
    required: true,
    max_length: 500,
  })
  query: string;

  @StringOption({
    name: 'сервис',
    description: 'Сервис для поиска трека',
    choices: [
      { name: 'YouTube', value: 'youtube' },
      { name: 'Spotify', value: 'spotify' },
      { name: 'SoundCloud', value: 'soundcloud' },
      { name: 'Яндекс Музыка', value: 'yandexmusic' },
      { name: 'ВКонтакте', value: 'vkmusic' },
    ],
  })
  source: 'youtube' | 'spotify' | 'soundcloud' | 'yandexmusic' | 'vkmusic';
}

@Injectable()
@UseFilters(ErrorFilter)
export class PlayCommand {
  constructor(
    private playerManager: PlayerManager,
    private lavalinkService: NecordLavalinkService,
  ) {}

  @SlashCommand({
    name: 'play',
    description: 'Найти трек по ссылке/названию',
  })
  async play(
    @Context() [interaction]: SlashCommandContext,
    @Options() { query, source }: PlayCommandOptions,
  ) {
    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.voice.channel) {
      const embed = ERROR_EMBED().setDescription('Войдите в канал.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    try {
      let player = this.playerManager.get(interaction.guild.id);

      if (!player) {
        player = this.playerManager.create({
          ...this.lavalinkService.extractInfoForPlayer(interaction),
          selfDeaf: true,
          selfMute: false,
          volume: 40,
        });
      }

      const result = await player.search(
        { query, source },
        interaction.member.user.id,
      );

      const currentTrack = result.tracks[0];

      await player.queue.add(currentTrack);

      await player.connect();

      if (!player.playing) await player.play();

      const embed = MAIN_EMBED()
        .setTitle(currentTrack.info.title)
        .setAuthor({ name: 'Трек добавлен' })
        .setDescription(currentTrack.info.author)
        .setURL(currentTrack.info.uri)
        .setThumbnail(currentTrack.info.artworkUrl)
        .addFields(
          {
            name: 'Длительность',
            value: formatMilliseconds(currentTrack.info.duration),
            inline: true,
          },
          {
            name: 'В очереди',
            value: `${player.queue.tracks.length + 1}`,
            inline: true,
          },
        )
        .setFooter({
          text: SOURCES[currentTrack.info.sourceName].name,
          iconURL: SOURCES[currentTrack.info.sourceName].iconUrl,
        });

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      let description: string;

      switch (true) {
        case error.message.includes(
          'Query / Link Provided for this Source but Lavalink Node has not',
        ):
          description = 'Сервис не поддерживается.';
          break;
        case error.message.includes(
          'There is no Track in the Queue, nor provided in the PlayOptions',
        ):
          description = 'Неверная ссылка.';
          break;
        default:
          description = 'Произошла неизвестная ошибка.';
          break;
      }

      const embed = ERROR_EMBED().setDescription(description);

      await interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }
  }
}
