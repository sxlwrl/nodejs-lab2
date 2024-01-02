import http from 'http';
import { safeJSON } from './utils';
import { router } from './router';

type ProcessedContentType = (data: string) => unknown;

const processedContentTypes: Record<string, ProcessedContentType> = {
    'text/html': (text) => text,
    'text/plain': (text) => text,
    'application/json': (json) => safeJSON(json, {}),
    'application/x-www-form-urlencoded': (data) =>
        Object.fromEntries(new URLSearchParams(data)),
};

const getContentType = (
    contentTypeHeader: string | undefined
): string | null => {
    return contentTypeHeader?.split(';')[0] ?? null;
};

const processRequest = async (
    req: http.IncomingMessage
): Promise<{ [key: string]: unknown }> => {
    const chunks: Array<Buffer> = [];
    for await (const chunk of req) {
        chunks.push(chunk as Buffer);
    }

    const rawData = Buffer.concat(chunks).toString();
    const contentType = getContentType(req.headers['content-type']);

    if (contentType && processedContentTypes[contentType]) {
        return processedContentTypes[contentType](rawData) as {
            [key: string]: unknown;
        };
    }

    return {};
};

const createServer = () => {
    return http.createServer(async (req, res) => {
        try {
            const url = new URL(req.url || '/', `https://${req.headers.host}`);
            const method = req.method || 'GET';
            const payload = await processRequest(req);
            router.handle(method, url.pathname, { data: payload }, res);
        } catch (error) {
            if (!res.headersSent) {
                res.writeHead(500);
                res.end('Internal Server Error');
            }
        }
    });
};

const PORT = parseInt(process.env.PORT || '8000', 10);
const server = createServer();

server.on('clientError', (_err, socket) => {
    socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', () => {
    server.close((err) => {
        if (err) {
            console.error(err);
            process.exit(1);
        }
        console.log('Server has been closed');
    });
});
