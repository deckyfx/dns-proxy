import CacheControl from "./components/CacheControl";
import DevModeTest from "./components/DevModeTest";
import DnsProxyControl from "./components/DnsProxyControl";
import WhitelistControl from "./components/WhitelistControl";
import { Container, Typography, Stack } from "@mui/material";

export default function App() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" align="center" gutterBottom>
        DNS Proxy Dashboard
      </Typography>

      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={3}
        justifyContent="center"
        alignItems="flex-start"
        flexWrap="wrap"
        sx={{ mt: 4 }}
      >
        <DnsProxyControl />
        <WhitelistControl />
        <CacheControl />
        <DevModeTest />
      </Stack>
    </Container>
  );
}
