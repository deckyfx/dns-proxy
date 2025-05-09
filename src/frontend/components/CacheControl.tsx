import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  Card,
  CardContent,
  Box,
  Stack,
} from "@mui/material";
import TimerIcon from "@mui/icons-material/Timer";
import DeleteSweepIcon from "@mui/icons-material/DeleteSweep";

const CacheControl: React.FC = () => {
  const [cacheLiveTime, setCacheLiveTime] = useState<number>(10); // Default 10 minutes
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleLiveTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCacheLiveTime(Number(event.target.value));
  };

  const handleSetCacheLiveTime = async () => {
    setLoading(true);
    const response = await fetch("/api/setCacheLiveTime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cacheLiveTime: cacheLiveTime * 60 * 1000 }),
    });

    const data = await response.json();
    setMessage(
      data.success
        ? "✅ Cache live time updated!"
        : "❌ Failed to update cache live time."
    );
    setLoading(false);
  };

  const handleFlushCache = async () => {
    setLoading(true);
    const response = await fetch("/api/flushCache", {
      method: "POST",
    });

    const data = await response.json();
    setMessage(
      data.success ? "✅ Cache flushed!" : "❌ Failed to flush cache."
    );
    setLoading(false);
  };

  return (
    <Card
      sx={{
        maxWidth: 400,
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
          Cache Control
        </Typography>

        <TextField
          label="Cache Live Time (minutes)"
          type="number"
          value={cacheLiveTime}
          onChange={handleLiveTimeChange}
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        />

        <Stack direction="column" spacing={1}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSetCacheLiveTime}
            disabled={loading}
            startIcon={<TimerIcon />}
            fullWidth
          >
            {loading ? "Updating..." : "Set Live Time"}
          </Button>

          <Button
            variant="contained"
            color="error"
            onClick={handleFlushCache}
            disabled={loading}
            startIcon={<DeleteSweepIcon />}
            fullWidth
          >
            {loading ? "Flushing..." : "Flush Cache"}
          </Button>
        </Stack>

        {message && (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ mt: 2, textAlign: "center" }}
          >
            {message}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default CacheControl;
