import React, { useEffect, useState } from "react";
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";

const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

const BlacklistControl: React.FC = () => {
  const [blacklist, setBlacklist] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [blacklistUpdated, setBlacklistUpdated] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!blacklistUpdated) return;
    fetch("/api/blacklist")
      .then((response) => response.json())
      .then((response: { success: boolean; data: string[] }) => {
        setBlacklist(response.data);
      })
      .catch((error) => console.error("Error fetching blacklist:", error));
    setTimeout(() => setBlacklistUpdated(false), 2000);
  }, [blacklistUpdated]);

  const handleRefreshBlacklist = () => {
    setBlacklistUpdated(true);
  };

  const handleAddDomain = async () => {
    const domainTrimmed = newDomain.trim().toLowerCase();

    if (!domainTrimmed) return setError("Domain cannot be empty");
    if (!domainRegex.test(domainTrimmed))
      return setError("Invalid domain format (e.g., example.com)");

    if (blacklist.map((d) => d.toLowerCase()).includes(domainTrimmed))
      return setError("Domain already blacklisted");

    setLoading(true);
    setError("");

    const response = await fetch("/api/blacklist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", domain: domainTrimmed }),
    });

    const data = await response.json();
    if (data.success) {
      setNewDomain("");
      setBlacklistUpdated(true);
    } else {
      alert("Failed to add domain");
    }
    setLoading(false);
  };

  const handleRemoveDomain = async (domain: string) => {
    setLoading(true);
    const response = await fetch("/api/blacklist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", domain }),
    });

    const data = await response.json();
    if (data.success) {
      setBlacklistUpdated(true);
    } else {
      alert("Failed to remove domain");
    }
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
          DNS Blacklist
        </Typography>

        <Box display="flex" gap={1} mb={2}>
          <TextField
            label="Add a Domain"
            value={newDomain}
            onChange={(e) => {
              setNewDomain(e.target.value);
              setError("");
            }}
            error={!!error}
            helperText={error}
            fullWidth
            size="small"
          />
          <IconButton
            color="error" // Changed color for distinction
            onClick={handleAddDomain}
            disabled={loading || !newDomain.trim()}
            sx={{ alignSelf: "center" }}
          >
            <AddCircleIcon />
          </IconButton>
          <IconButton
            color="primary"
            onClick={handleRefreshBlacklist}
            disabled={loading}
            sx={{ alignSelf: "center" }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Current Blacklist
        </Typography>

        <List
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            p: 0,
          }}
        >
          {blacklist.map((domain, index) => (
            <ListItem
              key={index}
              sx={{
                py: 0.5,
                px: 1,
                display: "flex",
                justifyContent: "space-between",
              }}
              disableGutters
            >
              <ListItemText
                primary={domain}
                primaryTypographyProps={{ sx: { fontSize: "0.9rem" } }}
              />
              <IconButton
                color="error"
                size="small"
                onClick={() => handleRemoveDomain(domain)}
                disabled={loading}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );
};

export default BlacklistControl;