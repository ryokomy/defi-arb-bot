import 'dotenv/config';
import App from './app';
// import AuthRoute from './routes/auth.route';
import IndexRoute from './routes/index.route';
import ArbRoute from './routes/arb.route';
import UtilsRoute from './routes/utils.route';
// import UsersRoute from './routes/users.route';
import validateEnv from './utils/validateEnv';

validateEnv();

// const app = new App([new IndexRoute(), new UsersRoute(), new AuthRoute()]);
const app = new App([new IndexRoute(), new ArbRoute(), new UtilsRoute()]);

app.listen();
