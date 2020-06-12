import { Request, Response } from 'express';
import knex from '../database/connections';
import { address } from 'ip';

class ItemController {

    //index, show, create/store, update, delete/destroy

    async index(request: Request, response: Response) {
        const items = await knex('item').select('*');
        
        const url = `${request.protocol}://${address()}:${request.socket.localPort}/uploads/`;

        const serializedItems = items.map(item => {
            return {
                id: item.id,
                title: item.title,
                image_url: `${url}${item.image}`,
            }
        });

        return response.json(serializedItems);
    }

}

export default ItemController;