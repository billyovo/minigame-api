import { isValidObjectID, isValidMinecraftPlayerName, isValidNews } from "../utils/validators.js";

import assert from 'assert';
describe('Valid Object ID', function () {
    it('is valid object id', function () {
      assert.equal(isValidObjectID('640ea7995947842c3f584296'), true);
    });
    it('is NOT valid object id: not 24 characters', function () {
      assert.equal(isValidObjectID('640ea7995947842c3f58429'), false);
    });
    it('is NOT valid object id: special symbol', function () {
      assert.equal(isValidObjectID('640ea7995947842^f58429'), false);
    });
    it('is NOT valid object id: empty string', function () {
      assert.equal(isValidObjectID(''), false);
    }
    );

});

describe('Valid minecraft name', ()=>{
  it('is valid minecraft name', function(){
    assert.equal(isValidMinecraftPlayerName("billyovo"), true);
  })
  it('is not valid minecraft name', function(){
    assert.equal(isValidMinecraftPlayerName("a^5baw"), false);
  })
  it('is not valid minecraft name', function(){
    assert.equal(isValidMinecraftPlayerName(""), false);
  })
})

describe('Valid news', ()=>{
  it('it is valid news object', function(){
    const news = {
      title: "test",
      content: "test",
      images: ["test"],
      publish_date: "2021-01-01"
    }
    assert.equal(isValidNews(news), true);
  })
  it('it is NOT valid news object: extra attribute', function(){
    const news = {
      title: "test",
      content: "test",
      images: ["test"],
      publish_date: "2021-01-01",
      extra: "test"
    }
    assert.equal(isValidNews(news), false);
  }
  )
  it('it is NOT valid news object: missing attribute', function(){
    const news = {
      title: "test",
      content: "test",
      images: ["test"],
    }
    assert.equal(isValidNews(news), false);
  })
  it('it is NOT valid news object: empty object', function(){
    const news = {}
    assert.equal(isValidNews(news), false);
  })
})