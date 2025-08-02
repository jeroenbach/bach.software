import yaml from "yaml";

export const readYaml = <T>(raw: string) => yaml.parse(raw) as T;
