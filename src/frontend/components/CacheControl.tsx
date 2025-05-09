import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteIcon from "@mui/icons-material/Delete";
import PlaylistAddIcon from "@mui/icons-material/PlaylistAdd";

interface CacheRecord {
  domain: string;
  resolvedAt: string;
  resolvedTo: string;
  resolvedBy: string;
}

const CacheControl: React.FC = ({
  onAddWhitelistDomain,
}: {
  onAddWhitelistDomain?: () => void;
}) => {
  const [cacheLiveTime, setCacheLiveTime] = useState<number>(10);
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [cacheList, setCacheList] = useState<CacheRecord[]>([]);
  const [expanded, setExpanded] = useState<boolean>(false);

  const fetchCacheList = async () => {
    const response = await fetch("/api/cache/cacheList");
    const data = await response.json();
    if (data.success) {
      setCacheList(data.data);
    }
  };

  useEffect(() => {
    if (expanded) {
      fetchCacheList();
    }
  }, [expanded]);

  const handleLiveTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCacheLiveTime(Number(e.target.value));
  };

  const handleSetCacheLiveTime = async () => {
    setLoading(true);
    const response = await fetch("/api/cache/setCacheLiveTime", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cacheLiveTime: cacheLiveTime * 60 * 1000 }),
    });
    const data = await response.json();
    setMessage(data.success ? "Cache live time updated." : "Failed to update.");
    setLoading(false);
  };

  const handleFlushCache = async () => {
    setLoading(true);
    const response = await fetch("/api/cache/flushCache", { method: "POST" });
    const data = await response.json();
    setMessage(data.success ? "Cache flushed." : "Failed to flush cache.");
    fetchCacheList();
    setLoading(false);
  };

  const handleDeleteCache = async (domain: string) => {
    await fetch(`/api/cache/${domain}`, { method: "DELETE" });
    fetchCacheList();
  };

  const handleWhitelistDomain = async (domain: string) => {
    await fetch("/api/whitelist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain }),
    });
    alert(`${domain} added to whitelist.`);
  };

  return (
    <Box className="p-4 max-w-md mx-auto mt-10 shadow-2xl rounded-2xl">
      <Typography variant="h5" gutterBottom>
        Cache Control
      </Typography>

      <TextField
        label="Cache Live Time (minutes)"
        type="number"
        value={cacheLiveTime}
        onChange={handleLiveTimeChange}
        fullWidth
        variant="outlined"
        margin="normal"
      />

      <Button
        variant="contained"
        onClick={handleSetCacheLiveTime}
        disabled={loading}
        fullWidth
        sx={{ mt: 1 }}
      >
        {loading ? "Updating..." : "Set Cache Live Time"}
      </Button>

      <Button
        variant="contained"
        onClick={handleFlushCache}
        disabled={loading}
        color="error"
        fullWidth
        sx={{ mt: 1 }}
      >
        {loading ? "Flushing..." : "Flush Cache"}
      </Button>

      {message && (
        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
          {message}
        </Typography>
      )}

      {/* Accordion Cache List */}
      <Accordion
        expanded={expanded}
        onChange={() => setExpanded((prev) => !prev)}
        sx={{ mt: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Resolved Cache List</Typography>
        </AccordionSummary>
        <AccordionDetails>
          {cacheList.length === 0 ? (
            <Typography>No cached records found.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Domain</TableCell>
                  <TableCell>Resolved To</TableCell>
                  <TableCell>At</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cacheList.map((rec) => (
                  <TableRow key={rec.domain}>
                    <TableCell>{rec.domain}</TableCell>
                    <TableCell>{rec.resolvedTo}</TableCell>
                    <TableCell>
                      {new Date(rec.resolvedAt).toLocaleString()}
                    </TableCell>
                    <TableCell>{rec.resolvedBy}</TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          color="error"
                          size="small"
                          onClick={() => handleDeleteCache(rec.domain)}
                        >
                          <DeleteIcon />
                        </IconButton>
                        <IconButton
                          color="primary"
                          size="small"
                          onClick={() => handleWhitelistDomain(rec.domain)}
                        >
                          <PlaylistAddIcon />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export default CacheControl;
