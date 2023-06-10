import rrule from 'rrule';
import { DateTime } from 'luxon';
import events from "../assets/event.json" assert {type: "json"};

export let eventsDateMap = updateEvents();

export function executeUpdateEvents(){
    eventsDateMap = updateEvents();
}

export function updateEvents(){
    let eventsDateMap = {};
    const today = DateTime.now().startOf("day");
    const tomorrow = DateTime.now().plus({days: 1}).startOf("day");

    let nearestEvent = null;
    let nearestDate = null;

	events.forEach((event)=>{
        //fix rule, get time
        const fixedRule = 'DTSTART;TZID=Asia/Hong_Kong:'+today.toFormat('yyyyLLdd')+'T'+today.toFormat('HHmm00')+'\nRRULE:'+event.rrule;
        const eventRule = rrule.rrulestr(fixedRule);
        let eventDate = eventRule.after(today.toJSDate(),true);
        eventDate = DateTime.fromJSDate(eventDate).set({hours: 21, minutes: 0});

        //push into map
        eventsDateMap[event.id] = {
            title: event.title,
            id: event.id,
            date: eventDate,
            emote: event.emote,
            imageurl: event.imageurl
        }

        //search for nearest
        if(!nearestEvent || (nearestDate > eventDate)){
            nearestEvent = event.id;
            nearestDate = eventDate;
        }
        
    
        //search for today and tmr
    if(today.ordinal === eventDate.ordinal){
        Object.defineProperty(eventsDateMap, 'today',{
            get: function(){
                return eventsDateMap[event.id];
            }
        })
     }
    if(tomorrow.ordinal === eventDate.ordinal){
        Object.defineProperty(eventsDateMap, 'tomorrow',{
            get: function(){
                return eventsDateMap[event.id];
            }
        })
     }
	})

    Object.defineProperty(eventsDateMap, 'nearest',{
        get: function(){
            return eventsDateMap[nearestEvent];
        }
    })
    
  return eventsDateMap;
}