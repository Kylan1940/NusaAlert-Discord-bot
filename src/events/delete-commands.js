const { REST, Routes } = require("discord.js");
require("dotenv").config();

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Deleting all global commands...");

    await rest.put(Routes.applicationCommands(process.env.APPLICATION_ID), {
      body: [],
    });

    console.log("Successfully deleted all global commands.");
  } catch (error) {
    console.error(error);
  }
})();
