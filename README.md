# dns-proxy

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.2.5. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.

1. Build the image

```bash
docker build -t mydns-proxy .
```

2. Run the container (with DNS + web UI exposed)

```bash
docker run -p 3000:3000 -p 53:53/udp --cap-add=NET_ADMIN mydns-proxy
```

```text
🔥 --cap-add=NET_ADMIN is sometimes needed for binding to privileged ports like 53 (DNS).
```

```bash
bun run build && sudo env "PATH=$PATH" bun start-server
```
