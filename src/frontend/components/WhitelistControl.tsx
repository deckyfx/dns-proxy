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

const domainRegex = /^(?!:\/\/)([a-zA-Z0-9-_]+\.)+[a-zA-Z]{2,}$/;

const WhitelistControl: React.FC = () => {
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [whitelistUpdated, setWhitelistUpdated] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!whitelistUpdated) return;
    fetch("/api/whitelist")
      .then((response) => response.json())
      .then((response: { success: boolean; data: string[] }) => {
        setWhitelist(response.data);
      })
      .catch((error) => console.error("Error fetching whitelist:", error));
    setTimeout(() => setWhitelistUpdated(false), 2000);
  }, [whitelistUpdated]);

  const handleAddDomain = async () => {
    const domainTrimmed = newDomain.trim().toLowerCase();

    if (!domainTrimmed) return setError("Domain cannot be empty");
    if (!domainRegex.test(domainTrimmed))
      return setError("Invalid domain format (e.g., example.com)");

    if (whitelist.map((d) => d.toLowerCase()).includes(domainTrimmed))
      return setError("Domain already whitelisted");

    setLoading(true);
    setError("");

    const response = await fetch("/api/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "add", domain: domainTrimmed }),
    });

    const data = await response.json();
    if (data.success) {
      setNewDomain("");
      setWhitelistUpdated(true);
    } else {
      alert("Failed to add domain");
    }
    setLoading(false);
  };

  const handleRemoveDomain = async (domain: string) => {
    setLoading(true);
    const response = await fetch("/api/whitelist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "remove", domain }),
    });

    const data = await response.json();
    if (data.success) {
      setWhitelistUpdated(true);
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
          DNS Whitelist
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
            color="success"
            onClick={handleAddDomain}
            disabled={loading || !newDomain.trim()}
            sx={{ alignSelf: "center" }}
          >
            <AddCircleIcon />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="subtitle1" gutterBottom>
          Current Whitelist
        </Typography>

        <List
          sx={{
            maxHeight: 200,
            overflowY: "auto",
            p: 0,
          }}
        >
          {whitelist.map((domain, index) => (
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

export default WhitelistControl;
