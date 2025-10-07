# Quick Reference Card - Inception Agents v2

## 🚀 Installation & Launch (30 seconds)

```bash
cd /workspace/inception_agents
pip install -r requirements.txt
export OPENAI_API_KEY="sk-your-key-here"
streamlit run app.py
```

## 📖 Documentation Quick Links

| Document | Purpose | Read Time |
|----------|---------|-----------|
| `QUICKSTART.md` | Get started in 5 minutes | 5 min |
| `README.md` | Full feature overview | 10 min |
| `USAGE_GUIDE.md` | Step-by-step workflows | 30 min |
| `PROJECT_SUMMARY.md` | Technical architecture | 20 min |
| `DEPLOYMENT.md` | Production deployment | 15 min |
| `BUILD_COMPLETE.md` | Build summary | 10 min |

## 🎯 Common Commands

```bash
# Run app
streamlit run app.py

# Run tests
python3 test_functionality.py
python3 integration_test.py

# Quick start script
./run.sh

# Deploy with Docker
docker build -t inception-agents:v2 .
docker run -p 8501:8501 -e OPENAI_API_KEY="sk-..." inception-agents:v2
```

## 📁 File Structure

```
inception_agents/
├── app.py              # Main application
├── utils.py            # Core logic
├── images/             # UI uploads
├── *.md                # Documentation
└── test*.py            # Tests
```

## 🎨 Test Assets

- `sample_transcript.txt` - Abdul's loan app experience
- `images/mock_loan_form.png` - Company details issue
- `images/eligibility_screen.png` - Purpose question
- `images/loading_screen.png` - Wait state
- `images/fee_transparency_screen.png` - Fee display

## 🔑 Environment Variables

```bash
# Required
export OPENAI_API_KEY="sk-..."

# Optional
export STREAMLIT_SERVER_PORT=8501
export STREAMLIT_SERVER_ADDRESS=0.0.0.0
```

## 💡 Example Workflow

1. Upload `sample_transcript.txt` → Generate Abdul
2. Chat: "Tell me about Money View" → Get authentic response
3. Upload `mock_loan_form.png` → Get UI feedback
4. Analyze feedback → Export insights

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| API key error | `export OPENAI_API_KEY="sk-..."` |
| Port in use | `streamlit run app.py --server.port=8502` |
| Module not found | `pip install -r requirements.txt` |
| Vision API fails | Agent falls back to text critique |

## 📊 Key Features

✅ Upload transcripts (PDF/TXT)
✅ Extract personas (14 attributes)
✅ Generate AI agents
✅ Chat with agents
✅ Share UI designs
✅ Get human-like feedback
✅ Analytics dashboard
✅ Export insights

## 🎯 Use Case

**Input:** User interview transcript
**Process:** Extract persona → Generate agent → Share UI design
**Output:** Human-like critique tied to experiences

**Example:** Abdul (self-employed) sees form asking "Company Name" → "Big problem for self-employed like me, I'd quit the app!"

---

**Need more?** Check `QUICKSTART.md` for detailed setup
