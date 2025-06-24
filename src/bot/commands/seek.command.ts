import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import {
  Context,
  Options,
  SlashCommand,
  SlashCommandContext,
  StringOption,
} from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';
import { formatMilliseconds, timeToMilliseconds } from '../utils/time.util';

export class SeekCommandOptions {
  @StringOption({
    name: 'время',
    description: 'Время для перемотки (в секундах или в формате 0:00)',
    required: true,
    min_length: 1,
    max_length: 8,
  })
  time: string;
}

@Injectable()
export class SeekCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'seek',
    description: 'Перемотать трек',
  })
  async seek(
    @Context() [interaction]: SlashCommandContext,
    @Options() { time }: SeekCommandOptions,
  ) {
    await interaction.deferReply();

    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Бот не запущен.')],
      });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (player.voiceChannelId !== member.voice.channelId) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Войдите в канал с ботом.')],
      });
    }
    const track = player.queue.current;

    if (!track) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Сейчас ничего не играет.')],
      });
    }

    if (!track.info.isSeekable) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Трек нельзя перемотать.')],
      });
    }

    const timeMilliseconds = time.includes(':')
      ? timeToMilliseconds(time)
      : +time * 1000;

    if (isNaN(timeMilliseconds)) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Неверное значение времени.')],
      });
    }

    await player.seek(timeMilliseconds);

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${track.info.title} от ${track.info.author}**](${track.info.uri}) перемотан на **${formatMilliseconds(timeMilliseconds)}** из **${formatMilliseconds(track.info.duration)}**.`,
    );

    await interaction.editReply({ embeds: [embed] });
  }
}
