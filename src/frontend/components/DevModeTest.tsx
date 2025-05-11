import React, { useState } from "react";
import { Box, TextField, Button, Typography, Paper } from "@mui/material";
import type { Config } from "../../config";

const config = process.env as unknown as Config;

const DevModeTest: React.FC = () => {
 if (!config.DEV_MODE) {
    return null;
  }
 
  const [testDomain, setTestDomain] = useState<string>("");
  const [testResult, setTestResult] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const handleTestDomain = async () => {
    if (!testDomain.trim()) {
      setTestResult("Please enter a domain.");
      return;
    }

    setLoading(true);
    setTestResult(null);

    try {
      const response = await fetch("/api/test-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: testDomain.trim() }),
      });

      const data = await response.json();
      if (data.success) {
        setTestResult(`Result: ${JSON.stringify(data.data, null, 2)}`);
      } else {
        setTestResult(`Error: ${data.error || "Unknown error"}`);
      }
    } catch (error: any) {
      setTestResult(`Request failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 400,
        mx: "auto",
        mt: 4,
        p: 2,
        border: "1px solid #ddd",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <Typography variant="h6" gutterBottom align="center">
        Developer Mode: Test Domain Resolution
      </Typography>
      <Box display="flex" gap={1} mb={2}>
        <TextField
          label="Enter Domain to Test"
          value={testDomain}
          onChange={(e) => setTestDomain(e.target.value)}
          fullWidth
          size="small"
        />
        <Button
          variant="contained"
          onClick={handleTestDomain}
          disabled={loading}
        >
          Test
        </Button>
      </Box>
      {testResult && (
        <Paper elevation={1} sx={{ p: 1, mt: 2, wordBreak: "break-all" }}>
          <Typography variant="body2" component="pre">
            {testResult}
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default DevModeTest;