import { NecordLavalinkService, PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import {
  Context,
  Options,
  SlashCommand,
  SlashCommandContext,
  StringOption,
} from 'necord';
import { ERROR_EMBED, MAIN_EMBED, SOURCES } from '../bot.constants';
import { formatMilliseconds } from '../utils/format.util';

export class PlayCommandOptions {
  @StringOption({
    name: 'запрос',
    description: 'Ссылка или название трека/плейлиста',
    required: true,
    max_length: 500,
  })
  query: string;

  @StringOption({
    name: 'сервис',
    description: 'Сервис для поиска трека/плейлиста',
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
export class PlayCommand {
  constructor(
    private playerManager: PlayerManager,
    private lavalinkService: NecordLavalinkService,
  ) {}

  @SlashCommand({
    name: 'play',
    description: 'Найти трек/плейлист по ссылке/названию',
  })
  async play(
    @Context() [interaction]: SlashCommandContext,
    @Options() { query, source }: PlayCommandOptions,
  ) {
    await interaction.deferReply();

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (!member.voice.channel) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Войдите в канал.')],
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

      if (player.voiceChannelId !== member.voice.channelId) {
        return interaction.editReply({
          embeds: [ERROR_EMBED().setDescription('Войдите в канал с ботом.')],
        });
      }

      const result = await player.search({ query, source }, member.id);

      if (!result || !result.tracks?.length) {
        return interaction.editReply({
          embeds: [ERROR_EMBED().setDescription('Трек не найден.')],
        });
      }

      const track = result.tracks[0];
      const playlist = result.playlist;

      const isPlaylist = result.loadType === 'playlist';

      await player.queue.add(isPlaylist ? result.tracks : track);

      await player.connect();

      if (!player.playing) await player.play();

      const sourceInfo = SOURCES[track.info.sourceName];

      const embed = isPlaylist
        ? MAIN_EMBED()
            .setTitle(playlist.title)
            .setAuthor({ name: 'Плейлист добавлен' })
            .setDescription(playlist.author)
            .setURL(playlist.uri)
            .setThumbnail(playlist.thumbnail)
            .addFields(
              {
                name: 'Длительность',
                value: formatMilliseconds(playlist.duration),
                inline: true,
              },
              {
                name: 'Добавлено в очередь',
                value: `${result.tracks.length + 1}`,
                inline: true,
              },
            )
            .setFooter({ text: sourceInfo.name, iconURL: sourceInfo.iconUrl })
        : MAIN_EMBED()
            .setTitle(track.info.title)
            .setAuthor({ name: 'Трек добавлен' })
            .setDescription(track.info.author)
            .setURL(track.info.uri)
            .setThumbnail(track.info.artworkUrl)
            .addFields(
              {
                name: 'Длительность',
                value: formatMilliseconds(track.info.duration),
                inline: true,
              },
              {
                name: 'В очереди',
                value: `${player.queue.tracks.length + 1}`,
                inline: true,
              },
            )
            .setFooter({ text: sourceInfo.name, iconURL: sourceInfo.iconUrl });

      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      const embed = ERROR_EMBED().setDescription(
        'Произошла ошибка. Возможно сервис не поддерживается.',
      );

      await interaction.editReply({ embeds: [embed] });
    }
  }
}
