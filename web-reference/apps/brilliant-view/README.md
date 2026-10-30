# Introduction

The brilliant view frontend application.
This project should contain application logic primarily.

For generic components, see `brilliant_react_components` repository.

# Getting Started

## Running locally

-   Make sure you have added the azure feed to your npmrc config
    -   See https://learn.microsoft.com/en-us/azure/devops/artifacts/npm/scopes?view=azure-devops
    -   This is required to download the brilliant components dependency from Azure
-   Install dependencies
    -   `yarn install`
-   Run in development
    -   `yarn dev`

The frontend relies heavily on the brilliant view backend API to fetch various data.

When developing, you should run this locally. See the `brilliant_view_api` repository.

## Running docker for build

-   Build the docker image
    -   Must provide personal access token with read access to brilliant feed (artifacts in devops)
        -   `docker build -t brilliant_view_frontend --build-arg pat=<personal-access-token>`
-   Run the docker image to build static files
    -   `docker run -t brilliant_view_frontend`

This will produce static files in the `/brilliant_view_frontend/dist` folder inside the container.
Mount this directory in kubernetes before build and serve it using nginx or similar.

# Contribute

TODO: Explain how other users and developers can contribute to make your code better.

If you want to learn more about creating good readme files then refer the following [guidelines](https://docs.microsoft.com/en-us/azure/devops/repos/git/create-a-readme?view=azure-devops). You can also seek inspiration from the below readme files:

-   [ASP.NET Core](https://github.com/aspnet/Home)
-   [Visual Studio Code](https://github.com/Microsoft/vscode)
-   [Chakra Core](https://github.com/Microsoft/ChakraCore)
