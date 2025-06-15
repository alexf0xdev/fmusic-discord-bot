import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../bot.constants';

@Injectable()
export class PreviousCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'previous',
    description: 'Включить предыдущий трек',
  })
  async previous(@Context() [interaction]: SlashCommandContext) {
    const player = this.playerManager.get(interaction.guild.id);

    if (!player) {
      return interaction.reply({
        embeds: [ERROR_EMBED().setDescription('Бот не запущен.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const member = interaction.guild.members.cache.get(interaction.user.id);

    if (player.voiceChannelId !== member.voice.channelId) {
      return interaction.reply({
        embeds: [ERROR_EMBED().setDescription('Войдите в канал с ботом.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    const track = await player.queue.shiftPrevious();

    if (!track) {
      return interaction.reply({
        embeds: [ERROR_EMBED().setDescription('Предыдущего трека нет.')],
        flags: MessageFlags.Ephemeral,
      });
    }

    await player.play({ clientTrack: track });

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${track.info.title} от ${track.info.author}**](${track.info.uri}) включен заново.`,
    );

    await interaction.reply({ embeds: [embed] });
  }
}
