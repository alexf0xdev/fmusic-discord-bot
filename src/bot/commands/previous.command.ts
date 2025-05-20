import { PlayerManager } from '@necord/lavalink';
import { Injectable, UseFilters } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ErrorFilter } from '../filters/error.filter';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';

@Injectable()
@UseFilters(ErrorFilter)
export class PreviousCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'previous',
    description: 'Включить предыдущий трек',
  })
  async previous(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      const embed = ERROR_EMBED().setDescription('Бот не запущен.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (player.voiceChannelId !== member.voice.channelId) {
      const embed = ERROR_EMBED().setDescription('Войдите в канал с ботом.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    const previousTrack = await player.queue.shiftPrevious();

    if (!previousTrack) {
      const embed = ERROR_EMBED().setDescription('Предыдущего трека нет.');

      return interaction.reply({
        embeds: [embed],
        flags: MessageFlags.Ephemeral,
      });
    }

    await player.play({ clientTrack: previousTrack });

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${previousTrack.info.title} от ${previousTrack.info.author}**](${previousTrack.info.uri}) включен заново.`,
    );

    await interaction.reply({ embeds: [embed] });
  }
}
