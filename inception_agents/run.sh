#!/bin/bash

# Inception Agents v2 - Startup Script
# Quick launcher with dependency checks

echo "🧠 Inception Agents v2 - Starting..."
echo ""

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Please install Python 3.11+"
    exit 1
fi

echo "✅ Python $(python3 --version)"

# Check if in correct directory
if [ ! -f "app.py" ]; then
    echo "❌ app.py not found. Please run from inception_agents directory"
    exit 1
fi

# Check API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️  OPENAI_API_KEY not set"
    echo "   You'll need to enter it in the app sidebar"
    echo ""
else
    echo "✅ OPENAI_API_KEY found"
fi

# Check dependencies
echo ""
echo "Checking dependencies..."

if ! python3 -c "import streamlit" 2>/dev/null; then
    echo "⚠️  Streamlit not installed"
    echo "   Installing dependencies..."
    pip install -q -r requirements.txt
fi

echo "✅ All dependencies ready"
echo ""

# Launch app
echo "🚀 Launching Streamlit app..."
echo "   App will open at http://localhost:8501"
echo ""
echo "   Press Ctrl+C to stop"
echo ""

# Add local bin to PATH for streamlit
export PATH="$HOME/.local/bin:$PATH"

streamlit run app.py
