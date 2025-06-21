import { PlayerManager } from '@necord/lavalink';
import { Injectable } from '@nestjs/common';
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

    const track = await player.queue.shiftPrevious();

    if (!track) {
      return interaction.editReply({
        embeds: [ERROR_EMBED().setDescription('Предыдущего трека нет.')],
      });
    }

    await player.play({ clientTrack: track });

    const embed = MAIN_EMBED().setDescription(
      `Трек [**${track.info.title} от ${track.info.author}**](${track.info.uri}) включен заново.`,
    );

    await interaction.editReply({ embeds: [embed] });
  }
}
