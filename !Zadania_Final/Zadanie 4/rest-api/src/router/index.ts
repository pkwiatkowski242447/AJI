import express from 'express';
import orderState from './OrderState';
import category from './Category';
import user from './User';
import product from './Product';
import order from './Order';
import authentication from './Authentication';

const router : express.Router = express.Router();

export default() : express.Router => {
    orderState(router);
    category(router);
    user(router);
    product(router);
    order(router);
    authentication(router);
    return router;
}