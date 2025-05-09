import { useState, useEffect } from "react";
import { Button, Card, CardContent, Typography } from "@mui/material";

export default function DnsProxyControl() {
  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchStatus() {
    const res = await fetch("/api/status");
    const data = await res.json();
    setStatus(data.running);
  }

  async function sendCommand(command: "start" | "stop" | "restart") {
    setLoading(true);
    await fetch(`/api/${command}`, { method: "POST" });
    await fetchStatus();
    setLoading(false);
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-4 max-w-md mx-auto mt-10 shadow-2xl rounded-2xl">
      <CardContent>
        <Typography variant="h5" gutterBottom>
          DNS Proxy Control
        </Typography>

        <Typography
          variant="body1"
          color={status ? "green" : "red"}
          className="mb-4"
        >
          Status: {status ? "Running ✅" : "Stopped ❌"}
        </Typography>

        <div className="flex gap-2">
          <Button disabled={loading} onClick={() => sendCommand("start")}>
            Start
          </Button>
          <Button disabled={loading} onClick={() => sendCommand("stop")}>
            Stop
          </Button>
          <Button disabled={loading} onClick={() => sendCommand("restart")}>
            Restart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
