const cors = require('cors');

export default async function middleware(req: any, res: any, next: any) {
    try {
        await cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
            headers: ['Content-Type', 'Authorization', '*'],
        })(req, res);
        next();
    } catch (error) {
        // Handle any errors during CORS processing
        console.error(error);
        next(error);
    }
}
