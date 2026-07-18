FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Authentication-service/auth-service/AuthService.sln ./
COPY Authentication-service/auth-service/src ./src

WORKDIR /src
RUN dotnet restore AuthService.sln
RUN dotnet publish src/AuthService.Api/AuthService.Api.csproj -c Release -o /app/publish /p:UseAppHost=false

FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 5092
ENTRYPOINT ["dotnet", "AuthService.Api.dll"]
