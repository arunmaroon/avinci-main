#!/bin/bash
# Start the Transcript Mapping API

# Load environment variables
if [ -f ../.env ]; then
    export $(cat ../.env | grep -v '^#' | xargs)
fi

# Start the API
python3 api/transcript_api.py

