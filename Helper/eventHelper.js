const events = require('../assets/event.json');
const eventMapping = new Map();

eventMapping.set('all','');
events.forEach((event)=>{
    eventMapping.set(event.id,event.title);
})
module.exports= {
    findEventID: function(eventID){
        return eventMapping.get(eventID);
    }
}