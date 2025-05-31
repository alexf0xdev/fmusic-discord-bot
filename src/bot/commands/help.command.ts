import { Injectable } from '@nestjs/common';
import { MessageFlags } from 'discord.js';
import { Context, SlashCommand, SlashCommandContext } from 'necord';
import { MAIN_EMBED } from '../utils/embeds.util';

@Injectable()
export class HelpCommand {
  @SlashCommand({
    name: 'help',
    description: 'Помощь по командам',
  })
  async help(@Context() [interaction]: SlashCommandContext) {
    const embed = MAIN_EMBED()
      .setAuthor({ name: 'Помощь по командам' })
      .setDescription(
        '</play:1374107913802743910> - найти трек/плейлист по ссылке/названию\n</stop:1374107913802743911> - очистить очередь треков и отключить бота\n</pause:1374107913802743912> - поставить трек на паузу/убрать с паузы\n</queue:1374107913802743916> - показать очередь треков\n</skip:1374107913802743913> - пропустить трек в очереди\n</previous:1374107913802743914> - включить предыдущий трек\n</remove:1375077063249104967> - убрать трек из очереди',
      );

    await interaction.reply({
      embeds: [embed],
      flags: MessageFlags.Ephemeral,
    });
  }
}
