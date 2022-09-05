import { test, expect, errors } from '@playwright/test';

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
    const res = await request.get(`${api_url}/record/all`);
    expect(res.ok);
    expect(await res.json()).toMatchObject({
        rows: expect.any(Array),
        total: expect.any(Number)
    })
})

test('Count returns', async ({request})=>{
    const res = await request.get(`${api_url}/count/all`);
    expect(res.ok);
    expect(await res.json()).toMatchObject({
        rows: expect.any(Array),
        total: expect.any(Number)
    })
})