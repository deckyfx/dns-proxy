import { handleDnsQuery } from "../dns-proxy/dns-proxy";
import * as dgram from "dgram";

export const testDomainRoute = async (req: Request) => {
  try {
    const body = await req.json();
    const domain = body.domain as string;

    if (!domain) {
      return new Response(JSON.stringify({ success: false, error: "Domain not provided" }), {
        headers: { "Content-Type": "application/json" },
        status: 400,
      });
    }

    // Mock a dgram message event to pass to handleDnsQuery
    // In a real scenario, you might want a dedicated function in dns-proxy
    // to resolve a domain directly without the dgram layer for testing.
    // For this example, we'll simulate the dgram message structure.
    const mockMsg = Buffer.from([]); // You would construct a real DNS query buffer here
    const mockRinfo: dgram.RemoteInfo = {
      address: "127.0.0.1", // Or any appropriate address
      family: "IPv4",
      port: 0, // Or any appropriate port
      size: mockMsg.length,
    };

    // We need to capture the response from handleDnsQuery.
    // handleDnsQuery is designed to send a response back via the dgram socket.
    // To test it via HTTP, we might need to modify handleDnsQuery
    // or create a new function in the dns-proxy module for this purpose.
    // As a workaround for demonstration, we'll acknowledge the request here
    // but note that the actual DNS resolution result won't be directly returned
    // by handleDnsQuery in its current form to this HTTP request.

    // handleDnsQuery(mockMsg, mockRinfo, server as dgram.Socket); // This would send a UDP response

    // A more suitable approach for testing would be to call a function
    // within the dns-proxy module that performs the resolution and returns the result.
    // Assuming such a function exists or can be added:
    // import { resolveDomain } from "../dns-proxy/dns-proxy";
    // const resolutionResult = await resolveDomain(domain);
    // return new Response(JSON.stringify({ success: true, data: resolutionResult }), {
    //   headers: { "Content-Type": "application/json" },
    // });

    // For now, we'll just acknowledge the request received in dev mode.
    return new Response(JSON.stringify({ success: true, message: `Test request received for domain: ${domain}` }), {
      headers: { "Content-Type": "application/json" },
    });


  } catch (error) {
    console.error("Error handling test domain request:", error);
    return new Response(JSON.stringify({ success: false, error: "Internal server error" }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }
};