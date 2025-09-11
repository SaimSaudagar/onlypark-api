module.exports = {
    apps: [
      {
        name: "onlypark-api",
        script: "npm",
        args: "run start:prod",
        instances: 1, // you can change to "max" to use all CPU cores
        autorestart: true,
        watch: false,
        max_memory_restart: "500M", // restart if memory exceeds 500MB
        env: {
          NODE_ENV: "production",
        },
        error_file: "./logs/err.log",
        out_file: "./logs/out.log",
        log_date_format: "YYYY-MM-DD HH:mm:ss",
      },
    ],
  };
  