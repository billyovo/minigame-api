import { test, expect, errors } from '@playwright/test';
let events = require("../assets/event.json")
events = events.map((event)=>{
    return event.id;
})
events.push("all");
const servers = ["all","survival","skyblock"];
const api_url = "http://localhost:28001";

test('News List returns', async ({ request }) => {
    const res = await request.get(`${api_url}/news?limit=3`);
    expect(res.ok());
    expect(await res.json()).toMatchObject({
        rows: expect.any(Array),
        total: expect.any(Number)
    })
});

test('News Content returns', async({ request })=>{
    const res = await request.get(`${api_url}/news/1`);
    expect(res.ok());
    expect(await res.json()).toMatchObject({
        ID: 1,
        content: expect.any(String),
        publish_date: expect.any(String),
        image: expect.anything()
    })
})

test('Record return', async ({request})=>{
    for(let i = 0;i<servers.length;i++){
        for(let j = 0;j<events.length;j++){
            const res = await request.get(`${api_url}/record/${servers[i]}/${events[j]}`);
            expect(res.ok);
            expect(await res.json()).toMatchObject({
                rows: expect.any(Array),
                total: expect.any(Number)
            })
        }
    }
    
})

test('Count returns', async ({request})=>{
    for(let i = 0;i<servers.length;i++){
        for(let j = 0;j<events.length;j++){
            const res = await request.get(`${api_url}/count/${servers[i]}/${events[j]}`);
            expect(res.ok);
            expect(await res.json()).toMatchObject({
                rows: expect.any(Array),
                total: expect.any(Number)
            })
        }
    }
})

test('Rejects invalid server', async ({request})=>{
    const res = await request.get(`${api_url}/count/abcdefg`);
    expect(!res.ok);
})

test('Rejects invalid event', async ({request})=>{
    const res = await request.get(`${api_url}/count/all/abcdefg`);
    expect(!res.ok);
})

test('Rejects big records', async ({request})=>{
    const res = await request.get(`${api_url}/count/all?limit=1000`);
    expect(!res.ok);
})