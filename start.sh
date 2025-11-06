#!/bin/bash
set -e

# Source constants file for consistent configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -f "${SCRIPT_DIR}/constants.sh" ]; then
    source "${SCRIPT_DIR}/constants.sh"
else
    # Fallback to defaults if constants.sh not found
    export ENVIRONMENT_NAME="${ENVIRONMENT_NAME:-dev}"
    export COMPONENT_NAME="${COMPONENT_NAME:-swiftx}"
    export PART_NAME="${PART_NAME:-engines}"
    export AWS_REGION="${AWS_REGION:-ap-south-1}"
fi

# Use SSM_BASE_PATH from constants.sh, fallback to computed value
PARAM_BASE_PATH="${SSM_BASE_PATH:-/${ENVIRONMENT_NAME}/${COMPONENT_NAME}/${PART_NAME}}"

echo "Fetching environment variables from Parameter Store at runtime..."
echo "Base path: ${PARAM_BASE_PATH}"

# Create .env file dynamically from all parameters
echo "# Environment Configuration" > /app/.env
echo "AWS_REGION=${AWS_REGION}" >> /app/.env

# Get all parameters and create .env file
# TEMP: Add profile for local testing (comment out for production)
AWS_PROFILE_OPT=""
if [[ -n "${AWS_PROFILE:-}" ]]; then
    AWS_PROFILE_OPT="--profile ${AWS_PROFILE}"
fi

aws ssm describe-parameters \
    --parameter-filters "Key=Name,Option=BeginsWith,Values=${PARAM_BASE_PATH}/" \
    --region "${AWS_REGION}" \
    ${AWS_PROFILE_OPT} \
    --query 'Parameters[].Name' \
    --output text | tr '\t' '\n' | while read param_name; do
        param_key=$(basename "$param_name")
        # Convert parameter name to uppercase for environment variable
        env_var_name=$(echo "$param_key" | tr '[:lower:]' '[:upper:]')
        param_value=$(aws ssm get-parameter \
            --name "$param_name" \
            --with-decryption \
            --region "${AWS_REGION}" \
            ${AWS_PROFILE_OPT} \
            --query 'Parameter.Value' \
            --output text 2>/dev/null || echo "")
        if [[ -n "$param_value" ]]; then
            echo "${env_var_name}=${param_value}" >> /app/.env
        fi
    done

echo "Environment variables fetched and .env file created successfully!"
echo "Total variables: $(wc -l < /app/.env)"
echo "Starting application..."

# Execute the command passed to the container
exec "$@"

