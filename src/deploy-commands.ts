import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "./config";
import commandsModules from "./commands";

const commands: SlashCommandBuilder[] = [];
for (const module of Object.values(commandsModules)) {
  commands.push(module.data);
}

const rest = new REST({ version: "10" }).setToken(config.DISCORD_TOKEN);

async function main() {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(
      Routes.applicationGuildCommands(
        config.DISCORD_CLIENT_ID,
        config.DISCORD_GUILD_ID
      ),
      {
        body: commands,
      }
    );

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
}

main();
