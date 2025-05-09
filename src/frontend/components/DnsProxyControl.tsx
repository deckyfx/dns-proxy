import { useState, useEffect } from "react";
import {
  Button,
  Card,
  CardContent,
  TextField,
  Typography,
  Box,
  Divider,
} from "@mui/material";

export default function DnsProxyControl() {
  const [status, setStatus] = useState(false); // Running or stopped
  const [loading, setLoading] = useState(false);
  const [nextdnsId, setNextdnsId] = useState("");

  async function fetchStatus() {
    const res = await fetch("/api/status");
    const data = await res.json();
    setStatus(data.running);
  }

  async function sendCommand(command: "start" | "stop" | "restart") {
    setLoading(true);

    let body: any = {};
    if (command === "start" || command === "restart") {
      body.id = nextdnsId;
    }

    await fetch(`/api/${command}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: Object.keys(body).length ? JSON.stringify(body) : undefined,
    });

    await fetchStatus();
    setLoading(false);
  }

  useEffect(() => {
    const savedId = localStorage.getItem("nextdnsId");
    if (savedId) {
      setNextdnsId(savedId);
    }

    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem("nextdnsId", nextdnsId);
  }, [nextdnsId]);

  const hasId = nextdnsId.trim() !== "";
  const canStart = hasId && !status && !loading;
  const canStop = status && !loading;
  const canRestart = hasId && status && !loading;

  return (
    <Card
      sx={{
        maxWidth: 300,
        mx: "auto",
        mt: 8,
        p: 2,
        border: "1px solid #ddd",
        borderRadius: 3,
        boxShadow: 3,
      }}
    >
      <CardContent>
        <Typography variant="h5" gutterBottom align="center">
          DNS Proxy Control
        </Typography>

        <Typography
          variant="body2"
          align="center"
          sx={{ color: status ? "green" : "red", mb: 2 }}
        >
          Status: {status ? "Running ✅" : "Stopped ❌"}
        </Typography>

        <TextField
          label="NextDNS ID"
          value={nextdnsId}
          onChange={(e) => setNextdnsId(e.target.value)}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />

        <Divider sx={{ mb: 2 }} />

        <Box display="flex" flexDirection="column" gap={1}>
          <Button
            variant="contained"
            color="success"
            disabled={!canStart}
            onClick={() => sendCommand("start")}
          >
            Start
          </Button>

          <Button
            variant="contained"
            color="error"
            disabled={!canStop}
            onClick={() => sendCommand("stop")}
          >
            Stop
          </Button>

          <Button
            variant="contained"
            color="primary"
            disabled={!canRestart}
            onClick={() => sendCommand("restart")}
          >
            Restart
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
