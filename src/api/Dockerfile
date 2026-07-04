FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

COPY Bach.Software.sln .
COPY Bach.Software.Web/Bach.Software.Web.csproj Bach.Software.Web/
COPY Bach.Software.Application/Bach.Software.Application.csproj Bach.Software.Application/
COPY Bach.Software.Core/Bach.Software.Core.csproj Bach.Software.Core/
COPY Bach.Software.Infrastructure/Bach.Software.Infrastructure.csproj Bach.Software.Infrastructure/

RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet restore Bach.Software.Web/Bach.Software.Web.csproj

COPY . .

RUN --mount=type=cache,id=nuget,target=/root/.nuget/packages \
    dotnet publish Bach.Software.Web/Bach.Software.Web.csproj \
    -c Release \
    -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Bach.Software.Web.dll"]
