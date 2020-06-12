import Knex from 'knex';

export async function seed(knex: Knex) {
    await knex('item').insert([
        { title: 'Lamp', image: 'lamp.svg'},
        { title: 'Battery & Cell', image: 'cell.svg'},
        { title: 'Paper', image: 'paper.svg'},
        { title: 'Eletronic Waste', image: 'eletronic.svg'},
        { title: 'Organic Waste', image: 'organic.svg'},
        { title: 'Oil', image: 'oil.svg'},
    ]);
}