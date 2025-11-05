# SwiftEX Server

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>

## Description

SwiftEX Server is a NestJS-based backend service that provides APIs for cryptocurrency trading, wallet management, and market data services. Built with TypeScript and designed for scalability and performance.

## Features

- 🔐 **Authentication & Authorization** - JWT-based auth with OTP verification
- 💰 **Wallet Management** - Stellar blockchain wallet operations
- 📊 **Market Data** - Real-time cryptocurrency market information
- 🔔 **Notifications** - Firebase push notifications
- 📧 **Email Services** - Gmail integration for notifications
- 📱 **Device Management** - FCM token management for mobile apps
- ⚡ **Alchemy Integration** - Blockchain transaction services
- 🌟 **Stellar Network** - Stellar blockchain operations

## Tech Stack

- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT, Passport
- **Email**: Gmail OAuth2, Handlebars templates
- **Notifications**: Firebase Admin SDK
- **Blockchain**: Stellar SDK, Alchemy API
- **Package Manager**: Yarn
- **Runtime**: Node.js 18 (LTS)

## Prerequisites

- Node.js 18+
- Yarn
- MongoDB
- Docker (optional)

## Project Setup

### Local Development

```bash
# Install dependencies
$ yarn install

# Set up environment variables
$ cp .env.example .env
# Edit .env with your configuration

# Start development server
$ yarn run start:dev
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Application
NODE_ENV=development
PORT=3000

# Database
MONGODB_CONN_STRING=mongodb://localhost:27017
DB_NAME=swift-ex-server

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Gmail (for notifications)
GMAIL_CLIENT_ID=your-gmail-client-id
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-gmail-refresh-token
GMAIL_USER=your-email@gmail.com
GMAIL_REDIRECT_URI=https://developers.google.com/oauthplayground

# External APIs
ALCHEMY_API_KEY=your-alchemy-api-key
STELLAR_NETWORK=testnet

# Firebase (for push notifications)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email
```

## Docker Setup

### Quick Start

```bash
# Build and run with Docker
$ ./build.sh

# Or manually
$ docker build -t swift-ex-server .
$ docker run -p 3000:3000 swift-ex-server
```

### Docker Compose (Optional)

```bash
# Start with MongoDB
$ docker-compose up --build
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/signup` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/send-otp` - Send OTP
- `POST /api/v1/auth/verify-otp` - Verify OTP

### Users
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile

### Wallets
- `POST /api/v1/wallet` - Create wallet
- `GET /api/v1/wallet/address` - Get wallet address

### Market Data
- `GET /api/v1/market-data` - Get market data

## Development

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod

# build
$ yarn run build
```

## Testing

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## AWS SSM Parameter Management

This project uses AWS Systems Manager (SSM) Parameter Store to manage environment variables. Parameters are fetched at runtime by the container.

### Configuration Files

- **`constants.sh`** - Defines environment configuration (environment name, component name, AWS region, etc.)
- **`ssmvalues.json`** - Contains parameter values to be set in SSM Parameter Store
- **`setssmparameter.sh`** - Script to set/update SSM parameters from local JSON file

### Setting SSM Parameters

#### 1. Update `constants.sh` (if needed)

The default values are:
```bash
ENVIRONMENT_NAME=dev
COMPONENT_NAME=swiftx
PART_NAME=engines
AWS_REGION=ap-south-1
```

You can override these by setting environment variables:
```bash
export ENVIRONMENT_NAME=prod
export AWS_REGION=us-east-1
```

#### 2. Create/Update `ssmvalues.json`

Edit `ssmvalues.json` with your parameter values:

```json
{
  "mongodb_conn_string": {
    "value": "mongodb://user:pass@host:27017/db",
    "type": "SecureString"
  },
  "jwt_secret": {
    "value": "your-jwt-secret-key",
    "type": "SecureString"
  },
  "gmail_client_id": {
    "value": "your-gmail-client-id",
    "type": "SecureString"
  }
}
```

**Parameter Types:**
- `String` - Regular string value
- `SecureString` - Encrypted value (recommended for secrets)

#### 3. Run the Script

```bash
# With AWS profile
./setssmparameter.sh -p swiftx-dev

# With custom JSON file
./setssmparameter.sh -p swiftx-dev -f custom-values.json

# Show help
./setssmparameter.sh --help
```

#### How It Works

- **SSM Path Pattern**: `/${ENVIRONMENT_NAME}/${COMPONENT_NAME}/${PART_NAME}/${VARIABLE_NAME}`
- **Example**: `/dev/swiftx/engines/mongodb_conn_string`
- The script will:
  - ✅ Create new parameters if they don't exist
  - ✅ Update existing parameters if they exist (using `--overwrite`)
  - ✅ Show summary of created/updated parameters

#### Prerequisites

- AWS CLI installed and configured
- `jq` installed (`brew install jq` on macOS, `apt-get install jq` on Linux)
- AWS credentials with SSM permissions
- `ssmvalues.json` file in the project root

#### Important Notes

- ⚠️ **Never commit `ssmvalues.json` to git** - Add it to `.gitignore`
- 🔒 Use `SecureString` type for sensitive values (passwords, API keys, etc.)
- 📝 The script uses `--overwrite` flag, so existing parameters will be updated
- 🌍 Parameters are fetched at runtime by `start.sh` in the container

### Fetching SSM Parameters (Local Development)

To fetch SSM parameters and create a local `.env` file:

```bash
# Fetch all parameters and create .env file
./fetch-ssm.sh -p swiftx-dev

# Fetch to a custom file
./fetch-ssm.sh -p swiftx-dev -o .env.local
```

### Local Development Setup

The `setup.sh` script automates the complete local development workflow:

```bash
# Full setup: fetch SSM, build image, push to ECR
./setup.sh -p swiftx-dev

# Build with custom tag
./setup.sh -p swiftx-dev -t v1.0.0

# Skip build (only fetch and push existing image)
./setup.sh -p swiftx-dev --skip-build

# Skip push (only fetch and build, don't push)
./setup.sh -p swiftx-dev --skip-push
```

**What `setup.sh` does:**
1. ✅ Fetches SSM parameters and creates `.env` file
2. ✅ Builds Docker image locally
3. ✅ Logs into ECR
4. ✅ Tags image for ECR
5. ✅ Pushes image to ECR repository

**ECR Repository Format:**
- Repository Name: `${ENVIRONMENT_NAME}-${COMPONENT_NAME}-${PART_NAME}-ecr`
- Example: `dev-swiftx-engines-ecr`
- Full URI: `${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/dev-swiftx-engines-ecr:latest`

## Deployment

### Docker Deployment

```bash
# Build and push to ECR
$ ./build.sh

# The script will:
# 1. Build the Docker image
# 2. Tag it for ECR
# 3. Push to ECR
```

### Environment Setup

Ensure your production environment has all required environment variables configured in AWS SSM Parameter Store, especially:
- MongoDB connection string (`/dev/swiftx/engines/mongodb_conn_string`)
- JWT secret (`/dev/swiftx/engines/jwt_secret`)
- Gmail OAuth2 credentials (`/dev/swiftx/engines/gmail_*`)
- API keys for external services

Use `setssmparameter.sh` to manage these parameters (see AWS SSM Parameter Management section above).

## Project Structure

```
src/
├── api/v1/           # API modules
│   ├── auth/         # Authentication
│   ├── users/        # User management
│   ├── wallet/       # Wallet operations
│   ├── alchemy/      # Blockchain services
│   ├── stellar/      # Stellar operations
│   ├── mail/         # Email services
│   └── notification/ # Push notifications
├── common/           # Shared utilities
└── main.ts          # Application entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the NestJS documentation for framework-specific questions
