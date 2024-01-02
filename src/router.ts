import { BaseRouter } from './baseRouter';

const router = new BaseRouter();

router.setHandler('GET', '/healthcheck', (req, res) => {
    res.json({ status: 200, message: 'OK' });
});

router.setHandler('POST', '/post', (req, res) => {
    res.json({ status: 200, message: 'POST method' });
});

router.setHandler('OPTIONS', '/options', (req, res) => {
    res.json({ status: 200, message: 'OPTIONS method' });
});

export { router };
