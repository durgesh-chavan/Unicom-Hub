import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  CircularProgress,
  LinearProgress,
  Paper,
  Container,
} from "@mui/material";
import {
  Email as EmailIcon,
  WhatsApp as WhatsAppIcon,
  Sms as SmsIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from "@mui/icons-material";

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_API_URL}/dashboard/${userId}`
      );
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  const getSuccessRate = (success, total) => {
    if (!total) return 0;
    return ((success / total) * 100).toFixed(1);
  };

  const getIcon = (type) => {
    switch (type) {
      case "email":
        return <EmailIcon />;
      case "whatsapp":
        return <WhatsAppIcon />;
      case "sms":
        return <SmsIcon />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Overall Stats */}
      <Grid container spacing={3} mb={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ backgroundColor: "#E3F2FD", borderRadius: 2 }}>
            <CardContent>
              <Typography color="primary" gutterBottom>
                Total Messages Sent
              </Typography>
              <Typography variant="h4" color="primary">
                {data.overall.totalAttempts || 0}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={getSuccessRate(
                  data.overall.totalSuccess,
                  data.overall.totalAttempts
                )}
                sx={{ mt: 2 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }} color="primary">
                Success Rate:{" "}
                {getSuccessRate(
                  data.overall.totalSuccess,
                  data.overall.totalAttempts
                )}
                %
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ backgroundColor: "#E3F2FD", borderRadius: 2 }}>
            <CardContent>
              <Typography color="primary" gutterBottom>
                Message Type Distribution
              </Typography>
              <Grid container spacing={2} mt={1}>
                {data.byType.map((type) => (
                  <Grid item xs={4} key={type._id}>
                    <Box display="flex" alignItems="center" mb={1}>
                      {getIcon(type._id)}
                      <Typography variant="h6" ml={1} color="primary">
                        {type._id.toUpperCase()}
                      </Typography>
                    </Box>
                    <Typography variant="h4" color="primary">
                      {type.attempts}
                    </Typography>
                    <Box display="flex" alignItems="center" mt={1}>
                      <CheckIcon color="success" />
                      <Typography variant="body2" ml={1}>
                        {getSuccessRate(type.success, type.attempts)}% Success
                      </Typography>
                    </Box>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Today's Activity */}
      <Typography variant="h6" mb={2} color="primary">
        Today's Activity
      </Typography>
      <Grid container spacing={3} mb={4}>
        {data.today.map((type) => (
          <Grid item xs={12} md={4} key={type._id}>
            <Paper sx={{ p: 2, backgroundColor: "#BBDEFB", borderRadius: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                {getIcon(type._id)}
                <Typography variant="subtitle1" ml={1} color="primary">
                  {type._id.toUpperCase()}
                </Typography>
              </Box>
              <Typography variant="h5" color="primary">
                {type.attempts} Messages
              </Typography>
              <Box display="flex" justifyContent="space-between" mt={1}>
                <Typography color="success.main">
                  {type.success} Successful
                </Typography>
                <Typography color="error.main">
                  {type.failure} Failed
                </Typography>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent Activity */}
      <Typography variant="h6" mb={2} color="primary">
        Recent Activity
      </Typography>
      <Card sx={{ backgroundColor: "#E3F2FD", borderRadius: 2 }}>
        <CardContent>
          {data.recent.map((attempt, index) => (
            <Box
              key={index}
              py={2}
              borderBottom={index !== data.recent.length - 1 ? 1 : 0}
              borderColor="divider"
            >
              <Box display="flex" alignItems="center" mb={1}>
                {getIcon(attempt.messageType)}
                <Typography variant="subtitle1" ml={1} color="primary">
                  {attempt.messageType.toUpperCase()}
                </Typography>
                <Typography variant="body2" ml="auto" color="textSecondary">
                  {new Date(attempt.timestamp).toLocaleString()}
                </Typography>
              </Box>
              <Box display="flex" gap={2}>
                <Typography color="success.main">
                  <CheckIcon fontSize="small" /> {attempt.successCount}{" "}
                  Successful
                </Typography>
                <Typography color="error.main">
                  <ErrorIcon fontSize="small" /> {attempt.failureCount} Failed
                </Typography>
              </Box>
            </Box>
          ))}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Dashboard;
