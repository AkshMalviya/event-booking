module.exports = {
  apps: [
    {
      name: 'api-gateway',
      script: 'dist/apps/api-gateway/main.js',
      env: {
        PORT: process.env.PORT || 4000,
        KAFKA_BROKERS: process.env.KAFKA_BROKERS || 'kafka:29092',
        STARTUP_DELAY: '0',
      },
    },
    {
      name: 'auth-service',
      script: 'dist/apps/auth-service/main.js',
      env: {
        KAFKA_BROKERS: process.env.KAFKA_BROKERS || 'kafka:29092',
        MONGODB_URI: process.env.AUTH_DB_URI || 'mongodb://mongo:27017/auth_db',
        STARTUP_DELAY: '4000',
      },
    },
    {
      name: 'booking-service',
      script: 'dist/apps/booking-service/main.js',
      env: {
        KAFKA_BROKERS: process.env.KAFKA_BROKERS || 'kafka:29092',
        MONGODB_URI:
          process.env.BOOKING_DB_URI || 'mongodb://mongo:27017/booking_db',
        STARTUP_DELAY: '8000',
      },
    },
    {
      name: 'event-service',
      script: 'dist/apps/event-service/main.js',
      env: {
        KAFKA_BROKERS: process.env.KAFKA_BROKERS || 'kafka:29092',
        MONGODB_URI:
          process.env.EVENT_DB_URI || 'mongodb://mongo:27017/event_db',
        STARTUP_DELAY: '12000',
      },
    },
  ],
};
