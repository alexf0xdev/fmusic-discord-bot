import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { ERROR_EMBED, MAIN_EMBED } from '../utils/embeds.util';

@Injectable()
export class StopCommand {
  constructor(private playerManager: PlayerManager) {}

  @SlashCommand({
    name: 'stop',
    description: 'Очистить очередь треков и отключить бота',
  })
  async stop(@Context() [interaction]: SlashCommandContext) {
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

    await player.destroy();

    const embed = MAIN_EMBED().setDescription(
      'Очередь треков очищена, бот отключен.',
    );

    await interaction.reply({ embeds: [embed] });
  }
}
