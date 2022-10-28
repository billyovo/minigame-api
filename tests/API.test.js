import { test, expect, errors } from '@playwright/test';
let events = require("../assets/event.json")
events = events.map((event)=>{
    return event.id;
})
events.push("all");
const servers = ["all","survival","skyblock"];
const api_url = "https://minigame-api.letsdream.today";

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

test('Rejects unauthorized access (delete)', async ({request})=>{
    const res = await request.delete(`${api_url}/news/edit/1`);
    expect(!res.ok);
})

test('Rejects unauthorized access (post)', async ({request})=>{
    const res = await request.post(`${api_url}/news/edit/new`);
    expect(!res.ok);
})


test('Rejects unauthorized access (patch)', async ({request})=>{
    const res = await request.patch(`${api_url}/news/edit/1`);
    expect(!res.ok);
})