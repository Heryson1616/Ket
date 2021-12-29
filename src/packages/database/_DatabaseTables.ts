import { Client } from "pg";

module.exports = class DatabaseTable {
    table: {
        create: Function,
        update: Function,
        find: Function,
        getAll: Function
    }
    postgres: Client;
    constructor(postgres: Client) {
        this.postgres = postgres;
        this.table;
    }
    set(tableName: string, PrimaryKey: string) {
        const postgres = this.postgres,
            db = global.session.db;

        this.table = {
            create: async (index: string, data: object, returnValue: boolean = false) => {
                let values = [];
                for (let i in Object.entries(data)) {
                    let str = String(eval('data.' + Object.keys(data)[i])).replace(new RegExp(`'`, 'g'), `''`);
                    typeof str === 'string' ? values.push(`'${str}'`) : values.push(str);
                };
                await postgres.query(`INSERT INTO ${tableName} (${PrimaryKey}, ${Object.keys(data).join(', ')}) VALUES('${index}', ${values.join(', ')})`);
                if (returnValue) return await db[tableName].find(index);
                return;
            },
            update: async (index: string, data: object, returnValue = false) => {
                let values = [];
                for (let [key, value] of Object.entries(data)) typeof value === 'string' ? values.push(`${key} = '${value.replace(new RegExp(`'`, 'g'), `''`)}'`) : values.push(`${key} = ${value}`);
                await postgres.query(`UPDATE ${tableName} SET
                        ${values.join(`,\n`)}
                        WHERE ${PrimaryKey} = '${index}';
                    `);
                if (returnValue) return await db[tableName].find(index);
                return;
            },
            find: async (index: string, createIfNull = false) => {
                let search = await postgres.query(`SELECT * FROM ${tableName} WHERE ${PrimaryKey} = '${index}';`);
                if (!search.rows[0] && index && createIfNull) {
                    await db[tableName].create(index);
                    return await db[tableName].find(index);
                } else return search.rows[0];
            },
            getAll: async (limit: number) => {
                let search = await postgres.query(`SELECT * FROM ${tableName};`);
                return search.rows;
            }
        }

        return this.table;
    }
}