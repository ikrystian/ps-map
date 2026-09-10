module.exports = {
  apps: [
    {
      name: "prosta-sprawa",
      script: "server.ts",
      interpreter: "bun",
      cwd: "/root/projects/ps-map",
      env: {
        NODE_ENV: "production",
      },
    },
  ],
}
