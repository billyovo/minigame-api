import events from '../assets/event.json' assert { type: "json" };
const eventMapping = new Map();

events.forEach((event)=>{
    eventMapping.set(event.id,event.title);
    eventMapping.set(event.title, event.id);
})

export function getEventNameOrID(event){
  return eventMapping.get(event);
 }

export function getServerName(name){
    if(name === "survival") return "生存";
    if(name === "skyblock") return "空島";
    return "all";
}