import { EmbedBuilder } from 'discord.js';

export const MAIN_EMBED = () => new EmbedBuilder().setColor('#f8ae25');

export const ERROR_EMBED = () =>
  new EmbedBuilder().setColor('#ff0000').setAuthor({ name: 'Ошибка' });
