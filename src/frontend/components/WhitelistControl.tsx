import React, { useEffect, useState } from "react";
import { Button, TextField } from "@mui/material"; // Replace with your UI components

const WhitelistControl: React.FC = () => {
  const [whitelist, setWhitelist] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [whitelistUpdated, setWhitelistUpdated] = useState<boolean>(true);

  useEffect(() => {
    // Fetch the current whitelist from the backend
    if (!whitelistUpdated) {
      return;
    }
    fetch("/api/whitelist")
      .then((response) => response.json())
      .then((response: { success: boolean; data: string[] }) => {
        setWhitelist(response.data);
      })
      .catch((error) => console.error("Error fetching whitelist:", error));
    setTimeout(() => {
      setWhitelistUpdated(false);
    }, 2000);
  }, [whitelistUpdated]);

  const handleAddDomain = async () => {
    if (!newDomain) return;
    setLoading(true);

    // Send POST request to add domain to whitelist
    const response = await fetch("/api/whitelist", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "add", domain: newDomain }),
    });

    const data = (await response.json()) as {
      success: boolean;
      message: string;
    };
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
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ action: "remove", domain }),
    });

    const data = (await response.json()) as {
      success: boolean;
      message: string;
    };
    if (data.success) {
      setWhitelistUpdated(true);
    } else {
      alert("Failed to remove domain");
    }
    setLoading(false);
  };

  return (
    <div>
      <h2>DNS Whitelist</h2>
      <TextField
        label="Add a Domain"
        value={newDomain}
        onChange={(e) => setNewDomain(e.target.value)}
      />
      <Button onClick={handleAddDomain} disabled={loading}>
        {loading ? "Adding..." : "Add Domain"}
      </Button>

      {whitelistUpdated && <p>The whitelist has been updated!</p>}

      <h3>Current Whitelist</h3>
      <ul>
        {whitelist.map((domain, index) => (
          <li key={index}>
            {domain}{" "}
            <Button
              onClick={() => handleRemoveDomain(domain)}
              disabled={loading}
            >
              {loading ? "Removing..." : "Remove"}
            </Button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default WhitelistControl;
