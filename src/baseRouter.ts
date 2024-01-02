import http from 'http';

type DataRecord = Record<string, unknown>;

interface IRequest {
    data: DataRecord;
}

interface RawResponse extends http.ServerResponse {
    req: http.IncomingMessage;
}

interface Response extends RawResponse {
    json: (json: DataRecord) => void;
}

type RouterHandler = (req: IRequest, res: Response) => void;

const defaultHandler: RouterHandler = (req, res) => {
    res.json({ status: 405, message: 'Method is not allowed' });
};

function useJson(res: http.ServerResponse): Response {
    return Object.assign(res, {
        json: (data: DataRecord) => {
            res.end(JSON.stringify(data));
        },
    });
}

export class BaseRouter {
    private _handlers = new Map<string, RouterHandler>();

    private getHandler(method: string, route: string): string {
        return `${method.toUpperCase()}:${route}`;
    }

    public setHandler(
        method: string,
        route: string,
        handler: RouterHandler
    ): void {
        const key = this.getHandler(method, route);
        this._handlers.set(key, handler);
    }

    public handle(
        method: string,
        route: string,
        req: IRequest,
        res: http.ServerResponse
    ): void {
        const key = this.getHandler(method, route);
        const handler = this._handlers.get(key) || defaultHandler;
        const responseWithJson = useJson(res);
        handler(req, responseWithJson);
    }
}
