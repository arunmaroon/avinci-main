import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Box, 
  Typography, 
  Paper, 
  Container,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText
} from '@mui/material';
import { SmartToy as LogoIcon } from '@mui/icons-material';
import Button from './design-system/Button';
import Input from './design-system/Input';
import Card from './design-system/Card';

const SimpleLogin = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    passcode: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const roles = [
    { value: 'admin', label: 'Administrator' },
    { value: 'researcher', label: 'UX Researcher' },
    { value: 'analyst', label: 'Data Analyst' },
    { value: 'manager', label: 'Project Manager' },
    { value: 'developer', label: 'Developer' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple validation
    if (!formData.name.trim()) {
      setError('Please enter your name');
      setIsLoading(false);
      return;
    }

    if (!formData.role) {
      setError('Please select a role');
      setIsLoading(false);
      return;
    }

    if (formData.passcode !== '12345') {
      setError('Invalid passcode. Please enter 12345');
      setIsLoading(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create user data
      const userData = {
        name: formData.name,
        role: formData.role,
        roleLabel: roles.find(r => r.value === formData.role)?.label,
        loginTime: new Date().toISOString()
      };
      
      // Call the onLogin callback
      if (onLogin) {
        onLogin(userData);
      }
      
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 3,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Card
            sx={{
              p: 4,
              textAlign: 'center',
              maxWidth: 400,
              mx: 'auto',
            }}
          >
            {/* Logo */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: 'primary.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                <LogoIcon sx={{ fontSize: 32 }} />
              </Box>
            </Box>

            {/* Title */}
            <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600 }}>
              Welcome to Sirius
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
              AI Agent Portal v2.02
            </Typography>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {/* Name Field */}
                <Input
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  required
                  fullWidth
                />

                {/* Role Selection */}
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    label="Role"
                    required
                  >
                    <MenuItem value="">
                      <em>Select your role</em>
                    </MenuItem>
                    {roles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                {/* Passcode Field */}
                <Input
                  label="Passcode"
                  name="passcode"
                  type="password"
                  value={formData.passcode}
                  onChange={handleChange}
                  placeholder="Enter passcode"
                  required
                  fullWidth
                  helperText="Hint: The passcode is 12345"
                />
              </Box>

              {/* Error Message */}
              {error && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  {error}
                </Alert>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                variant="filled"
                size="large"
                loading={isLoading}
                fullWidth
                sx={{ mt: 3 }}
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>

              {/* Demo Info */}
              <Paper
                sx={{
                  mt: 3,
                  p: 2,
                  backgroundColor: 'primary.main',
                  color: 'primary.contrastText',
                }}
              >
                <Typography variant="subtitle2" gutterBottom>
                  Demo Login:
                </Typography>
                <Typography variant="body2">
                  • Name: Any name you prefer<br />
                  • Role: Select any role from dropdown<br />
                  • Passcode: <strong>12345</strong>
                </Typography>
              </Paper>
            </Box>
          </Card>
        </motion.div>
      </Container>
    </Box>
  );
};

export default SimpleLogin;