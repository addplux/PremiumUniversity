module.exports = {
    apps: [{
        name: 'psohs-backend',
        script: 'server.js',
        instances: 'max',
        exec_mode: 'cluster',
        watch: false,
        max_memory_restart: '1G',
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        },
        combine_logs: true,
        merge_logs: true,
        error_file: 'logs/err.log',
        out_file: 'logs/out.log',
        time: true
    }]
};
