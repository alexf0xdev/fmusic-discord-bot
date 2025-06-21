import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import {
  Context,
  IntegerOption,
  Options,
  SlashCommand,
  SlashCommandContext,
} from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';

export class RemoveCommandOptions {
  @IntegerOption({
    name: 'айди_трека',
    description: 'Айди трека из очереди',
    required: true,
    min_value: 1,
  })
  trackId: number;
}

@Injectable()
export class RemoveCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'remove',
    description: 'Убрать трек из очереди',
  })
  async remove(
    @Context() [interaction]: SlashCommandContext,
    @Options() { trackId }: RemoveCommandOptions,
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

    const index = trackId - 1;

    const track = player.queue.tracks[index];

    if (!track) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Трек не найден.')],
      });
    }

    await player.queue.remove(index);

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${track.info.title} от ${track.info.author}**](${track.info.uri}) убран из очереди.`,
    );

    await interaction.editReply({ embeds: [embed] });
  }
}
