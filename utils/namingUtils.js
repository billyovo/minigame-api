import events from '../assets/event.json' assert { type: "json" };
const eventMapping = new Map();

events.forEach((event)=>{
    eventMapping.set(event.id,event.title);
})

export function getEventName(eventID){
  return eventMapping.get(eventID);
 }

export function getServerName(name){
    if(name === "survival") return "生存";
    if(name === "skyblock") return "空島";
    return "all";
}