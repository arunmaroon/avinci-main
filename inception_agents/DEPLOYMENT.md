# Deployment Guide - Inception Agents v2

Complete guide for deploying Inception Agents to various environments.

---

## 🚀 Local Deployment

### Prerequisites
- Python 3.11+
- OpenAI API key with GPT-4 and vision access
- 2GB RAM minimum
- Modern web browser

### Quick Start

```bash
# Clone/navigate to project
cd inception_agents

# Install dependencies
pip install -r requirements.txt

# Set API key
export OPENAI_API_KEY="sk-..."

# Run application
streamlit run app.py
```

Application will be available at: `http://localhost:8501`

---

## ☁️ Cloud Deployment

### Option 1: Streamlit Community Cloud (Recommended for Demos)

**Best for:** Quick demos, prototypes, small teams

1. **Prepare Repository**
   ```bash
   git add inception_agents/
   git commit -m "Add Inception Agents v2"
   git push origin main
   ```

2. **Deploy on Streamlit Cloud**
   - Visit: https://streamlit.io/cloud
   - Connect GitHub repository
   - Select branch: `main`
   - Main file path: `inception_agents/app.py`
   - Advanced settings → Secrets:
     ```toml
     OPENAI_API_KEY = "sk-..."
     ```

3. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Access via: `https://your-app.streamlit.app`

**Limitations:**
- 1GB RAM (may struggle with 100+ agents)
- Public access (unless paid tier)
- Limited CPU resources

---

### Option 2: Docker Deployment (Recommended for Production)

**Best for:** Production, enterprise, scalability

#### Create Dockerfile

```dockerfile
# Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Expose Streamlit port
EXPOSE 8501

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:8501/_stcore/health || exit 1

# Run application
CMD ["streamlit", "run", "app.py", "--server.port=8501", "--server.address=0.0.0.0"]
```

#### Build and Run

```bash
# Build image
docker build -t inception-agents:v2 .

# Run container
docker run -d \
  --name inception-agents \
  -p 8501:8501 \
  -e OPENAI_API_KEY="sk-..." \
  -v $(pwd)/agents.db:/app/agents.db \
  -v $(pwd)/images:/app/images \
  inception-agents:v2

# Check logs
docker logs -f inception-agents

# Access at http://localhost:8501
```

#### Docker Compose (with PostgreSQL option)

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8501:8501"
    environment:
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    volumes:
      - ./agents.db:/app/agents.db
      - ./images:/app/images
    restart: unless-stopped
    
  # Optional: Nginx reverse proxy
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - app
    restart: unless-stopped
```

```bash
# Deploy with Docker Compose
docker-compose up -d
```

---

### Option 3: AWS EC2

**Best for:** Full control, custom infrastructure

#### Launch EC2 Instance

1. **Instance Configuration**
   - AMI: Ubuntu 22.04 LTS
   - Type: t3.medium (2 vCPU, 4GB RAM)
   - Storage: 20GB SSD
   - Security Group: Allow ports 22, 80, 8501

2. **Connect and Setup**
   ```bash
   ssh -i your-key.pem ubuntu@ec2-xx-xx-xx-xx.compute.amazonaws.com
   
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Python
   sudo apt install python3.11 python3-pip -y
   
   # Clone repository
   git clone <your-repo> /home/ubuntu/inception_agents
   cd /home/ubuntu/inception_agents
   
   # Install dependencies
   pip3 install -r requirements.txt
   
   # Set environment variable
   echo "export OPENAI_API_KEY='sk-...'" >> ~/.bashrc
   source ~/.bashrc
   ```

3. **Run as Service**
   ```bash
   # Create systemd service
   sudo tee /etc/systemd/system/inception-agents.service << EOF
   [Unit]
   Description=Inception Agents v2
   After=network.target
   
   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/inception_agents
   Environment="OPENAI_API_KEY=sk-..."
   ExecStart=/usr/bin/python3 -m streamlit run app.py --server.port=8501 --server.address=0.0.0.0
   Restart=always
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   # Enable and start
   sudo systemctl daemon-reload
   sudo systemctl enable inception-agents
   sudo systemctl start inception-agents
   
   # Check status
   sudo systemctl status inception-agents
   ```

4. **Access**
   - Direct: `http://ec2-xx-xx-xx-xx.compute.amazonaws.com:8501`
   - With domain: Setup Route53 + ALB

---

### Option 4: Azure App Service

**Best for:** Microsoft ecosystem, enterprise compliance

```bash
# Install Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Create resource group
az group create --name inception-agents-rg --location eastus

# Create App Service plan
az appservice plan create \
  --name inception-agents-plan \
  --resource-group inception-agents-rg \
  --sku B1 \
  --is-linux

# Create web app
az webapp create \
  --name inception-agents \
  --resource-group inception-agents-rg \
  --plan inception-agents-plan \
  --runtime "PYTHON:3.11"

# Configure environment
az webapp config appsettings set \
  --name inception-agents \
  --resource-group inception-agents-rg \
  --settings OPENAI_API_KEY="sk-..."

# Deploy code
az webapp up \
  --name inception-agents \
  --resource-group inception-agents-rg

# Access at https://inception-agents.azurewebsites.net
```

---

### Option 5: Google Cloud Run

**Best for:** Serverless, auto-scaling, pay-per-use

```bash
# Install gcloud CLI
curl https://sdk.cloud.google.com | bash

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build with Cloud Build
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/inception-agents

# Deploy to Cloud Run
gcloud run deploy inception-agents \
  --image gcr.io/YOUR_PROJECT_ID/inception-agents \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY="sk-..." \
  --memory 2Gi \
  --port 8501

# Access via provided URL: https://inception-agents-xxx.run.app
```

---

## 🔒 Security Best Practices

### API Key Management

**Never commit API keys to git!**

```bash
# Use environment variables
export OPENAI_API_KEY="sk-..."

# Or .env file (add to .gitignore)
echo "OPENAI_API_KEY=sk-..." > .env

# For Docker
docker run -e OPENAI_API_KEY="sk-..." ...

# For Kubernetes
kubectl create secret generic openai-key --from-literal=OPENAI_API_KEY="sk-..."
```

### Authentication (Optional)

Add Streamlit authentication:

```python
# In app.py, add at top
import streamlit_authenticator as stauth

authenticator = stauth.Authenticate(
    credentials,
    'inception_agents',
    'secret_key',
    cookie_expiry_days=30
)

name, authentication_status, username = authenticator.login('Login', 'main')

if authentication_status:
    # Show app
    st.write(f'Welcome {name}')
    # ... rest of app
elif authentication_status == False:
    st.error('Username/password is incorrect')
elif authentication_status == None:
    st.warning('Please enter your username and password')
```

### HTTPS

For production, always use HTTPS:

```bash
# With Nginx
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

---

## 📊 Monitoring

### Application Logs

```bash
# Docker
docker logs -f inception-agents

# Systemd
sudo journalctl -u inception-agents -f

# Streamlit Cloud
# View logs in dashboard
```

### Health Checks

```bash
# Check if app is running
curl http://localhost:8501/_stcore/health

# Expected response: {"status": "ok"}
```

### Database Monitoring

```bash
# Check database size
ls -lh agents.db

# Query agent count
sqlite3 agents.db "SELECT COUNT(*) FROM ui_agents;"

# Query feedback count
sqlite3 agents.db "SELECT COUNT(*) FROM feedback_history;"
```

---

## 🔄 Updates & Maintenance

### Update Application

```bash
# Pull latest code
git pull origin main

# Update dependencies
pip install -r requirements.txt --upgrade

# Restart service
sudo systemctl restart inception-agents

# Or restart Docker
docker-compose restart
```

### Database Backups

```bash
# Backup SQLite database
cp agents.db agents_backup_$(date +%Y%m%d).db

# Automated backups (cron)
echo "0 2 * * * cp /path/to/agents.db /backups/agents_\$(date +\%Y\%m\%d).db" | crontab -
```

### Database Migration (SQLite → PostgreSQL)

For scaling beyond 100s of agents:

```python
# migration_script.py
import sqlite3
import psycopg2
import json

# Connect to both databases
sqlite_conn = sqlite3.connect('agents.db')
pg_conn = psycopg2.connect("postgresql://user:pass@host:5432/dbname")

# Migrate data
cursor = sqlite_conn.cursor()
cursor.execute("SELECT * FROM ui_agents")
for row in cursor.fetchall():
    # Insert into PostgreSQL
    # ... migration logic

print("Migration complete!")
```

---

## 🧪 Testing in Production

### Smoke Tests

```bash
# 1. Check app loads
curl -I http://your-domain.com:8501

# 2. Test transcript upload
# (Manual: Upload sample_transcript.txt)

# 3. Verify agent generation
# (Manual: Generate agent, check database)

# 4. Test UI feedback
# (Manual: Upload mock_loan_form.png, get critique)

# 5. Export session
# (Manual: Click export, verify JSON download)
```

---

## 🌍 Multi-Region Deployment

For global teams:

```bash
# Deploy to multiple regions
gcloud run deploy inception-agents-us --region us-central1 ...
gcloud run deploy inception-agents-eu --region europe-west1 ...
gcloud run deploy inception-agents-asia --region asia-east1 ...

# Use Cloud Load Balancer for routing
```

---

## 💰 Cost Estimates

| Platform | Small Team (10 users) | Medium Team (50 users) | Enterprise (500 users) |
|----------|----------------------|----------------------|----------------------|
| **Streamlit Cloud** | Free | $250/mo | N/A |
| **AWS EC2** | $30/mo (t3.medium) | $100/mo (t3.large) | $1000/mo (cluster) |
| **Google Cloud Run** | $20/mo | $80/mo | $500/mo |
| **Azure App Service** | $50/mo (B1) | $200/mo (S1) | $1500/mo (P1v3) |

*Plus OpenAI API costs: ~$0.01-0.05 per agent interaction*

---

## 🆘 Troubleshooting

### App Won't Start

```bash
# Check Python version
python3 --version  # Should be 3.11+

# Check dependencies
pip list | grep streamlit

# Check ports
sudo lsof -i :8501
```

### Out of Memory

```bash
# Increase Docker memory
docker run -m 4g ...

# Or upgrade instance
# EC2: t3.medium → t3.large
```

### Slow Performance

- **Enable caching**: Already implemented in code
- **Use PostgreSQL**: For 100+ agents
- **Add Redis**: For session caching
- **Scale horizontally**: Multiple instances + load balancer

---

## 📞 Support

**Need help deploying?**
- Check USAGE_GUIDE.md for application-specific issues
- Review PROJECT_SUMMARY.md for architecture questions
- Test with integration_test.py before deploying

---

Built with empathy for real users 🧠💙 | v2.0
