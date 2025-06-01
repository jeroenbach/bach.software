# Kiota backend client

[For more info see the Kiota documentation](https://learn.microsoft.com/en-us/openapi/kiota)

## Install

```bash
dotnet tool install -g microsoft.openapi.kiota
```

Latest Kiota CLI checks the web for updates. To disable this add `KIOTA_OFFLINE_ENABLED` as an environment variable with
the value `true`.

Bash:

```bash
export KIOTA_OFFLINE_ENABLED=true
```

## Generate the client

1. Run the backend locally
2. Run the command below in this folder

```bash
kiota generate -l typescript -d http://localhost:7071/api/swagger.json -c BackendApiClient -n Backend -o . --exclude-backward-compatible

```

## Update
```shell
kiota update -o .
```
