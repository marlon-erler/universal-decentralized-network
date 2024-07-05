import Fs from "fs/promises";

// CONFIG
const configPath = "config.json";

export const defaultConfig = {
  port: 3000,
  connectedServers: [],
  subscribedChannels: [],
};

// METHODS
export async function createConfig() {
  const configString = JSON.stringify(defaultConfig, null, 4);
  await Fs.writeFile(configPath, configString);
}

export async function getConfig(): Promise<typeof defaultConfig> {
  try {
    const configString = (await Fs.readFile(configPath)).toString();
    const configObject = JSON.parse(configString);

    Object.keys(defaultConfig).forEach((key) => {
      if (!configObject[key]) throw null;
    });

    return configObject;
  } catch {
    createConfig();
    return defaultConfig;
  }
}
